"""
services/converter.py
======================
Converts local video files (uploaded by users) into MP3 audio using FFmpeg.

Why a separate service? The downloader service handles URLs via yt-dlp;
this one only works with files already sitting on disk (from uploads).
"""

import logging
import shutil
import subprocess
from pathlib import Path
from typing import Optional

from app.services.downloader import FFMPEG_PATH

logger = logging.getLogger(__name__)


def _find_ffprobe() -> Optional[str]:
    """
    Locate the ffprobe executable next to the detected ffmpeg,
    falling back to a PATH lookup. Used to read video duration.
    """
    if FFMPEG_PATH:
        sibling_dir = Path(FFMPEG_PATH).parent
        for name in ("ffprobe", "ffprobe.exe"):
            candidate = sibling_dir / name
            if candidate.is_file():
                return str(candidate)

    found = shutil.which("ffprobe")
    if found:
        return found
    return None


FFPROBE_PATH = _find_ffprobe()


def probe_duration(input_path: str) -> Optional[float]:
    """
    Read a video's duration (in seconds) using ffprobe.

    Returns:
        Duration in seconds, or None if it can't be determined
        (missing ffprobe / unreadable file).
    """
    if not FFPROBE_PATH:
        return None
    try:
        proc = subprocess.run(
            [FFPROBE_PATH, "-v", "error",
             "-show_entries", "format=duration",
             "-of", "default=noprint_wrappers=1:nokey=1",
             input_path],
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            timeout=30,
        )
        if proc.returncode == 0:
            text = proc.stdout.strip().decode("utf-8", errors="ignore")
            return float(text)
    except Exception:
        return None
    return None


def extract_audio_mp3(input_path: str, output_dir: str = None) -> str:
    """
    Extract the audio track from a video file and save it as MP3.

    Args:
        input_path:  Path to the uploaded video file on disk.
        output_dir:  Directory where the MP3 should be written.
                     Defaults to the input file's directory.

    Returns:
        Path to the generated .mp3 file.

    Raises:
        ValueError: If FFmpeg is missing, the file is invalid, or extraction fails.
    """
    if not FFMPEG_PATH:
        raise ValueError(
            "FFmpeg is not installed on the server. Audio extraction is unavailable."
        )

    in_path  = Path(input_path)
    out_dir  = Path(output_dir) if output_dir else in_path.parent
    out_path = out_dir / f"{in_path.stem}_audio.mp3"

    cmd = [
        FFMPEG_PATH,
        "-y",               # overwrite output
        "-i", str(in_path), # input video
        "-vn",              # no video stream
        "-acodec", "libmp3lame",
        "-q:a", "2",        # ~192kbps VBR, good quality
        str(out_path),
    ]

    logger.info(f"🎧 Extracting audio: {in_path.name} → {out_path.name}")
    try:
        proc = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, timeout=7200)
    except subprocess.TimeoutExpired:
        raise ValueError("Audio extraction timed out. The video may be too long.")
    except Exception as e:
        raise ValueError(f"Failed to run FFmpeg: {e}")

    if proc.returncode != 0 or not out_path.exists() or out_path.stat().st_size == 0:
        tail = (proc.stderr or b"").decode("utf-8", errors="ignore")[-400:]
        logger.error(f"🎧 FFmpeg error: {tail}")
        raise ValueError("Could not extract audio. Please make sure the file is a valid video.")
    return str(out_path)