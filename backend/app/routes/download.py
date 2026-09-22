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
import asyncio
import logging
import threading
from pathlib import Path
from typing import Dict

from fastapi import APIRouter, HTTPException, UploadFile, File
from fastapi.responses import FileResponse, JSONResponse

from app.config.settings import TEMP_DIR, MAX_FILE_SIZE_BYTES, MAX_VIDEO_DURATION_SECONDS
from app.models.schemas import DownloadRequest, DownloadFormat
from app.services.converter import extract_audio_mp3, probe_duration
from app.services.downloader import download_media
from app.utils.helpers import safe_delete_file, safe_filename

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


# ── POST /upload/audio ─────────────────────────────────────────────────────────

# Accepted extensions — any container that FFmpeg can read
_ALLOWED_VIDEO_EXTS = {".mp4", ".mkv", ".mov", ".avi", ".webm", ".flv", ".wmv", ".m4v", ".mpg", ".mpeg", ".3gp", ".ts", ".ogv"}
_MAX_UPLOAD_BYTES = MAX_FILE_SIZE_BYTES  # same 2GB cap as yt-dlp downloads


@router.post("/upload/audio", summary="Convert uploaded video to MP3 audio")
async def upload_audio_endpoint(file: UploadFile = File(...)):
    """
    Step 1 of the two-step download flow for uploaded videos.

    Accepts any video file, extracts its audio with FFmpeg,
    saves the MP3 on the server, and returns a one-time download token.

    Request:  multipart/form-data with field "file" (any video file)
    Response: { "token": "abc123", "filename": "audio.mp3", "size": 4567890 }
    """
    original_name = file.filename or "video.mp4"
    ext = Path(original_name).suffix.lower() or ".mp4"

    if ext not in _ALLOWED_VIDEO_EXTS:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file type '{ext}'. Please upload a video (mp4, mkv, mov, avi, webm, etc.).",
        )

    work_id  = str(uuid.uuid4())[:10]
    temp_vid = TEMP_DIR / f"upload_{work_id}{ext}"

    # Stream upload to disk in chunks so we don't hold the whole file in RAM
    try:
        size = 0
        with open(temp_vid, "wb") as out:
            while True:
                chunk = await file.read(1024 * 1024)  # 1MB chunks
                if not chunk:
                    break
                size += len(chunk)
                if size > _MAX_UPLOAD_BYTES:
                    raise HTTPException(
                        status_code=413,
                        detail=f"File exceeds the {MAX_FILE_SIZE_BYTES // (1024 * 1024)}MB size limit.",
                    )
                out.write(chunk)
    finally:
        await file.close()

    if size == 0:
        safe_delete_file(str(temp_vid), delay_seconds=0)
        raise HTTPException(status_code=400, detail="Uploaded file is empty.")

    # ── Duration limit: reject videos longer than 2 hours ──
    duration = await asyncio.to_thread(probe_duration, str(temp_vid))
    if duration is not None and duration > MAX_VIDEO_DURATION_SECONDS:
        safe_delete_file(str(temp_vid), delay_seconds=0)
        limit_min = MAX_VIDEO_DURATION_SECONDS // 60
        raise HTTPException(
            status_code=400,
            detail=f"Video is longer than the {limit_min}-minute limit. Please upload a shorter video.",
        )

    try:
        logger.info(f"📤 Upload received: {original_name} ({size:,} bytes)")
        mp3_path = await asyncio.to_thread(extract_audio_mp3, str(temp_vid), str(TEMP_DIR))

        token     = _store_token(mp3_path, f"{Path(original_name).stem}.mp3", "audio/mpeg")
        file_size = os.path.getsize(mp3_path)

        logger.info(f"🎧 Audio ready: {Path(mp3_path).name} ({file_size:,} bytes) | token={token[:8]}…")

        return JSONResponse({
            "token":    token,
            "filename": f"{safe_filename(Path(original_name).stem)}.mp3",
            "size":     file_size,
            "mime":     "audio/mpeg",
        })

    except ValueError as e:
        logger.warning(f"Upload conversion error: {e}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Upload conversion server error: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Audio conversion failed. Please try again.")
    finally:
        # Always remove the uploaded source video
        safe_delete_file(str(temp_vid), delay_seconds=0)


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

    # Encode filename safely for Content-Disposition header.
    # HTTP headers are Latin-1 only — Unicode filenames (Bengali, Arabic, etc.)
    # must use RFC 5987 encoding: filename*=UTF-8''<percent-encoded>
    from urllib.parse import quote
    ascii_filename  = filename.encode("ascii", "ignore").decode("ascii") or "download"
    encoded_filename = quote(filename, safe="")
    content_disposition = (
        f"attachment; "
        f'filename="{ascii_filename}"; '
        f"filename*=UTF-8''{encoded_filename}"
    )

    return FileResponse(
        path=file_path,
        filename=ascii_filename,  # FastAPI also uses this internally
        media_type=mime_type,
        headers={
            "Content-Disposition": content_disposition,
            "Accept-Ranges": "bytes",
            # Cache control: don't cache download links
            "Cache-Control": "no-cache, no-store, must-revalidate",
        }
    )
