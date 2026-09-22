"""
services/denoiser.py
=====================
Removes background noise from audio/video files using the `noisereduce` Python library.
Two cleaning modes are offered ("music" and "voice") plus an optional
loudness-normalisation ("boost") final stage.

HOW IT WORKS
============
  1. Extraction: Uses FFmpeg to extract audio from the input (video or audio) into a temporary .wav file.
  2. Processing: Uses `noisereduce` to learn and subtract the stationary background noise.
  3. Encoding: Uses FFmpeg to convert the cleaned .wav file back to an .mp3 for download.
"""

import logging
import os
import subprocess
import uuid
from pathlib import Path

from app.services.downloader import FFMPEG_PATH
from app.config.settings import TEMP_DIR

logger = logging.getLogger(__name__)

DEFAULT_MODE = "voice"
PROCESS_TIMEOUT = 7200


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
    import noisereduce as nr
    import soundfile as sf

    if not FFMPEG_PATH:
        raise ValueError(
            "FFmpeg is not installed on the server. Noise removal is unavailable."
        )

    in_path  = Path(input_path)
    out_dir  = Path(output_dir) if output_dir else in_path.parent
    out_path = out_dir / f"{in_path.stem}_clean.mp3"
    
    unique_id = uuid.uuid4().hex[:8]
    temp_wav_in = TEMP_DIR / f"temp_{unique_id}_in.wav"
    temp_wav_out = TEMP_DIR / f"temp_{unique_id}_out.wav"

    logger.info(f"🔇 Denoising: {in_path.name} → {out_path.name} | mode={mode} boost={boost}")
    
    try:
        # Step 1: Extract audio to temporary WAV file
        cmd_extract = [
            FFMPEG_PATH, "-y", "-i", str(in_path),
            "-vn", "-acodec", "pcm_s16le", str(temp_wav_in)
        ]
        
        proc1 = subprocess.run(cmd_extract, stdout=subprocess.PIPE, stderr=subprocess.PIPE, timeout=PROCESS_TIMEOUT)
        if proc1.returncode != 0 or not temp_wav_in.exists():
            raise ValueError("Failed to extract audio from the input file.")

        # Step 2: Remove noise using Python noisereduce library
        logger.info("🧠 Applying noisereduce algorithm...")
        data, rate = sf.read(str(temp_wav_in))
        
        # Configure noise reduction strictness based on user mode
        prop_dec = 0.95 if mode == "voice" else 0.60
        
        reduced_noise = nr.reduce_noise(y=data, sr=rate, stationary=True, prop_decrease=prop_dec)
        sf.write(str(temp_wav_out), reduced_noise, rate)
        
        # Step 3: Encode the cleaned WAV back to MP3
        logger.info("🎵 Encoding cleaned audio to MP3...")
        cmd_encode = [
            FFMPEG_PATH, "-y", "-i", str(temp_wav_out)
        ]
        if boost:
            cmd_encode.extend(["-af", "loudnorm=I=-16:TP=-1.5:LRA=11"])
        
        cmd_encode.extend([
            "-acodec", "libmp3lame", "-q:a", "2", str(out_path)
        ])
        
        proc2 = subprocess.run(cmd_encode, stdout=subprocess.PIPE, stderr=subprocess.PIPE, timeout=PROCESS_TIMEOUT)
        
        if proc2.returncode != 0 or not out_path.exists():
            raise ValueError("Failed to encode the cleaned audio.")

    except subprocess.TimeoutExpired:
        raise ValueError("Noise removal timed out. The file may be too long.")
    except Exception as e:
        logger.error(f"🔇 Error during noise removal: {e}")
        raise ValueError(f"Could not remove noise: {e}")
    finally:
        # Step 4: Cleanup temporary WAV files
        if temp_wav_in.exists():
            temp_wav_in.unlink(missing_ok=True)
        if temp_wav_out.exists():
            temp_wav_out.unlink(missing_ok=True)

    return str(out_path)