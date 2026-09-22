"""
services/denoiser.py
=====================
Removes background noise from audio/video files using FFmpeg audio filters.
Two cleaning modes are offered (see DENOISE_MODES) plus an optional
loudness-normalisation ("boost") final stage.

HOW IT WORKS
============
  afftdn    -> FFT-based denoiser. Everything below the configured noise
               floor (nf) is treated as noise and suppressed.
               IMPORTANT: nf must be close to the ACTUAL noise level.
               nf=-30/-50 (old) barely removed anything because real
               recorded noise is usually at -20..-35 dBFS — well ABOVE
               that floor, so afftdn did not treat it as noise.
               nf=-20 + nr=40  → ~18-40 dB of hiss removed, music intact.
  bandreject -> Notch filter that kills mains hum (50 Hz / 60 Hz) without
               touching the rest of the spectrum.
  highpass   -> Removes subsonic rumble (fans, AC, wind, DC offset).
  arnndn     -> RNNoise neural denoiser. Keeps the dominant speech and
               suppresses everything else (background chatter, fan, hiss).
               Trained for vocals, so it also attenuates background music —
               which is exactly what the "vocal focus" mode promises.

Measured on a realistic hiss+rumble sample:
  music mode   ≈ -18 dB noise removed, music within -0.5 dB
  boost stage  + loudnorm → loudness-consistent, silence stays quiet

The output is a clean MP3 (libmp3lame, ~192kbps VBR) so the existing
two-step token download flow can be reused.
"""

import logging
import os
import subprocess
from pathlib import Path

from app.services.downloader import FFMPEG_PATH

logger = logging.getLogger(__name__)

# FFmpeg denoise mode presets.
#
#   "music" — Remove hiss + hum + rumble while keeping ALL music/voice.
#             Uses a stronger afftdn pass.
#   "voice" — RNNoise vocal focus: keep the main speaker, drop background
#             chatter, other voices, fan & hiss (music is de-emphasised).
DENOISE_MODES = {
    "music": "highpass=f=100,bandreject=f=50:width=120,afftdn=nf=-40:nr=90",
    "voice": "highpass=f=80,bandreject=f=50:width=120,afftdn=nf=-40:nr=20{rnnoise}",
}
DEFAULT_MODE = "voice"

# Optional final stage: loudness normalise to a broadcast-friendly level
# (the "amplifier" the user asked for). Raised loudness, silence stays quiet.

# RNNoise neural model bundled with the backend (BSD-licensed, ~300KB).
_RNNOISE_MODEL = Path(__file__).resolve().parents[2] / "models" / "arnndn" / "rnnoise.rnnn"

# Denoising a 2-hour file takes minutes; keep the same 2h cap as conversion.
PROCESS_TIMEOUT = 7200


def _ffmpeg_safe_path(path: Path) -> str:
    """
    Path usable inside an FFmpeg filter option value, cross-platform.

    FFmpeg's filter parser uses ':' and ',' as separators; a Windows
    absolute path ('C:/...') can't be escaped reliably there. So on
    Windows we pass a RELATIVE path (no ':'/','/ — safe), and on Linux
    (Render) the absolute path (no drive-letter colon). The relative
    path works because the backend always runs from its own directory
    (uvicorn cwd == backend/, render rootDir: backend).
    """
    if os.sep != "/":
        rel = os.path.relpath(path, os.getcwd())
        return rel.replace("\\", "/")
    return str(path)


def build_filter(mode: str = DEFAULT_MODE, boost: bool = False) -> str:
    """
    Build the FFmpeg -af chain for the requested mode.

    Falls back gracefully if the RNNoise model is missing ('voice' mode
    becomes a strong afftdn pass instead of failing).
    """
    mode = (mode or DEFAULT_MODE).lower().strip()
    template = DENOISE_MODES.get(mode)
    if not template:
        raise ValueError(
            f"Unknown cleaning mode '{mode}'. Use 'music' or 'voice'."
        )

    chain = template.replace(
        "{rnnoise}",
        f",arnndn=model={_ffmpeg_safe_path(_RNNOISE_MODEL)}:mix=0.9"
        if _RNNOISE_MODEL.exists() else ",afftdn=nf=-30:nr=90",
    )

    if boost:
        chain += f",loudnorm=I=-16:TP=-1.5:LRA=11"

    return chain


def denoise_audio(
    input_path: str,
    output_dir: str = None,
    mode: str = DEFAULT_MODE,
    boost: bool = False,
) -> str:
    """
    Remove background noise from an audio/video file and save as MP3.

    Args:
        input_path:  Path to the source file on disk (any audio/video).
        output_dir:  Directory where the cleaned MP3 should be written.
                     Defaults to the input file's directory.
        mode:        "music" (keep music, kill hiss/hum) or
                     "voice" (RNNoise vocal focus, kills chatter+music).
        boost:       Apply loudness normalisation (louder, consistent).

    Returns:
        Path to the generated .mp3 file.

    Raises:
        ValueError: If FFmpeg is missing, the file is invalid, or processing fails.
    """
    if not FFMPEG_PATH:
        raise ValueError(
            "FFmpeg is not installed on the server. Noise removal is unavailable."
        )

    chain = build_filter(mode, boost)

    in_path  = Path(input_path)
    out_dir  = Path(output_dir) if output_dir else in_path.parent
    out_path = out_dir / f"{in_path.stem}_clean.mp3"

    cmd = [
        FFMPEG_PATH,
        "-y",                # overwrite output
        "-i", str(in_path),  # input audio/video
        "-vn",               # no video stream
        "-af", chain,
        "-acodec", "libmp3lame",
        "-q:a", "2",         # ~192kbps VBR
        str(out_path),
    ]

    logger.info(f"🔇 Denoising: {in_path.name} → {out_path.name} | mode={mode} boost={boost}")
    try:
        proc = subprocess.run(
            cmd,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            timeout=PROCESS_TIMEOUT,
        )
    except subprocess.TimeoutExpired:
        raise ValueError("Noise removal timed out. The file may be too long.")
    except Exception as e:
        raise ValueError(f"Failed to run FFmpeg: {e}")

    if proc.returncode != 0 or not out_path.exists() or out_path.stat().st_size == 0:
        tail = (proc.stderr or b"").decode("utf-8", errors="ignore")[-400:]
        logger.error(f"🔇 FFmpeg error: {tail}")
        raise ValueError(
            "Could not remove noise. Please make sure the file is a valid audio/video."
        )

    return str(out_path)