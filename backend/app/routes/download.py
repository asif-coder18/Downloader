"""
routes/download.py
===================
Download endpoints — two-step token flow.

WHY TWO STEPS INSTEAD OF DIRECT FileResponse?
===============================================
The old approach (POST → FileResponse) had these problems:

  Problem 1 — Browser RAM
    The frontend had to do: fetch() → response.blob() → createObjectURL
    This loads the ENTIRE file into browser RAM before saving.
    A 500MB video = 500MB of RAM used. Crashes on mobile.

  Problem 2 — Timeout
    fetch() has no built-in timeout. yt-dlp can take 60+ seconds.
    The browser connection can silently drop.

  Problem 3 — Progress
    With a direct blob download, you can't show real progress.

THE NEW TWO-STEP FLOW:
========================
  Step 1: POST /api/download/video
    - Backend downloads the file with yt-dlp (this takes time)
    - Returns JSON: { "token": "abc123", "filename": "video.mp4", "size": 12345678 }
    - The file is saved on the server temporarily

  Step 2: GET /api/file/{token}
    - Frontend navigates to this URL (window.location or anchor tag)
    - Backend streams the file directly to the browser
    - Browser shows its NATIVE download progress bar
    - File saves to Downloads folder automatically
    - No RAM buffering. Works on mobile. Works on all browsers.

  Cleanup:
    - File is deleted 5 minutes after the GET request
    - Tokens expire after 10 minutes even if not downloaded
"""

import os
import uuid
import time
import logging
import threading
from pathlib import Path
from typing import Dict

from fastapi import APIRouter, HTTPException
from fastapi.responses import FileResponse, JSONResponse

from app.models.schemas import DownloadRequest, DownloadFormat
from app.services.downloader import download_media
from app.utils.helpers import safe_delete_file

logger = logging.getLogger(__name__)
router = APIRouter()

# ── In-memory token store ─────────────────────────────────────────────────────
# Maps token → { file_path, filename, mime_type, created_at }
# In production you'd use Redis, but for a single-server app this is fine.
_token_store: Dict[str, dict] = {}
_store_lock = threading.Lock()

TOKEN_TTL = 600  # 10 minutes


def _store_token(file_path: str, filename: str, mime_type: str) -> str:
    """Create a download token and store file info."""
    token = str(uuid.uuid4()).replace("-", "")
    with _store_lock:
        _token_store[token] = {
            "file_path": file_path,
            "filename":  filename,
            "mime_type": mime_type,
            "created_at": time.time(),
        }
    # Schedule token expiry
    threading.Timer(TOKEN_TTL, lambda: _expire_token(token)).start()
    return token


def _expire_token(token: str):
    """Remove an expired token and delete its file."""
    with _store_lock:
        entry = _token_store.pop(token, None)
    if entry:
        safe_delete_file(entry["file_path"], delay_seconds=0)
        logger.info(f"🗑️  Token expired: {token}")


def _consume_token(token: str) -> dict | None:
    """Retrieve and remove a token (one-time use)."""
    with _store_lock:
        return _token_store.pop(token, None)


# ── POST /download/video ──────────────────────────────────────────────────────

@router.post("/download/video", summary="Prepare video download")
async def download_video_endpoint(request: DownloadRequest):
    """
    Step 1 of the two-step download flow.

    Downloads the video with yt-dlp, saves it to disk,
    and returns a one-time download token.

    Request:  { "url": "...", "quality": "720p", "format": "video" }
    Response: { "token": "abc123", "filename": "video.mp4", "size": 12345678 }
    """
    try:
        logger.info(f"📥 Video request: {request.url} | quality={request.quality}")

        file_path, filename, mime_type = await download_media(
            url=request.url,
            quality=request.quality,
            fmt=DownloadFormat.VIDEO,
        )

        token     = _store_token(file_path, filename, mime_type)
        file_size = os.path.getsize(file_path)

        logger.info(f"✅ Video ready: {filename} ({file_size:,} bytes) | token={token[:8]}…")

        return JSONResponse({
            "token":    token,
            "filename": filename,
            "size":     file_size,
            "mime":     mime_type,
        })

    except ValueError as e:
        logger.warning(f"Video download error: {e}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Video download server error: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Download failed. Please try again.")


# ── POST /download/audio ──────────────────────────────────────────────────────

@router.post("/download/audio", summary="Prepare audio/MP3 download")
async def download_audio_endpoint(request: DownloadRequest):
    """
    Step 1 of the two-step download flow for audio.

    Request:  { "url": "...", "quality": "best", "format": "mp3" }
    Response: { "token": "abc123", "filename": "audio.mp3", "size": 4567890 }
    """
    try:
        logger.info(f"📥 Audio request: {request.url}")

        file_path, filename, mime_type = await download_media(
            url=request.url,
            quality=request.quality,
            fmt=DownloadFormat.MP3,
        )

        token     = _store_token(file_path, filename, mime_type)
        file_size = os.path.getsize(file_path)

        logger.info(f"✅ Audio ready: {filename} ({file_size:,} bytes) | token={token[:8]}…")

        return JSONResponse({
            "token":    token,
            "filename": filename,
            "size":     file_size,
            "mime":     mime_type,
        })

    except ValueError as e:
        logger.warning(f"Audio download error: {e}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Audio download server error: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Audio download failed. Please try again.")


# ── GET /file/{token} ─────────────────────────────────────────────────────────

@router.get("/file/{token}", summary="Stream file to browser")
async def serve_file_endpoint(token: str):
    """
    Step 2 of the two-step download flow.

    The frontend navigates to this URL (via anchor tag or window.location).
    The browser receives the file with Content-Disposition: attachment,
    which triggers the native browser download dialog.

    This endpoint:
    - Validates the token
    - Streams the file to the browser
    - Schedules the file for deletion after 5 minutes
    - Removes the token (one-time use)
    """
    entry = _consume_token(token)

    if not entry:
        raise HTTPException(
            status_code=404,
            detail="Download link expired or invalid. Please generate a new download."
        )

    file_path = entry["file_path"]
    filename  = entry["filename"]
    mime_type = entry["mime_type"]

    if not os.path.exists(file_path):
        raise HTTPException(
            status_code=404,
            detail="File no longer exists on server. Please download again."
        )

    # Schedule deletion after 5 minutes (enough time for the browser to finish)
    safe_delete_file(file_path, delay_seconds=300)

    logger.info(f"📤 Serving file: {filename} to browser")

    # FileResponse streams the file to the browser.
    # Content-Disposition: attachment tells the browser to SAVE the file,
    # not display it in a new tab.
    return FileResponse(
        path=file_path,
        filename=filename,
        media_type=mime_type,
        headers={
            # "attachment" = save as file (not open in browser)
            "Content-Disposition": f'attachment; filename="{filename}"',
            # These headers allow the browser to show download progress
            "Accept-Ranges": "bytes",
            # Cache control: don't cache download links
            "Cache-Control": "no-cache, no-store, must-revalidate",
        }
    )
