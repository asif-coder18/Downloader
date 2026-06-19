"""
utils/helpers.py
================
Small helper functions used across the backend.

These are pure utility functions — no business logic here.
"""

import re
import os
import time
import logging
from pathlib import Path
from typing import Optional

logger = logging.getLogger(__name__)


# ── Platform Detection ─────────────────────────────────────────────────────────

# Map of URL patterns → platform names
# re.compile() pre-compiles the regex for speed
PLATFORM_PATTERNS = [
    (re.compile(r"youtube\.com|youtu\.be",       re.I), "YouTube"),
    (re.compile(r"facebook\.com|fb\.watch",      re.I), "Facebook"),
    (re.compile(r"instagram\.com",               re.I), "Instagram"),
    (re.compile(r"tiktok\.com",                  re.I), "TikTok"),
    (re.compile(r"twitter\.com|x\.com",          re.I), "Twitter/X"),
    (re.compile(r"vimeo\.com",                   re.I), "Vimeo"),
    (re.compile(r"reddit\.com",                  re.I), "Reddit"),
    (re.compile(r"pinterest\.com",               re.I), "Pinterest"),
]

def detect_platform(url: str) -> str:
    """
    Detect which social media platform a URL belongs to.
    Returns the platform name, or "Unknown" if not recognized.

    Example:
        detect_platform("https://youtube.com/watch?v=abc") → "YouTube"
    """
    for pattern, name in PLATFORM_PATTERNS:
        if pattern.search(url):
            return name
    return "Unknown"


def is_valid_url(url: str) -> bool:
    """
    Basic URL validation — checks if it starts with http:// or https://
    and has a domain name.

    We don't use a complex regex here because yt-dlp will give a better
    error message if the URL is invalid.
    """
    url = url.strip()
    if not url.startswith(("http://", "https://")):
        return False
    # Must have at least one dot in the domain
    try:
        from urllib.parse import urlparse
        parsed = urlparse(url)
        return bool(parsed.netloc and "." in parsed.netloc)
    except Exception:
        return False


# ── Duration Formatting ────────────────────────────────────────────────────────

def format_duration(seconds: Optional[int]) -> Optional[str]:
    """
    Convert seconds to a human-readable duration string.

    Examples:
        format_duration(65)   → "1:05"
        format_duration(3661) → "1:01:01"
        format_duration(None) → None
    """
    if seconds is None:
        return None
    seconds = int(seconds)
    hours   = seconds // 3600
    minutes = (seconds % 3600) // 60
    secs    = seconds % 60

    if hours > 0:
        return f"{hours}:{minutes:02d}:{secs:02d}"
    return f"{minutes}:{secs:02d}"


# ── View Count Formatting ──────────────────────────────────────────────────────

def format_view_count(count: Optional[int]) -> Optional[str]:
    """
    Format a large number into a readable string.

    Examples:
        format_view_count(1_500_000) → "1.5M"
        format_view_count(25_000)    → "25K"
        format_view_count(500)       → "500"
    """
    if count is None:
        return None
    if count >= 1_000_000:
        return f"{count / 1_000_000:.1f}M"
    if count >= 1_000:
        return f"{count / 1_000:.0f}K"
    return str(count)


# ── File Cleanup ───────────────────────────────────────────────────────────────

def safe_delete_file(filepath: str, delay_seconds: int = 30) -> None:
    """
    Delete a file after a short delay.

    Why a delay? The browser needs time to finish downloading the file
    before we delete it from the server. 30 seconds is usually enough.

    This runs in a background thread so it doesn't block the response.
    """
    import threading

    def _delete():
        time.sleep(delay_seconds)
        try:
            if os.path.exists(filepath):
                os.remove(filepath)
                logger.info(f"🗑️  Deleted temp file: {filepath}")
        except Exception as e:
            logger.warning(f"Could not delete {filepath}: {e}")

    thread = threading.Thread(target=_delete, daemon=True)
    thread.start()


def cleanup_old_files(directory: str, max_age_seconds: int = 600) -> None:
    """
    Delete all files in a directory that are older than max_age_seconds.

    Called on startup and periodically to prevent disk from filling up.
    """
    now = time.time()
    dir_path = Path(directory)

    if not dir_path.exists():
        return

    for file in dir_path.iterdir():
        if file.is_file():
            age = now - file.stat().st_mtime
            if age > max_age_seconds:
                try:
                    file.unlink()
                    logger.info(f"🗑️  Cleaned up old file: {file.name}")
                except Exception as e:
                    logger.warning(f"Could not clean up {file}: {e}")


# ── Safe Filename ──────────────────────────────────────────────────────────────

def safe_filename(title: str, max_length: int = 80) -> str:
    """
    Convert a video title into a safe filename.

    Removes characters that are illegal in filenames on Windows/Mac/Linux.

    Example:
        safe_filename("My Video: Part 1/2") → "My_Video_Part_12"
    """
    # Remove characters that are not letters, numbers, spaces, hyphens, underscores
    safe = re.sub(r'[^\w\s\-]', '', title)
    # Replace spaces with underscores
    safe = re.sub(r'\s+', '_', safe.strip())
    # Truncate to max_length
    return safe[:max_length] or "download"
