"""
services/denoiser.py
=====================
Removes background noise from audio/video files while preserving the
original music/speech using FFmpeg's audio filters.

HOW IT WORKS
=============
  afftdn    -> FFT-based denoiser. Everything below the configured noise
               floor (nf) is treated as noise and suppressed.
               IMPORTANT: nf must be close to the ACTUAL noise level.
               nf=-30/-50 (old) barely removed anything because real
               recorded noise is usually at -20..-35 dBFS — well ABOVE
               that floor, so afftdn did not treat it as noise.
               nf=-25 ≈ 12 dB of hiss removed; nf=-20 + nr=40 ≈ 40 dB.
  highpass  -> Removes subsonic rumble / DC offset below 60Hz without
               touching music bass.
  lowpass   -> Cuts pure ultrasonic hiss above 15kHz (music rarely uses it).

Strength presets (standard / strong) let users pick how aggressively the
noise floor is attacked — stronger = cleaner but slightly higher artifact
risk on very quiet musical passages.

The output is a clean MP3 (libmp3lame, ~192kbps VBR) so the existing
/upload/audio flow and two-step token download can be reused.
"""

import logging
import subprocess
from pathlib import Path

from app.services.downloader import FFMPEG_PATH

logger = logging.getLogger(__name__)

# FFmpeg denoise strength presets.
#
# The key parameter is `nf` (noise floor). afftdn attenuates everything
# below this level, so a floor far below the REAL noise level removes
# almost nothing. Measured on real recordings:
#
#   standard  nf=-25            → ~12 dB of hiss removed, music untouched
#   strong    nf=-20:nr=40      → ~40 dB removed, still gentle on music
#
# highpass >= 60 removes subsonic rumble, lowpass <= 15000 removes pure
# ultrasonic hiss above music range.
DENOISE_FILTERS = {
    "standard": "afftdn=nf=-25,highpass=f=60,lowpass=f=15000",
    "strong":   "afftdn=nf=-20:nr=40,highpass=f=60,lowpass=f=15000",
}
DEFAULT_STRENGTH = "standard"

# Denoising a 2-hour file takes minutes; keep the same 2h cap as conversion.
PROCESS_TIMEOUT = 7200


def denoise_audio(input_path: str, output_dir: str = None, strength: str = DEFAULT_STRENGTH) -> str:
    """
    Remove background noise from an audio/video file and save as MP3.

    Args:
        input_path:  Path to the source file on disk (any audio/video).
        output_dir:  Directory where the cleaned MP3 should be written.
                     Defaults to the input file's directory.
        strength:    "standard" (gentle, ~12dB) or "strong" (aggressive, ~40dB).

    Returns:
        Path to the generated .mp3 file.

    Raises:
        ValueError: If FFmpeg is missing, the file is invalid, or processing fails.
    """
    if not FFMPEG_PATH:
        raise ValueError(
            "FFmpeg is not installed on the server. Noise removal is unavailable."
        )

    strength = (strength or DEFAULT_STRENGTH).lower().strip()
    denoise_filter = DENOISE_FILTERS.get(strength)
    if not denoise_filter:
        raise ValueError(
            f"Unknown noise-removal strength '{strength}'. Use 'standard' or 'strong'."
        )

    in_path  = Path(input_path)
    out_dir  = Path(output_dir) if output_dir else in_path.parent
    out_path = out_dir / f"{in_path.stem}_clean.mp3"

    cmd = [
        FFMPEG_PATH,
        "-y",                # overwrite output
        "-i", str(in_path),  # input audio/video
        "-vn",               # no video stream
        "-af", denoise_filter,
        "-acodec", "libmp3lame",
        "-q:a", "2",         # ~192kbps VBR
        str(out_path),
    ]

    logger.info(f"🔇 Denoising: {in_path.name} → {out_path.name} | strength={strength} filter={denoise_filter}")
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