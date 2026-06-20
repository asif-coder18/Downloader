# SocialDL — Universal Social Media Downloader

Download videos, reels, shorts, and audio from YouTube, TikTok, Instagram, and Facebook.

## Stack

| Layer    | Technology                        |
|----------|-----------------------------------|
| Frontend | Next.js 15 (App Router), Tailwind |
| Backend  | FastAPI, yt-dlp, FFmpeg           |
| Deploy   | Vercel (frontend) + PythonAnywhere (backend) |

## Structure

```
/
├── frontend/    Next.js app
├── backend/     FastAPI + yt-dlp
├── docs/        Architecture docs
├── vercel.json  Vercel config (rootDirectory: frontend)
└── package.json Root convenience scripts
```

## Quick Start

```bash
# Frontend
cd frontend
pnpm install
pnpm dev

# Backend (separate terminal)
cd backend
.\venv\Scripts\python.exe -m uvicorn app.main:app --reload --port 8000
```

Or from the root (frontend only):
```bash
npm run dev
```

## Docs

See [docs/deployment.md](docs/deployment.md) for the full Vercel + PythonAnywhere deployment guide.
