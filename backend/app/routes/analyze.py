"""
routes/analyze.py
==================
API endpoint: POST /analyze

This endpoint receives a URL from the frontend and returns
media information (title, thumbnail, duration, etc.)
WITHOUT downloading the actual file.

Think of it like: "Tell me about this video before I download it."

Flow:
  Frontend → POST /analyze { url } → Backend analyzes → Returns MediaInfo
"""

import logging
from fastapi import APIRouter, HTTPException

from app.models.schemas import AnalyzeRequest, MediaInfo
from app.services.analyzer import analyze_url

logger = logging.getLogger(__name__)

# APIRouter is like a mini-app that groups related endpoints
# We'll include this router in main.py
router = APIRouter()


@router.post(
    "/analyze",
    response_model=MediaInfo,
    summary="Analyze a social media URL",
    description="Returns media metadata (title, thumbnail, duration) without downloading.",
)
async def analyze_endpoint(request: AnalyzeRequest):
    """
    Analyze a social media URL and return media information.

    Request body:
        { "url": "https://youtube.com/watch?v=..." }

    Response:
        {
            "title": "Video Title",
            "platform": "YouTube",
            "thumbnail": "https://...",
            "duration": "3:45",
            "uploader": "Channel Name",
            "view_count": "1.2M",
            "formats": ["video", "audio", "mp3"],
            "qualities": ["best", "1080p", "720p", "360p"]
        }
    """
    try:
        logger.info(f"📥 Analyze request for: {request.url}")
        media_info = await analyze_url(request.url)
        return media_info

    except ValueError as e:
        # ValueError = user error (bad URL, private video, etc.)
        # Return 400 Bad Request with the error message
        logger.warning(f"Analyze failed (user error): {e}")
        raise HTTPException(status_code=400, detail=str(e))

    except Exception as e:
        # Unexpected error = server error
        # Return 500 Internal Server Error
        logger.error(f"Analyze failed (server error): {e}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail="An unexpected error occurred. Please try again."
        )
