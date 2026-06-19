# SocialDL Backend

FastAPI backend for the Universal Social Media Downloader.

## What this does

- Receives URLs from the frontend
- Uses **yt-dlp** to download videos/audio from 1000+ websites
- Uses **FFmpeg** to convert audio to MP3
- Sends the file directly to the user's browser for download

## Prerequisites

### 1. Python 3.11+
Download from https://python.org

### 2. FFmpeg (REQUIRED for MP3 conversion and HD video merging)

**Windows:**
```
winget install ffmpeg
```
Or download from https://ffmpeg.org/download.html and add to PATH.

**Mac:**
```
brew install ffmpeg
```

**Linux (Ubuntu/Debian):**
```
sudo apt update && sudo apt install ffmpeg
```

**Verify FFmpeg is installed:**
```
ffmpeg -version
```

## Installation

```bash
# 1. Go to the backend folder
cd backend

# 2. Create a virtual environment (isolated Python environment)
python -m venv venv

# 3. Activate the virtual environment
# Windows:
venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate

# 4. Install dependencies
pip install -r requirements.txt

# 5. Copy environment file
cp .env.example .env
```

## Running the server

```bash
# Make sure you're in the backend/ folder with venv activated
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

- `--reload` = auto-restart when you change code (development only)
- `--host 0.0.0.0` = accept connections from any network interface
- `--port 8000` = listen on port 8000

## API Documentation

Once running, visit:
- **Swagger UI**: http://localhost:8000/docs (interactive API explorer)
- **ReDoc**: http://localhost:8000/redoc

## API Endpoints

### POST /api/analyze
Fetch media info without downloading.

```json
Request:  { "url": "https://youtube.com/watch?v=..." }
Response: { "title": "...", "thumbnail": "...", "duration": "3:45", ... }
```

### POST /api/download/video
Download a video file.

```json
Request:  { "url": "...", "quality": "720p", "format": "video" }
Response: Binary MP4 file (browser downloads automatically)
```

### POST /api/download/audio
Download audio as MP3.

```json
Request:  { "url": "...", "quality": "best", "format": "mp3" }
Response: Binary MP3 file (browser downloads automatically)
```

## How yt-dlp works

yt-dlp is a Python library that can download from 1000+ websites.
It works by:
1. Detecting the website from the URL
2. Calling the website's API or scraping the page
3. Finding the direct video/audio stream URLs
4. Downloading those streams

## How FFmpeg works

FFmpeg is a command-line tool for processing audio/video.
yt-dlp uses it automatically when needed:
- **Merging**: YouTube often has separate video and audio streams.
  FFmpeg merges them into one MP4 file.
- **Converting**: To create MP3, FFmpeg extracts the audio track
  and re-encodes it as MP3.

## Deployment (Render)

1. Push code to GitHub
2. Go to https://render.com → New Web Service
3. Connect your GitHub repo
4. Settings:
   - Build Command: `pip install -r requirements.txt`
   - Start Command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
5. Add environment variables in Render dashboard
6. Deploy!

Note: Render's free tier may not have FFmpeg. Use a paid tier or
install FFmpeg via a build script.
