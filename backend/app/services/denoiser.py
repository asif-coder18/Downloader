"""
services/denoiser.py
=====================
Removes background noise from audio/video files while preserving the
original music/speech using FFmpeg's audio filters.

HOW IT WORKS
=============
  afftdn    -> FFT-based denoiser. Estimates the stationary noise floor
               and suppresses it. Removes hiss, hum, static, crowd noise.
               nf=-30 means a -30dB noise floor is assumed (standard).
  highpass  -> Removes subsonic rumble / DC offset below 60Hz without
               touching music bass.

The output is a clean MP3 (libmp3lame, ~192kbps VBR) so the existing
/upload/audio flow and two-step token download can be reused.
"""

import logging
import subprocess
from pathlib import Path

from app.services.downloader import FFMPEG_PATH

logger = logging.getLogger(__name__)

# FFmpeg audio filter chain. Affects "stationary" noise only, so the
# background music / vocal content stays intact.
DENOISE_FILTER = "afftdn=nf=-30,highpass=f=60"

# Denoising a 2-hour file takes minutes; keep the same 2h cap as conversion.
PROCESS_TIMEOUT = 7200


def denoise_audio(input_path: str, output_dir: str = None) -> str:
    """
    Remove background noise from an audio/video file and save as MP3.

    Args:
        input_path:  Path to the source file on disk (any audio/video).
        output_dir:  Directory where the cleaned MP3 should be written.
                     Defaults to the input file's directory.

    Returns:
        Path to the generated .mp3 file.

    Raises:
        ValueError: If FFmpeg is missing, the file is invalid, or processing fails.
    """
    if not FFMPEG_PATH:
        raise ValueError(
            "FFmpeg is not installed on the server. Noise removal is unavailable."
        )

    in_path  = Path(input_path)
    out_dir  = Path(output_dir) if output_dir else in_path.parent
    out_path = out_dir / f"{in_path.stem}_clean.mp3"

    cmd = [
        FFMPEG_PATH,
        "-y",                # overwrite output
        "-i", str(in_path),  # input audio/video
        "-vn",               # no video stream
        "-af", DENOISE_FILTER,
        "-acodec", "libmp3lame",
        "-q:a", "2",         # ~192kbps VBR
        str(out_path),
    ]

    logger.info(f"🔇 Denoising: {in_path.name} → {out_path.name} | filter={DENOISE_FILTER}")
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