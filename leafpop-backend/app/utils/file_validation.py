"""
File validation. Never trust filename, extension, or client-sent MIME type alone —
we sniff the actual bytes wherever possible.
"""
import os
from io import BytesIO

from PIL import Image, UnidentifiedImageError

from app.config.constants import ALLOWED_IMAGE_EXTENSIONS, ALLOWED_AUDIO_EXTENSIONS
from app.config.settings import get_settings
from app.utils.errors import InvalidFileError, FileTooLargeError, InvalidAudioError

settings = get_settings()


def _extension_of(filename: str) -> str:
    return os.path.splitext(filename or "")[1].lower()


def validate_image_upload(filename: str, content: bytes) -> None:
    """Raise InvalidFileError / FileTooLargeError if the image is not acceptable."""
    if not content:
        raise InvalidFileError("Uploaded file is empty.")

    size_mb = len(content) / (1024 * 1024)
    if size_mb > settings.max_image_size_mb:
        raise FileTooLargeError(
            f"Image exceeds the {settings.max_image_size_mb}MB limit (got {size_mb:.1f}MB)."
        )

    ext = _extension_of(filename)
    if ext not in ALLOWED_IMAGE_EXTENSIONS:
        raise InvalidFileError("Only JPEG, PNG and WEBP images are supported.")

    # Actually decode the image — this is what stops a renamed .exe/.zip/.pdf.
    try:
        img = Image.open(BytesIO(content))
        img.verify()
    except (UnidentifiedImageError, OSError):
        raise InvalidFileError("File is not a valid image.")


def validate_audio_upload(filename: str, content: bytes) -> None:
    """Raise InvalidAudioError / FileTooLargeError if the audio is not acceptable."""
    if not content:
        raise InvalidAudioError("Uploaded audio file is empty.")

    size_mb = len(content) / (1024 * 1024)
    if size_mb > settings.max_audio_size_mb:
        raise FileTooLargeError(
            f"Audio exceeds the {settings.max_audio_size_mb}MB limit (got {size_mb:.1f}MB)."
        )

    ext = _extension_of(filename)
    if ext not in ALLOWED_AUDIO_EXTENSIONS:
        raise InvalidAudioError("Only WAV, MP3, WEBM and M4A audio files are supported.")

    # Deeper validation (duration, decodability) happens once librosa loads the
    # waveform in audio_service — decoding here too would mean loading it twice.


def validate_audio_duration(duration_sec: float) -> None:
    if duration_sec < settings.min_audio_duration_sec:
        raise InvalidAudioError(
            f"Recording is too short (min {settings.min_audio_duration_sec}s)."
        )
    if duration_sec > settings.max_audio_duration_sec:
        raise InvalidAudioError(
            f"Recording is too long (max {settings.max_audio_duration_sec}s)."
        )
