# SocialDL – Universal Social Media Downloader

A full-stack social media downloader with a **Next.js frontend** and **FastAPI + yt-dlp backend**.

## Project Structure

```
/
├── backend/          ← Python FastAPI server
│   ├── app/
│   │   ├── main.py           Entry point
│   │   ├── config/           Settings
│   │   ├── models/           Pydantic schemas
│   │   ├── routes/           API endpoints
│   │   ├── services/         yt-dlp + download logic
│   │   └── utils/            Helper functions
│   ├── downloads/            Temp downloaded files
│   ├── requirements.txt
│   └── .env.example
│
└── my-app/           ← Next.js frontend
    ├── app/
    │   ├── components/       UI components
    │   ├── downloader/       Downloader page
    │   ├── history/          History page
    │   └── about/            About page
    ├── hooks/                Custom React hooks
    ├── lib/
    │   ├── api.js            Backend API calls
    │   └── mockData.js       Platform data
    └── .env.local
```

## Quick Start

### 1. Install FFmpeg (required for MP3 + HD video)

**Windows:** `winget install ffmpeg`
**Mac:** `brew install ffmpeg`
**Linux:** `sudo apt install ffmpeg`

### 2. Start the Backend

```bash
cd backend
python -m venv venv
venv\Scripts\activate        # Windows
# source venv/bin/activate   # Mac/Linux
pip install -r requirements.txt
cp .env.example .env
uvicorn app.main:app --reload --port 8000
```

Backend runs at: http://localhost:8000
API docs at: http://localhost:8000/docs

### 3. Start the Frontend

```bash
cd my-app
pnpm install
pnpm dev
```

Frontend runs at: http://localhost:3000

## How It Works

```
User pastes URL
      ↓
Frontend: POST /api/analyze
      ↓
Backend: yt-dlp fetches metadata (no download yet)
      ↓
Frontend shows: title, thumbnail, duration, quality options
      ↓
User clicks "Download Video"
      ↓
Frontend: POST /api/download/video { url, quality }
      ↓
Backend: yt-dlp downloads file → FFmpeg merges/converts
      ↓
Backend: FileResponse sends binary file to browser
      ↓
Browser: Automatically saves to Downloads folder ✅
```

## Deployment

**Frontend → Vercel:**
1. Push to GitHub
2. Import at vercel.com
3. Set `NEXT_PUBLIC_API_URL` to your backend URL

**Backend → Render:**
1. Push to GitHub
2. New Web Service at render.com
3. Build: `pip install -r requirements.txt`
4. Start: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
5. Set environment variables

## Legal Notice

Only download publicly accessible content.
Respect copyright laws and platform terms of service.
Do not use to bypass DRM or authentication systems.
