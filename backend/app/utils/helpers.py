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
    URL validation — checks format and restricts to known social media domains.
    Prevents SSRF attacks by blocking internal/private addresses.
    """
    url = url.strip()
    if not url.startswith(("http://", "https://")):
        return False
    try:
        from urllib.parse import urlparse
        parsed = urlparse(url)
        if not parsed.netloc or "." not in parsed.netloc:
            return False
        # Allowlist of supported domains — blocks SSRF to internal addresses
        ALLOWED_DOMAINS = re.compile(
            r"(youtube\.com|youtu\.be|instagram\.com|tiktok\.com|"
            r"twitter\.com|x\.com|facebook\.com|fb\.watch|"
            r"vimeo\.com|reddit\.com|pinterest\.com)",
            re.I
        )
        return bool(ALLOWED_DOMAINS.search(parsed.netloc))
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
    Handles Unicode titles (Bengali, Arabic, etc.) by keeping them intact
    but removing filesystem-illegal characters.
    """
    if not title:
        return "download"

    # Remove characters illegal in filenames on Windows/Mac/Linux
    # Keep Unicode letters/numbers (Bengali, Arabic, etc. are fine on disk)
    safe = re.sub(r'[<>:"/\\|?*\x00-\x1f]', '', title)
    safe = safe.replace("..", "")  # prevent path traversal
    # Replace multiple spaces/underscores with single underscore
    safe = re.sub(r'[\s]+', '_', safe.strip())
    # Remove leading/trailing underscores and dots
    safe = safe.strip('_.')
    # Truncate to max_length
    return safe[:max_length] or "download"
