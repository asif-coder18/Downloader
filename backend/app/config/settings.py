"""
config/settings.py
==================
Central configuration file for the backend.

All settings are read from environment variables (or .env file).
This keeps secrets out of your code and makes deployment easy.

How it works:
  1. We define default values for every setting
  2. If a .env file exists, python-dotenv loads it automatically
  3. os.getenv("KEY", "default") reads the value or uses the default
"""

import os
from pathlib import Path
from dotenv import load_dotenv

# Load .env file if it exists (won't crash if it doesn't)
load_dotenv()

# ── Directory paths ────────────────────────────────────────────────────────────
# BASE_DIR is the "backend/" folder
BASE_DIR = Path(__file__).resolve().parent.parent.parent

# Where downloaded files are temporarily stored before sending to user
DOWNLOADS_DIR = BASE_DIR / "downloads"

# Where yt-dlp puts files while still processing them
TEMP_DIR = BASE_DIR / "temp"

# Create these folders if they don't exist yet
DOWNLOADS_DIR.mkdir(parents=True, exist_ok=True)
TEMP_DIR.mkdir(parents=True, exist_ok=True)

# ── Server settings ────────────────────────────────────────────────────────────
HOST = os.getenv("HOST", "0.0.0.0")   # Listen on all network interfaces
PORT = int(os.getenv("PORT", "8000"))  # Default port

# ── CORS (Cross-Origin Resource Sharing) ──────────────────────────────────────
# CORS controls which websites are allowed to call our API.
# During development we allow localhost:3000 (Next.js dev server).
# In production, replace with your actual frontend URL.
ALLOWED_ORIGINS = os.getenv(
    "ALLOWED_ORIGINS",
    "http://localhost:3000,http://127.0.0.1:3000"
).split(",")

# Also allow all *.vercel.app subdomains (for Vercel preview deployments)
# e.g. "https://downloader-abc123.vercel.app"
ALLOWED_ORIGIN_REGEX = os.getenv(
    "ALLOWED_ORIGIN_REGEX",
    r"https://.*\.vercel\.app"
)

# ── File cleanup ───────────────────────────────────────────────────────────────
# How many seconds to keep a downloaded file before deleting it.
# 300 seconds = 5 minutes. Enough time for the browser to finish downloading.
FILE_TTL_SECONDS = int(os.getenv("FILE_TTL_SECONDS", "300"))

# ── yt-dlp settings ───────────────────────────────────────────────────────────
# Maximum file size in bytes (500 MB default)
MAX_FILE_SIZE_BYTES = int(os.getenv("MAX_FILE_SIZE_MB", "500")) * 1024 * 1024

# ── App metadata ──────────────────────────────────────────────────────────────
APP_NAME = "SocialDL API"
APP_VERSION = "1.0.0"
APP_DESCRIPTION = "Universal Social Media Downloader API powered by yt-dlp"
