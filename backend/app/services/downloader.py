"""
services/downloader.py
=======================
Downloads media using yt-dlp and converts with FFmpeg.

FIXES APPLIED:
  1. FFmpeg path is detected at startup and passed explicitly to yt-dlp
     so it works even if the shell PATH hasn't been refreshed.
  2. ANSI color codes are stripped from yt-dlp error messages before
     they reach the frontend.
  3. Format selectors fall back gracefully when FFmpeg is absent —
     instead of aborting, we download a single pre-merged stream.
"""

import os
import re
import uuid
import shutil
import asyncio
import logging
from pathlib import Path
from typing import Tuple, Optional

import yt_dlp

from app.config.settings import DOWNLOADS_DIR
from app.models.schemas import VideoQuality, DownloadFormat
from app.utils.helpers import safe_filename, safe_delete_file, is_valid_url

logger = logging.getLogger(__name__)

# ── Detect FFmpeg once at import time ─────────────────────────────────────────
# shutil.which() searches PATH for an executable, like the `which` command.
# We also check common Windows install locations as a fallback.

def _find_ffmpeg() -> Optional[str]:
    """
    Find the ffmpeg executable path.
    Returns the full path string, or None if not found.
    """
    # 1. Check PATH (works after a shell restart)
    found = shutil.which("ffmpeg")
    if found:
        return found

    # 2. Check common WinGet install location (works without shell restart)
    winget_base = Path(os.environ.get("LOCALAPPDATA", "")) / "Microsoft" / "WinGet" / "Packages"
    if winget_base.exists():
        for pkg_dir in winget_base.iterdir():
            if "FFmpeg" in pkg_dir.name or "ffmpeg" in pkg_dir.name:
                candidate = list(pkg_dir.rglob("ffmpeg.exe"))
                if candidate:
                    return str(candidate[0])

    # 3. Check common manual install locations
    common_paths = [
        r"C:\ffmpeg\bin\ffmpeg.exe",
        r"C:\Program Files\ffmpeg\bin\ffmpeg.exe",
        r"C:\tools\ffmpeg\bin\ffmpeg.exe",
    ]
    for p in common_paths:
        if os.path.isfile(p):
            return p

    return None


FFMPEG_PATH = _find_ffmpeg()

if FFMPEG_PATH:
    logger.info(f"✅ FFmpeg found at: {FFMPEG_PATH}")
else:
    logger.warning(
        "⚠️  FFmpeg not found. Video merging and MP3 conversion will be limited. "
        "Install FFmpeg: https://ffmpeg.org/download.html"
    )


# ── ANSI color code stripper ───────────────────────────────────────────────────
# yt-dlp adds terminal color codes like \x1b[0;31m to its error messages.
# These look like garbage in JSON responses. We strip them out.
_ANSI_ESCAPE = re.compile(r"\x1b\[[0-9;]*m")

def _clean_error(msg: str) -> str:
    """Remove ANSI escape codes and 'ERROR:' prefix from yt-dlp messages."""
    msg = _ANSI_ESCAPE.sub("", msg)          # strip color codes
    msg = re.sub(r"^ERROR:\s*", "", msg)     # strip leading "ERROR: "
    return msg.strip()


# ── Format selectors ──────────────────────────────────────────────────────────
# When FFmpeg IS available: download best video + best audio separately, merge.
# When FFmpeg is NOT available: download a single pre-merged stream (lower quality).

def _video_format(quality: VideoQuality) -> str:
    """
    Return the yt-dlp format selector string for a given quality.

    With FFmpeg:    "bestvideo[height<=720]+bestaudio/best[height<=720]"
    Without FFmpeg: "best[height<=720]/best"  (single stream, no merging needed)
    """
    if FFMPEG_PATH:
        selectors = {
            VideoQuality.BEST:  "bestvideo+bestaudio/best",
            VideoQuality.P1080: "bestvideo[height<=1080]+bestaudio/best[height<=1080]/best",
            VideoQuality.P720:  "bestvideo[height<=720]+bestaudio/best[height<=720]/best",
            VideoQuality.P360:  "bestvideo[height<=360]+bestaudio/best[height<=360]/best",
        }
    else:
        # No FFmpeg → use single-stream formats only (no merging required)
        selectors = {
            VideoQuality.BEST:  "best",
            VideoQuality.P1080: "best[height<=1080]/best",
            VideoQuality.P720:  "best[height<=720]/best",
            VideoQuality.P360:  "best[height<=360]/best",
        }
    return selectors.get(quality, selectors[VideoQuality.BEST])


# ── Public API ────────────────────────────────────────────────────────────────

async def download_media(
    url: str,
    quality: VideoQuality,
    fmt: DownloadFormat,
) -> Tuple[str, str, str]:
    """
    Download media and return (file_path, filename, mime_type).
    Runs yt-dlp in a background thread so the async server stays responsive.
    """
    if not is_valid_url(url):
        raise ValueError(f"Invalid URL: {url}")

    logger.info(f"⬇️  Download start: {url} | quality={quality} | format={fmt}")

    download_id = str(uuid.uuid4())[:8]
    loop = asyncio.get_event_loop()

    try:
        result = await loop.run_in_executor(
            None, _run_download, url, quality, fmt, download_id
        )
        return result

    except yt_dlp.utils.DownloadError as e:
        msg = _clean_error(str(e))
        logger.error(f"yt-dlp DownloadError: {msg}")

        # Give user-friendly messages for common errors
        low = msg.lower()
        if "private" in low:
            raise ValueError("This content is private and cannot be downloaded.")
        if "not available" in low or "unavailable" in low:
            raise ValueError("This content is not available or has been removed.")
        if "sign in" in low or "login" in low:
            raise ValueError("This content requires login and cannot be downloaded.")
        if "ffmpeg" in low:
            raise ValueError(
                "FFmpeg is required for this download. "
                "Please install FFmpeg: https://ffmpeg.org/download.html"
            )
        raise ValueError(f"Download failed: {msg[:300]}")

    except ValueError:
        raise  # re-raise our own clean errors

    except Exception as e:
        msg = _clean_error(str(e))
        logger.error(f"Unexpected download error: {msg}", exc_info=True)
        raise ValueError(f"Download failed: {msg[:300]}")


# ── Internal download runner ──────────────────────────────────────────────────

def _run_download(
    url: str,
    quality: VideoQuality,
    fmt: DownloadFormat,
    download_id: str,
) -> Tuple[str, str, str]:
    """Synchronous — runs in a thread pool."""

    if fmt in (DownloadFormat.AUDIO, DownloadFormat.MP3):
        ydl_opts  = _audio_opts(download_id)
        expect_ext = "mp3"
        mime_type  = "audio/mpeg"
    else:
        ydl_opts  = _video_opts(quality, download_id)
        expect_ext = "mp4"
        mime_type  = "video/mp4"

    logger.info(f"🎬 yt-dlp format: {ydl_opts['format']}")

    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
        info  = ydl.extract_info(url, download=True)
        title = info.get("title", "download")

    file_path = _find_file(download_id, expect_ext)
    if not file_path:
        raise ValueError("Download completed but output file was not found on server.")

    # Determine actual extension (may differ if FFmpeg wasn't available)
    actual_ext = Path(file_path).suffix.lstrip(".")
    clean_name = safe_filename(title)
    filename   = f"{clean_name}.{actual_ext}"

    # Update mime type if extension changed
    if actual_ext != expect_ext:
        mime_type = "audio/mpeg" if actual_ext == "mp3" else "video/mp4"

    logger.info(f"✅ Done: {file_path} ({os.path.getsize(file_path):,} bytes)")
    return file_path, filename, mime_type


# ── yt-dlp option builders ────────────────────────────────────────────────────

def _common_opts(download_id: str) -> dict:
    """Options shared by both video and audio downloads."""
    opts = {
        "outtmpl":        str(DOWNLOADS_DIR / f"{download_id}.%(ext)s"),
        "quiet":          True,
        "no_warnings":    True,
        "no_color":       True,   # ← disables ANSI color codes in yt-dlp output
        "writesubtitles": False,
        "writethumbnail": False,
        "writeinfojson":  False,
        "socket_timeout": 60,
        "http_headers": {
            "User-Agent": (
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
                "AppleWebKit/537.36 (KHTML, like Gecko) "
                "Chrome/120.0.0.0 Safari/537.36"
            )
        },
    }
    # Tell yt-dlp exactly where FFmpeg lives so it doesn't rely on PATH
    if FFMPEG_PATH:
        ffmpeg_dir = str(Path(FFMPEG_PATH).parent)
        opts["ffmpeg_location"] = ffmpeg_dir
    return opts


def _video_opts(quality: VideoQuality, download_id: str) -> dict:
    """yt-dlp options for video download."""
    opts = _common_opts(download_id)
    opts["format"] = _video_format(quality)

    if FFMPEG_PATH:
        # Merge video+audio into a single MP4
        opts["merge_output_format"] = "mp4"
        opts["postprocessors"] = [{"key": "FFmpegMetadata", "add_metadata": True}]
    # If no FFmpeg, yt-dlp downloads a pre-merged stream — no postprocessor needed

    return opts


def _audio_opts(download_id: str) -> dict:
    """yt-dlp options for audio/MP3 download."""
    opts = _common_opts(download_id)
    opts["format"] = "bestaudio/best"

    if FFMPEG_PATH:
        # Convert to MP3 using FFmpeg
        opts["postprocessors"] = [
            {
                "key":              "FFmpegExtractAudio",
                "preferredcodec":   "mp3",
                "preferredquality": "192",
            },
            {"key": "FFmpegMetadata", "add_metadata": True},
        ]
    else:
        # No FFmpeg — download native audio (m4a/webm), still playable
        logger.warning("FFmpeg not found — audio will be in native format, not MP3")

    return opts


# ── File finder ───────────────────────────────────────────────────────────────

def _find_file(download_id: str, preferred_ext: str) -> Optional[str]:
    """
    Find the file yt-dlp wrote to disk.
    yt-dlp may use a different extension than expected, so we search broadly.
    """
    base = Path(DOWNLOADS_DIR)

    # Try exact match first
    exact = base / f"{download_id}.{preferred_ext}"
    if exact.exists() and exact.stat().st_size > 0:
        return str(exact)

    # Search for any file whose stem matches our download_id
    for f in base.iterdir():
        if f.stem == download_id and f.stat().st_size > 0:
            logger.info(f"Found file with ext={f.suffix}: {f.name}")
            return str(f)

    return None
