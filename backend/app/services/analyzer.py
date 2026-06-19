"""
services/analyzer.py
=====================
This service uses yt-dlp to fetch information about a video URL
WITHOUT downloading the actual video file.

HOW yt-dlp WORKS (beginner explanation):
=========================================
yt-dlp is a command-line tool AND a Python library.
When you give it a URL, it:
  1. Detects which website the URL is from
  2. Sends requests to that website's API (or scrapes the page)
  3. Returns metadata: title, thumbnail, duration, available formats, etc.

We use it as a Python library here (import yt_dlp) so we don't need
to run it as a separate process.

The key option is:  'skip_download': True
This tells yt-dlp: "Just give me the info, don't download anything yet."
"""

import yt_dlp
import logging
from typing import Dict, Any

from app.models.schemas import MediaInfo
from app.utils.helpers import (
    detect_platform,
    format_duration,
    format_view_count,
    is_valid_url,
)

logger = logging.getLogger(__name__)


# ── yt-dlp options for info extraction only ───────────────────────────────────
# These options tell yt-dlp what to do when we call extract_info()
YDL_INFO_OPTIONS = {
    # Don't actually download the video — just get metadata
    "skip_download": True,

    # Don't print anything to the terminal (we handle logging ourselves)
    "quiet": True,
    "no_warnings": True,
    "no_color": True,   # ← prevents ANSI escape codes in error messages

    # Don't write any files to disk during info extraction
    "writeinfojson": False,
    "writethumbnail": False,

    # Timeout settings to prevent hanging forever
    "socket_timeout": 30,

    # Some sites need a user-agent to not block requests
    "http_headers": {
        "User-Agent": (
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
            "AppleWebKit/537.36 (KHTML, like Gecko) "
            "Chrome/120.0.0.0 Safari/537.36"
        )
    },
}


async def analyze_url(url: str) -> MediaInfo:
    """
    Analyze a social media URL and return media information.

    This is an async function, but yt-dlp itself is synchronous.
    We run it in a thread pool executor so it doesn't block the server.

    Args:
        url: The social media URL to analyze

    Returns:
        MediaInfo object with title, thumbnail, duration, etc.

    Raises:
        ValueError: If the URL is invalid or unsupported
        Exception:  If yt-dlp fails to extract info
    """
    # Step 1: Basic URL validation
    if not is_valid_url(url):
        raise ValueError(f"Invalid URL: {url}")

    logger.info(f"🔍 Analyzing URL: {url}")

    # Step 2: Run yt-dlp in a thread (because it's blocking/synchronous)
    import asyncio
    loop = asyncio.get_event_loop()

    try:
        # run_in_executor runs a blocking function in a background thread
        # so our async server doesn't freeze while yt-dlp works
        info = await loop.run_in_executor(None, _extract_info, url)
    except yt_dlp.utils.DownloadError as e:
        # Strip ANSI color codes (\x1b[0;31m etc.) from yt-dlp error messages
        import re as _re
        raw = str(e)
        error_msg = _re.sub(r"\x1b\[[0-9;]*m", "", raw)
        error_msg = _re.sub(r"^ERROR:\s*", "", error_msg).strip()
        logger.error(f"yt-dlp error for {url}: {error_msg}")

        low = error_msg.lower()
        if "private" in low:
            raise ValueError("This video is private and cannot be downloaded.")
        if "not available" in low or "unavailable" in low:
            raise ValueError("This content is not available or has been removed.")
        if "sign in" in low or "login" in low:
            raise ValueError("This content requires login and cannot be downloaded.")
        raise ValueError(f"Could not fetch media info: {error_msg[:200]}")

    except Exception as e:
        logger.error(f"Unexpected error analyzing {url}: {e}")
        raise ValueError(f"Failed to analyze URL: {str(e)[:200]}")

    # Step 3: Build our MediaInfo response from yt-dlp's raw data
    return _build_media_info(url, info)


def _extract_info(url: str) -> Dict[str, Any]:
    """
    Synchronous function that calls yt-dlp to extract video info.
    This runs in a background thread (called via run_in_executor).
    """
    with yt_dlp.YoutubeDL(YDL_INFO_OPTIONS) as ydl:
        # extract_info() returns a big dictionary with everything yt-dlp knows
        # about the video. We pass download=False to skip actual downloading.
        info = ydl.extract_info(url, download=False)
        return info


def _build_media_info(url: str, info: Dict[str, Any]) -> MediaInfo:
    """
    Convert yt-dlp's raw info dictionary into our clean MediaInfo model.

    yt-dlp returns LOTS of data. We only pick what we need.
    """
    # Detect platform from URL
    platform = detect_platform(url)

    # Get title (fallback to "Unknown Title" if missing)
    title = info.get("title") or info.get("fulltitle") or "Unknown Title"

    # Get thumbnail URL
    # yt-dlp provides multiple thumbnail sizes; we take the best one
    thumbnail = info.get("thumbnail")
    if not thumbnail:
        # Sometimes thumbnails are in a list
        thumbnails = info.get("thumbnails", [])
        if thumbnails:
            thumbnail = thumbnails[-1].get("url")  # Last = usually highest res

    # Format duration from seconds to "M:SS" format
    duration_secs = info.get("duration")
    duration = format_duration(duration_secs)

    # Get uploader/channel name
    uploader = (
        info.get("uploader")
        or info.get("channel")
        or info.get("creator")
        or info.get("uploader_id")
    )

    # Format view count
    view_count = format_view_count(info.get("view_count"))

    # Determine available download formats
    # We check what formats yt-dlp found and offer appropriate buttons
    available_formats = _detect_available_formats(info)

    # Determine available quality options
    available_qualities = _detect_available_qualities(info)

    logger.info(f"✅ Analyzed: '{title}' from {platform}")

    return MediaInfo(
        title=title,
        platform=platform,
        thumbnail=thumbnail,
        duration=duration,
        uploader=uploader,
        view_count=view_count,
        formats=available_formats,
        qualities=available_qualities,
    )


def _detect_available_formats(info: Dict[str, Any]) -> list:
    """
    Determine which download formats are available for this media.
    Returns a list like ["video", "audio", "mp3"]
    """
    formats = info.get("formats", [])
    available = set()

    for fmt in formats:
        vcodec = fmt.get("vcodec", "none")
        acodec = fmt.get("acodec", "none")

        if vcodec and vcodec != "none":
            available.add("video")
        if acodec and acodec != "none":
            available.add("audio")
            available.add("mp3")  # We can always convert audio to MP3

    # If no formats found, assume video is available (yt-dlp will figure it out)
    if not available:
        available = {"video", "audio", "mp3"}

    # Check if it's a reel/short (short duration = likely a reel)
    duration = info.get("duration", 0) or 0
    if duration <= 180:  # 3 minutes or less
        available.add("reel")

    return sorted(list(available))


def _detect_available_qualities(info: Dict[str, Any]) -> list:
    """
    Determine which video qualities are available.
    Returns a list like ["best", "1080p", "720p", "360p"]
    """
    formats = info.get("formats", [])
    heights = set()

    for fmt in formats:
        height = fmt.get("height")
        if height:
            heights.add(height)

    qualities = ["best"]  # Always offer "best"

    if any(h >= 1080 for h in heights):
        qualities.append("1080p")
    if any(h >= 720 for h in heights):
        qualities.append("720p")
    if any(h >= 360 for h in heights):
        qualities.append("360p")

    # If no height info, offer all options (yt-dlp will pick what's available)
    if len(qualities) == 1:
        qualities = ["best", "1080p", "720p", "360p"]

    return qualities
