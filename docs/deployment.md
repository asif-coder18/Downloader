# Deployment Guide — Vercel (Frontend) + PythonAnywhere (Backend)

## Overview

```
User → Vercel (frontend) → PythonAnywhere (backend) → yt-dlp → file → user
```

---

## Part A — Deploy Backend to PythonAnywhere

### 1. Create a PythonAnywhere account

Sign up at https://www.pythonanywhere.com (free tier works for testing).
Your backend URL will be: `https://yourusername.pythonanywhere.com`

---

### 2. Upload your code

**Option A — Git (recommended):**
Open a PythonAnywhere Bash console and run:
```bash
git clone https://github.com/yourusername/your-repo.git ~/socialdl
```

**Option B — Manual upload:**
Use the PythonAnywhere Files tab to upload the `backend/` folder to `~/socialdl/backend/`.

---

### 3. Create a virtual environment

In a PythonAnywhere Bash console:
```bash
mkvirtualenv socialdl --python=python3.12
workon socialdl
pip install -r ~/socialdl/backend/requirements.txt
```

---

### 4. Configure FFmpeg

PythonAnywhere free tier does NOT include FFmpeg.
Check availability first:
```bash
which ffmpeg
ffmpeg -version
```

If missing (free tier), yt-dlp will still work but:
- Video quality will be limited to pre-merged streams
- MP3 conversion will not work (audio downloads as m4a/webm)

To enable full FFmpeg support, upgrade to a paid plan, then:
```bash
# FFmpeg is available on paid plans via:
which ffmpeg   # should return /usr/bin/ffmpeg
```

---

### 5. Create the .env file

In a Bash console:
```bash
cp ~/socialdl/backend/.env.example ~/socialdl/backend/.env
nano ~/socialdl/backend/.env
```

Fill in your production values:
```env
HOST=0.0.0.0
PORT=8000
ALLOWED_ORIGINS=https://your-app.vercel.app
ALLOWED_ORIGIN_REGEX=https://.*\.vercel\.app
FILE_TTL_SECONDS=300
MAX_FILE_SIZE_MB=500
```

Save with `Ctrl+O`, exit with `Ctrl+X`.

---

### 6. Configure the Web App

1. Go to PythonAnywhere **Dashboard → Web → Add a new web app**
2. Choose **Manual configuration** (not Flask/Django)
3. Choose **Python 3.12**

**WSGI configuration file:**

PythonAnywhere will show you a path like:
`/var/www/yourusername_pythonanywhere_com_wsgi.py`

Replace its entire content with:
```python
import sys
import os
from pathlib import Path

project_home = "/home/yourusername/socialdl/backend"
if project_home not in sys.path:
    sys.path.insert(0, project_home)

venv_path = "/home/yourusername/.virtualenvs/socialdl/lib/python3.12/site-packages"
if venv_path not in sys.path:
    sys.path.insert(0, venv_path)

from dotenv import load_dotenv
load_dotenv(os.path.join(project_home, ".env"))

from app.main import app as fastapi_app
from a2wsgi import ASGIMiddleware

application = ASGIMiddleware(fastapi_app)
```

Replace `yourusername` with your actual username in both paths.

**Virtual environment path:**

In the Web tab → Virtualenv section, enter:
```
/home/yourusername/.virtualenvs/socialdl
```

**Static files (optional — not needed for API):**

Skip this section.

---

### 7. Create required directories

```bash
mkdir -p ~/socialdl/backend/downloads
mkdir -p ~/socialdl/backend/temp
```

---

### 8. Reload and test

1. Click **Reload** in the PythonAnywhere Web tab
2. Test the health endpoint:
   ```
   https://yourusername.pythonanywhere.com/health
   ```
3. Expected response:
   ```json
   { "status": "healthy", "ffmpeg": "...", "downloads_dir": "..." }
   ```
4. Test the API docs:
   ```
   https://yourusername.pythonanywhere.com/docs
   ```

---

### 9. Troubleshoot backend

- **500 errors** → Check the error log in PythonAnywhere Web tab → Log files
- **ModuleNotFoundError** → Virtual environment path is wrong, re-check step 6
- **Import errors** → Run `pip install -r requirements.txt` again in the venv
- **CORS errors** → Verify `ALLOWED_ORIGINS` in `.env` matches your Vercel URL exactly
- **yt-dlp errors** → Update yt-dlp: `pip install -U yt-dlp`

---

## Part B — Deploy Frontend to Vercel

### 1. Push to GitHub

Make sure your code is pushed:
```bash
git add -A
git commit -m "production ready"
git push origin main
```

---

### 2. Import project on Vercel

1. Go to https://vercel.com → New Project
2. Import your GitHub repository
3. Vercel auto-detects Next.js ✅

---

### 3. Configure Root Directory

In Vercel's import screen:
- **Root Directory:** `frontend`
- **Framework:** Next.js (auto-detected)
- **Build Command:** `pnpm build` (or leave as default)
- **Output Directory:** `.next` (leave as default)

This is already set in `vercel.json` at the repo root.

---

### 4. Set Environment Variables

In Vercel → Project → Settings → Environment Variables, add:

| Name | Value | Environments |
|------|-------|--------------|
| `NEXT_PUBLIC_API_URL` | `https://yourusername.pythonanywhere.com` | Production, Preview, Development |

**Important:** Use your actual PythonAnywhere URL, not `localhost`.

---

### 5. Deploy

Click **Deploy**. Vercel builds and deploys automatically.

Your frontend URL will be something like:
```
https://your-app.vercel.app
```

---

### 6. Update backend CORS

Now that you have your Vercel URL, update the backend `.env`:
```bash
nano ~/socialdl/backend/.env
```
```env
ALLOWED_ORIGINS=https://your-app.vercel.app
```

Then reload the PythonAnywhere web app.

---

### 7. Test end-to-end

1. Open `https://your-app.vercel.app`
2. Paste a YouTube URL
3. Click Analyze — you should see the video info card
4. Click Download Video — the file should download

---

## Deployment Checklist

### Backend (PythonAnywhere)
- [ ] Code uploaded / cloned
- [ ] Virtual environment created with `mkvirtualenv`
- [ ] `pip install -r requirements.txt` completed (includes `a2wsgi`)
- [ ] `.env` created with production `ALLOWED_ORIGINS`
- [ ] `downloads/` and `temp/` directories created
- [ ] WSGI config file updated with correct username and paths
- [ ] Virtualenv path set in Web tab
- [ ] Web app reloaded
- [ ] `/health` endpoint returns `{ "status": "healthy" }`
- [ ] `/docs` Swagger UI loads

### Frontend (Vercel)
- [ ] `NEXT_PUBLIC_API_URL` set to PythonAnywhere URL
- [ ] Root Directory set to `frontend`
- [ ] Build succeeds (no errors in Vercel dashboard)
- [ ] Production URL opens correctly
- [ ] Analyze API call works (check browser Network tab)
- [ ] Download completes successfully
- [ ] Multiple downloads work without page refresh

---

## Troubleshooting

### "Failed to fetch" / Network Error in browser
- Backend is down → check PythonAnywhere error log
- Wrong `NEXT_PUBLIC_API_URL` → verify it matches PythonAnywhere domain exactly
- Missing `https://` prefix in env var

### CORS error in browser console
```
Access to fetch at 'https://...' has been blocked by CORS policy
```
- `ALLOWED_ORIGINS` in backend `.env` doesn't include your Vercel URL
- Reload the PythonAnywhere web app after updating `.env`

### Download starts but file is empty / corrupted
- yt-dlp version is outdated → `pip install -U yt-dlp`
- FFmpeg missing → audio downloads will be in native format, not MP3

### 502 Bad Gateway on PythonAnywhere
- WSGI file has a Python error → check error log
- Module import failed → `sys.path` is wrong in WSGI file
- Virtual environment not activated → check virtualenv path in Web tab

### Vercel build fails
- Check build logs in Vercel dashboard
- Run `pnpm build` locally in `frontend/` to reproduce the error

### yt-dlp "Sign in required" errors
- The target site blocks automated downloads
- Expected behavior — not a deployment issue

---

## Updating the Deployment

### Update backend code:
```bash
# On PythonAnywhere Bash console:
cd ~/socialdl
git pull
workon socialdl
pip install -r backend/requirements.txt   # if requirements changed
# Then: Web tab → Reload
```

### Update yt-dlp (do this monthly):
```bash
workon socialdl
pip install -U yt-dlp
# Web tab → Reload
```

### Update frontend code:
Push to GitHub → Vercel auto-deploys on every push to `main`.
