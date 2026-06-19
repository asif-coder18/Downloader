"""
models/schemas.py
=================
Pydantic models define the shape of data going IN and OUT of our API.

Think of them like TypeScript interfaces — they validate data automatically.
If a request sends wrong data, FastAPI returns a clear error message.

Pydantic = Python's data validation library (built into FastAPI)
"""

from pydantic import BaseModel, HttpUrl, field_validator
from typing import Optional, List
from enum import Enum


# ── Enums (fixed choice lists) ─────────────────────────────────────────────────

class VideoQuality(str, Enum):
    """
    The quality options users can choose from.
    'best' = highest available quality
    """
    BEST  = "best"
    P1080 = "1080p"
    P720  = "720p"
    P360  = "360p"


class DownloadFormat(str, Enum):
    """
    What format the user wants to download.
    """
    VIDEO = "video"
    AUDIO = "audio"
    MP3   = "mp3"


# ── Request models (what the frontend SENDS to us) ────────────────────────────

class AnalyzeRequest(BaseModel):
    """
    POST /analyze
    Frontend sends: { "url": "https://youtube.com/watch?v=..." }
    """
    url: str  # We validate this manually in the service

    @field_validator("url")
    @classmethod
    def url_must_not_be_empty(cls, v):
        if not v or not v.strip():
            raise ValueError("URL cannot be empty")
        return v.strip()


class DownloadRequest(BaseModel):
    """
    POST /download/video  or  POST /download/audio
    Frontend sends: { "url": "...", "quality": "720p", "format": "video" }
    """
    url: str
    quality: VideoQuality = VideoQuality.BEST
    format: DownloadFormat = DownloadFormat.VIDEO

    @field_validator("url")
    @classmethod
    def url_must_not_be_empty(cls, v):
        if not v or not v.strip():
            raise ValueError("URL cannot be empty")
        return v.strip()

    @field_validator("quality", mode="before")
    @classmethod
    def normalize_quality(cls, v):
        """
        Accept quality values in any case/format:
          "Best" → "best"
          "720P" → "720p"
          "1080" → "1080p"  (add 'p' if missing)
        """
        if isinstance(v, str):
            v = v.lower().strip()
            # Add 'p' suffix if it's a number without it
            if v.isdigit():
                v = v + "p"
        return v


# ── Response models (what we SEND BACK to the frontend) ───────────────────────

class MediaFormat(BaseModel):
    """A single available format/quality for a video."""
    format_id: str
    quality:   str
    ext:       str          # file extension: mp4, webm, etc.
    filesize:  Optional[int] = None  # bytes, may be unknown


class MediaInfo(BaseModel):
    """
    Full media information returned by POST /analyze
    The frontend uses this to show the preview card.
    """
    title:      str
    platform:   str
    thumbnail:  Optional[str] = None   # URL to thumbnail image
    duration:   Optional[str] = None   # e.g. "3:45"
    uploader:   Optional[str] = None   # channel/username
    view_count: Optional[str] = None   # formatted view count
    formats:    List[str] = []         # available download types
    qualities:  List[str] = []         # available quality options


class ErrorResponse(BaseModel):
    """Standard error response shape."""
    error:   str
    detail:  Optional[str] = None
