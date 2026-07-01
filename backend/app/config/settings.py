"""
config/settings.py
==================
Central configuration for the backend.
All values come from environment variables (or .env file).
Works identically in development (local) and production (PythonAnywhere).
"""

import os
from pathlib import Path
from dotenv import load_dotenv

# Load .env file if present (dev) — on PythonAnywhere the WSGI file loads it
load_dotenv()

# ── Directory paths ────────────────────────────────────────────────────────────
# BASE_DIR = the backend/ folder, regardless of where Python is called from
BASE_DIR = Path(__file__).resolve().parent.parent.parent

# On PythonAnywhere you can override these via env vars to use absolute paths
# e.g. DOWNLOADS_DIR=/home/yourusername/socialdl/backend/downloads
DOWNLOADS_DIR = Path(os.getenv("DOWNLOADS_DIR", str(BASE_DIR / "downloads")))
TEMP_DIR      = Path(os.getenv("TEMP_DIR",      str(BASE_DIR / "temp")))

# Create the folders if they don't exist
DOWNLOADS_DIR.mkdir(parents=True, exist_ok=True)
TEMP_DIR.mkdir(parents=True, exist_ok=True)

# ── Server ────────────────────────────────────────────────────────────────────
HOST = os.getenv("HOST", "0.0.0.0")
PORT = int(os.getenv("PORT", "8000"))

# ── CORS ──────────────────────────────────────────────────────────────────────
# Comma-separated list of allowed frontend origins
# Dev:  http://localhost:3000
# Prod: https://your-app.vercel.app
ALLOWED_ORIGINS = [
    o.strip()
    for o in os.getenv(
        "ALLOWED_ORIGINS",
        "http://localhost:3000,http://127.0.0.1:3000"
    ).split(",")
    if o.strip()
]

# Regex that also allows ALL Vercel preview deployment URLs automatically
# Pattern: https://<anything>.vercel.app
ALLOWED_ORIGIN_REGEX = os.getenv(
    "ALLOWED_ORIGIN_REGEX",
    r"https://.*\.(vercel\.app|onrender\.com)"
)

# ── File cleanup ───────────────────────────────────────────────────────────────
# How long (seconds) to keep a downloaded file before auto-deleting it
FILE_TTL_SECONDS = int(os.getenv("FILE_TTL_SECONDS", "300"))

# ── yt-dlp ────────────────────────────────────────────────────────────────────
MAX_FILE_SIZE_BYTES = int(os.getenv("MAX_FILE_SIZE_MB", "500")) * 1024 * 1024

# ── App metadata ──────────────────────────────────────────────────────────────
APP_NAME        = "SocialDL API"
APP_VERSION     = "1.0.0"
APP_DESCRIPTION = "Universal Social Media Downloader API powered by yt-dlp"
