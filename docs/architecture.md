# Architecture

## Structure

```
/
├── frontend/          Next.js 15 (App Router) — deployed to Vercel
│   ├── app/           Pages + components (App Router)
│   ├── hooks/         Custom React hooks
│   ├── lib/           API client, utilities, mock data
│   ├── public/        Static assets
│   ├── .env.local     NEXT_PUBLIC_API_URL=http://localhost:8000
│   └── package.json
│
├── backend/           FastAPI — deployed to Render / Railway / Fly.io
│   ├── app/
│   │   ├── main.py       App entry point, CORS, lifespan
│   │   ├── config/       settings.py — all env vars centralized
│   │   ├── routes/       analyze.py, download.py
│   │   ├── services/     analyzer.py, downloader.py (yt-dlp)
│   │   ├── models/       schemas.py — Pydantic models
│   │   └── utils/        helpers.py
│   ├── downloads/     Temp download files (auto-cleaned)
│   ├── temp/          yt-dlp working directory
│   ├── .env           ALLOWED_ORIGINS, PORT, etc.
│   └── requirements.txt
│
├── docs/              Architecture, API reference
├── vercel.json        Points Vercel at frontend/
├── package.json       Root convenience scripts
└── .gitignore
```

## Download Flow

```
User pastes URL
     │
     ▼
POST /api/analyze          ← yt-dlp fetches metadata only
     │
     ▼
MediaPreviewCard shown     ← title, thumbnail, quality options
     │
     ▼ (user clicks Download)
POST /api/download/video   ← yt-dlp downloads file server-side
     │                        returns { token, filename, size }
     ▼
GET  /api/file/{token}     ← browser streams file directly
     │                        native download bar, no RAM buffering
     ▼
File saved to Downloads
```

## Running Locally

```bash
# Terminal 1 — Frontend
cd frontend
pnpm install
pnpm dev          # http://localhost:3000

# Terminal 2 — Backend
cd backend
.\venv\Scripts\python.exe -m uvicorn app.main:app --reload --port 8000
# http://localhost:8000  |  docs: http://localhost:8000/docs
```

## Environment Variables

### frontend/.env.local
```
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### backend/.env
```
HOST=0.0.0.0
PORT=8000
ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
ALLOWED_ORIGIN_REGEX=https://.*\.vercel\.app
FILE_TTL_SECONDS=300
MAX_FILE_SIZE_MB=500
```
