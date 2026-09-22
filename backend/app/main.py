"""
app/main.py
============
The main FastAPI application entry point.

This file:
  1. Creates the FastAPI app instance
  2. Configures CORS (so the frontend can call our API)
  3. Registers all routes (analyze, download)
  4. Sets up logging
  5. Runs startup/shutdown tasks (like cleaning up old files)

HOW FastAPI WORKS (beginner explanation):
==========================================
FastAPI is a Python web framework similar to Express.js (Node.js).
You define "endpoints" (URL paths) and FastAPI handles:
  - Receiving HTTP requests
  - Validating request data (using Pydantic models)
  - Calling your handler function
  - Sending the response back

WHAT IS CORS?
==============
CORS = Cross-Origin Resource Sharing
When your frontend (localhost:3000) calls your backend (localhost:8000),
the browser blocks it by default because they're on different "origins".
We configure CORS to explicitly allow our frontend to make requests.
"""

import logging
import sys
import os
from contextlib import asynccontextmanager

# Configure stdout/stderr for utf-8 on Windows so emoji logs never crash
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
if hasattr(sys.stderr, "reconfigure"):
    sys.stderr.reconfigure(encoding="utf-8", errors="replace")

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config.settings import (
    APP_NAME,
    APP_VERSION,
    APP_DESCRIPTION,
    ALLOWED_ORIGINS,
    ALLOWED_ORIGIN_REGEX,
    DOWNLOADS_DIR,
    TEMP_DIR,
)
from app.routes.analyze import router as analyze_router
from app.routes.download import router as download_router
from app.utils.helpers import cleanup_old_files

class SafeStreamHandler(logging.StreamHandler):
    """Prevents UnicodeEncodeError when logging emojis on Windows consoles."""
    def emit(self, record):
        try:
            msg = self.format(record)
            stream = self.stream
            try:
                stream.write(msg + self.terminator)
            except UnicodeEncodeError:
                encoding = getattr(stream, "encoding", "utf-8") or "utf-8"
                safe_msg = msg.encode(encoding, errors="replace").decode(encoding)
                stream.write(safe_msg + self.terminator)
            self.flush()
        except Exception:
            self.handleError(record)

# ── Logging Setup ──────────────────────────────────────────────────────────────
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)-8s | %(name)s | %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
    handlers=[
        SafeStreamHandler(sys.stdout),
    ]
)
logger = logging.getLogger(__name__)


# ── Lifespan (startup + shutdown) ─────────────────────────────────────────────
# The @asynccontextmanager decorator makes this a "context manager"
# Code before `yield` runs on startup, code after runs on shutdown

@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Runs when the server starts and when it shuts down.
    """
    # ── STARTUP ──
    logger.info(f"🚀 Starting {APP_NAME} v{APP_VERSION}")
    logger.info(f"📁 Downloads directory: {DOWNLOADS_DIR}")
    logger.info(f"📁 Temp directory: {TEMP_DIR}")
    logger.info(f"🌐 Allowed origins: {ALLOWED_ORIGINS}")

    # Clean up any leftover files from previous runs
    cleanup_old_files(str(DOWNLOADS_DIR), max_age_seconds=600)
    cleanup_old_files(str(TEMP_DIR), max_age_seconds=600)

    logger.info("✅ Server ready!")

    yield  # Server runs here

    # ── SHUTDOWN ──
    logger.info("👋 Shutting down server...")
    cleanup_old_files(str(DOWNLOADS_DIR), max_age_seconds=0)  # Delete all
    cleanup_old_files(str(TEMP_DIR), max_age_seconds=0)


# ── Create FastAPI App ─────────────────────────────────────────────────────────
is_dev = os.getenv("ENVIRONMENT", "production") == "development"

app = FastAPI(
    title=APP_NAME,
    version=APP_VERSION,
    description=APP_DESCRIPTION,
    lifespan=lifespan,
    docs_url="/docs" if is_dev else None,
    redoc_url="/redoc" if is_dev else None,
)


# ── CORS Middleware ────────────────────────────────────────────────────────────
# This MUST be added before any routes
# It tells the browser: "Yes, requests from these origins are allowed"
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS if ALLOWED_ORIGINS else ["*"],
    allow_origin_regex=ALLOWED_ORIGIN_REGEX or r"^https?://(localhost|127\.0\.0\.1)(:[0-9]+)?$",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=[
        "Content-Disposition",
        "Content-Length",
        "Content-Type",
        "X-Filename",
    ],
)


# ── Register Routes ────────────────────────────────────────────────────────────
# Include our route modules with a prefix
# All routes in analyze_router will be at /api/...
# All routes in download_router will be at /api/...
app.include_router(analyze_router,  prefix="/api", tags=["Analysis"])
app.include_router(download_router, prefix="/api", tags=["Downloads"])


# ── Health Check Endpoint ──────────────────────────────────────────────────────
@app.get("/", tags=["Health"])
async def root():
    """
    Health check endpoint.
    Visit http://localhost:8000/ to verify the server is running.
    """
    return {
        "status": "ok",
        "app": APP_NAME,
        "version": APP_VERSION,
        "docs": "/docs",
    }


@app.get("/health", tags=["Health"], include_in_schema=False)
async def health_check():
    """Minimal health check — no internal paths exposed."""
    from app.services.downloader import FFMPEG_PATH
    return {
        "status": "healthy",
        "ffmpeg": bool(FFMPEG_PATH),
    }
