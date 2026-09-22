"""
routes/noise.py
===============
Noise Remover endpoints — two-step token flow (same as downloads).

  POST /api/noise/url     — JSON { "url": "..." }  → download → denoise → MP3
  POST /api/noise/upload  — multipart file (video OR audio) → denoise → MP3

Both return { token, filename, size, mime } so the frontend reuses the
existing GET /api/file/{token} streaming endpoint for the actual download.
"""

import os
import uuid
import asyncio
import logging
from pathlib import Path

from fastapi import APIRouter, HTTPException, UploadFile, File, Form

from app.config.settings import TEMP_DIR, MAX_FILE_SIZE_BYTES, MAX_VIDEO_DURATION_SECONDS
from app.models.schemas import NoiseRemoverUrlRequest, DownloadFormat
from app.services.converter import probe_duration
from app.services.downloader import download_media, FFMPEG_PATH
from app.services.denoiser import denoise_audio
from app.routes.download import _store_token
from app.utils.helpers import safe_delete_file, safe_filename

logger = logging.getLogger(__name__)
router = APIRouter()

# Video AND audio containers FFmpeg can read for denoising
_ALLOWED_EXTS = {
    # video
    ".mp4", ".mkv", ".mov", ".avi", ".webm", ".flv", ".wmv", ".m4v",
    ".mpg", ".mpeg", ".3gp", ".ts", ".ogv",
    # audio
    ".mp3", ".wav", ".m4a", ".aac", ".ogg", ".oga", ".opus", ".flac", ".wma",
}
_MAX_INPUT_BYTES = MAX_FILE_SIZE_BYTES  # same 2GB cap as downloads


# ── POST /noise/url ───────────────────────────────────────────────────────────

@router.post("/noise/url", summary="Remove noise from a video/audio URL")
async def noise_url_endpoint(request: NoiseRemoverUrlRequest):
    """
    Step 1 of the two-step noise-removal flow for URLs.

    Downloads the best audio stream with yt-dlp, runs the FFmpeg denoiser,
    saves the cleaned MP3 on the server, and returns a one-time download token.

    Request:  { "url": "https://..." }
    Response: { "token": "abc123", "filename": "title_clean.mp3", "size": 12345 }
    """
    if not FFMPEG_PATH:
        raise HTTPException(status_code=400, detail=(
            "FFmpeg is not installed on the server. Noise removal is unavailable."
        ))

    try:
        logger.info(f"🔊 Noise-remover URL request: {request.url}")

        # 1. Download the source audio (enforces the 2-hour limit internally)
        raw_path, raw_filename, _ = await download_media(
            url=request.url,
            quality="best",
            fmt=DownloadFormat.MP3,
        )

        # 2. Denoise it
        mp3_path = await asyncio.to_thread(
            denoise_audio, raw_path, str(TEMP_DIR), request.strength
        )

        # 3. Build a clean output filename from the downloaded video title
        stem = Path(raw_filename).stem
        clean_name = safe_filename(stem) or "audio"
        final_name = f"{clean_name}_clean.mp3"

        token     = _store_token(mp3_path, final_name, "audio/mpeg")
        file_size = os.path.getsize(mp3_path)

        logger.info(f"🔊 Clean audio ready: {final_name} ({file_size:,} bytes) | token={token[:8]}…")

        return {
            "token":    token,
            "filename": final_name,
            "size":     file_size,
            "mime":     "audio/mpeg",
        }

    except ValueError as e:
        logger.warning(f"Noise-remover URL error: {e}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Noise-remover URL server error: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Noise removal failed. Please try again.")
    finally:
        # Delete the intermediate yt-dlp download (the denoised MP3 is kept)
        if "raw_path" in locals():
            safe_delete_file(raw_path, delay_seconds=0)


# ── POST /noise/upload ────────────────────────────────────────────────────────

@router.post("/noise/upload", summary="Remove noise from an uploaded file")
async def noise_upload_endpoint(
    file: UploadFile = File(...),
    strength: str = Form("standard"),
):
    """
    Step 1 of the two-step noise-removal flow for uploaded files.

    Accepts any video or audio file, removes background noise with FFmpeg,
    saves the cleaned MP3 on the server, and returns a one-time download token.

    Request:  multipart/form-data with field "file" (+ optional "strength":
              "standard" | "strong")
    Response: { "token": "abc123", "filename": "audio_clean.mp3", "size": 12345 }
    """
    strength = (strength or "standard").lower().strip()
    original_name = file.filename or "audio.mp3"
    ext = Path(original_name).suffix.lower() or ".mp3"

    if ext not in _ALLOWED_EXTS:
        raise HTTPException(
            status_code=400,
            detail=(
                f"Unsupported file type '{ext}'. Please upload a video or audio file "
                "(mp4, mkv, mov, avi, webm, mp3, wav, m4a, aac, ogg, flac, etc.)."
            ),
        )

    work_id      = str(uuid.uuid4())[:10]
    temp_input   = TEMP_DIR / f"noise_{work_id}{ext}"

    # Stream upload to disk in chunks so we don't hold the whole file in RAM
    try:
        size = 0
        with open(temp_input, "wb") as out:
            while True:
                chunk = await file.read(1024 * 1024)  # 1MB chunks
                if not chunk:
                    break
                size += len(chunk)
                if size > _MAX_INPUT_BYTES:
                    raise HTTPException(
                        status_code=413,
                        detail=f"File exceeds the {MAX_FILE_SIZE_BYTES // (1024 * 1024)}MB size limit.",
                    )
                out.write(chunk)
    finally:
        await file.close()

    if size == 0:
        safe_delete_file(str(temp_input), delay_seconds=0)
        raise HTTPException(status_code=400, detail="Uploaded file is empty.")

    try:
        # ── Duration limit: reject files longer than 2 hours ──
        duration = await asyncio.to_thread(probe_duration, str(temp_input))
        if duration is not None and duration > MAX_VIDEO_DURATION_SECONDS:
            limit_min = MAX_VIDEO_DURATION_SECONDS // 60
            raise HTTPException(
                status_code=400,
                detail=f"File is longer than the {limit_min}-minute limit. Please upload a shorter file.",
            )

        logger.info(f"📤 Noise-remover upload received: {original_name} ({size:,} bytes)")

        mp3_path = await asyncio.to_thread(denoise_audio, str(temp_input), str(TEMP_DIR), strength)

        clean_name = safe_filename(Path(original_name).stem) or "audio"
        final_name = f"{clean_name}_clean.mp3"

        token     = _store_token(mp3_path, final_name, "audio/mpeg")
        file_size = os.path.getsize(mp3_path)

        logger.info(f"🔊 Clean audio ready: {final_name} ({file_size:,} bytes) | token={token[:8]}…")

        return {
            "token":    token,
            "filename": final_name,
            "size":     file_size,
            "mime":     "audio/mpeg",
        }

    except HTTPException:
        raise  # already converted size/duration errors
    except ValueError as e:
        logger.warning(f"Noise-remover upload error: {e}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Noise-remover upload server error: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Noise removal failed. Please try again.")
    finally:
        # Always remove the uploaded source file
        safe_delete_file(str(temp_input), delay_seconds=0)