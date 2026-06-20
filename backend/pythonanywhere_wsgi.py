"""
pythonanywhere_wsgi.py
=======================
WSGI entry point for PythonAnywhere.

SETUP INSTRUCTIONS:
====================
1. In PythonAnywhere dashboard → Web → WSGI configuration file
2. Replace the default content with this file (or point to it)
3. Set the path to this file in the WSGI config field

PythonAnywhere path will be:
  /home/yourusername/socialdl/backend/pythonanywhere_wsgi.py

HOW IT WORKS:
=============
PythonAnywhere uses a WSGI server (not uvicorn directly).
We use a2wsgi to wrap our FastAPI (ASGI) app in a WSGI adapter
so PythonAnywhere's Apache/uWSGI server can run it.
"""

import sys
import os
from pathlib import Path

# ── Add your project to the Python path ───────────────────────────────────────
# Replace 'yourusername' with your actual PythonAnywhere username
project_home = "/home/yourusername/socialdl/backend"

if project_home not in sys.path:
    sys.path.insert(0, project_home)

# ── Activate the virtual environment ──────────────────────────────────────────
# Replace 'yourusername' with your actual PythonAnywhere username
venv_path = "/home/yourusername/.virtualenvs/socialdl/lib/python3.12/site-packages"
if venv_path not in sys.path:
    sys.path.insert(0, venv_path)

# ── Load environment variables from .env ──────────────────────────────────────
from dotenv import load_dotenv
load_dotenv(os.path.join(project_home, ".env"))

# ── Import and wrap the FastAPI app ───────────────────────────────────────────
from app.main import app as fastapi_app
from a2wsgi import ASGIMiddleware

# 'application' is the name PythonAnywhere's WSGI server looks for
application = ASGIMiddleware(fastapi_app)
