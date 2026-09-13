"""
Google Gemini AI service for leaf vision analysis & audio pop acoustics evaluation.
"""
import json
import logging
import os
from typing import Any, Optional

try:
    from google import genai
    from google.genai import types
except ModuleNotFoundError:  # pragma: no cover - optional dependency on deploy
    genai = None
    types = None

from app.config.settings import get_settings

logger = logging.getLogger("leafpop.gemini_service")

# Priority list of Gemini models to attempt (with auto-fallback if rate-limited)
GEMINI_MODELS = [
    "gemini-3.6-flash",
    "gemini-2.0-flash-exp",
    "gemini-1.5-flash-8b",
    "gemini-1.5-pro",
]


def get_gemini_client() -> Optional[Any]:
    """Returns a configured google.genai Client instance if the SDK and API key are available."""
    if genai is None or types is None:
        logger.warning("Gemini SDK not installed; Gemini features are disabled.")
        return None

    settings = get_settings()
    api_key = settings.gemini_api_key or os.environ.get("GEMINI_API_KEY")
    if not api_key:
        logger.warning("Gemini API key not configured.")
        return None

    try:
        return genai.Client(api_key=api_key)
    except Exception as exc:  # noqa: BLE001
        logger.exception("Failed to initialize Gemini Client: %s", exc)
        return None


def _detect_image_mime_type(data: bytes) -> str:
    """Detects image MIME type from magic bytes header."""
    if data.startswith(b"\x89PNG\r\n\x1a\n"):
        return "image/png"
    elif data.startswith(b"\xff\xd8\xff"):
        return "image/jpeg"
    elif data.startswith(b"RIFF") and b"WEBP" in data[:16]:
        return "image/webp"
    elif data.startswith(b"GIF8"):
        return "image/gif"
    return "image/jpeg"


async def analyze_leaf_image_with_gemini(image_bytes: bytes) -> Optional[dict[str, Any]]:
    """Analyzes a leaf image using Gemini Vision models to extract dynamic biophysical popping characteristics."""
    client = get_gemini_client()
    if not client:
        return None

    mime_type = _detect_image_mime_type(image_bytes)
    image_part = types.Part.from_bytes(data=image_bytes, mime_type=mime_type)

    prompt = (
        "You are the Lead Biophysicist and Master Acoustic Analyst at IlaPottikal AI Laboratory.\n"
        "Inspect this exact leaf photo in high visual detail. Carefully observe its unique visual features:\n"
        "1. Leaf geometry and species type (e.g. broad, oak, maple, needle, tropical, succulent, dry_crisp).\n"
        "2. Coloration, yellowing/brown spots, surface dryness, texture, and hydration level.\n"
        "3. Vein density, rib structure, and structural edge stiffness.\n\n"
        "Calculate highly dynamic, image-specific biophysical metrics for THIS photo. "
        "Do NOT return static default scores (like 75 or 70) — derive precise numbers based strictly on what you see.\n\n"
        "Return ONLY a raw JSON object (no markdown formatting, no code blocks) matching this exact schema:\n"
        "{\n"
        '  "leaf_type": "broad" | "oak" | "maple" | "needle" | "tropical" | "succulent" | "dry_crisp",\n'
        '  "health_condition": "fresh" | "dry" | "crisp" | "wilted" | "diseased",\n'
        '  "dryness_score": <float between 0.05 and 0.99>,\n'
        '  "vein_density": <float between 0.10 and 0.95>,\n'
        '  "pop_potential": <integer between 15 and 99 reflecting crack potential>,\n'
        '  "predicted_loudness": <integer between 15 and 99>,\n'
        '  "predicted_sharpness": <integer between 15 and 99>,\n'
        '  "predicted_duration": <float seconds e.g. 0.02 to 0.12>,\n'
        '  "difficulty": "easy" | "medium" | "hard" | "legendary",\n'
        '  "recommendation": "<1-2 sentence highly specific popping advice tailored to this exact leaf shape and dryness>",\n'
        '  "confidence": <float 0.85 to 0.99>\n'
        "}"
    )

    for model in GEMINI_MODELS:
        try:
            response = client.models.generate_content(
                model=model,
                contents=[image_part, prompt],
                config=types.GenerateContentConfig(
                    response_mime_type="application/json",
                    temperature=0.6,
                ),
            )

            if response and response.text:
                clean_text = response.text.strip().removeprefix("```json").removeprefix("```").removesuffix("```").strip()
                data = json.loads(clean_text)
                logger.info("Gemini Vision leaf analysis succeeded with model %s: %s (potential=%s)",
                            model, data.get("leaf_type"), data.get("pop_potential"))
                data["_model"] = model
                return data

        except Exception as exc:  # noqa: BLE001
            logger.warning("Gemini Vision model %s attempt failed: %s", model, exc)
            continue

    return None


async def analyze_pop_audio_with_gemini(audio_bytes: bytes, mime_type: str = "audio/wav") -> Optional[dict[str, Any]]:
    """Analyzes a leaf pop audio recording using Gemini Multimodal Audio models."""
    client = get_gemini_client()
    if not client:
        return None

    # Standardize MIME type for Gemini
    if "wav" in mime_type:
        gemini_mime = "audio/wav"
    elif "mp3" in mime_type or "mpeg" in mime_type:
        gemini_mime = "audio/mp3"
    elif "ogg" in mime_type:
        gemini_mime = "audio/ogg"
    elif "flac" in mime_type:
        gemini_mime = "audio/flac"
    elif "aac" in mime_type:
        gemini_mime = "audio/aac"
    else:
        gemini_mime = "audio/wav"

    try:
        audio_part = types.Part.from_bytes(data=audio_bytes, mime_type=gemini_mime)
    except Exception as exc:  # noqa: BLE001
        logger.warning("Could not create Gemini audio part: %s", exc)
        return None

    prompt = (
        "You are the Chief Acoustic Scientist at IlaPottikal Leaf Pop Laboratory.\n"
        "Listen to this recorded audio clip of a physical leaf snap / pop event.\n"
        "Evaluate the exact physical pop sound heard in the audio:\n"
        "1. Snap Sharpness: High frequency transient energy, crispness, and sudden attack.\n"
        "2. Crack Loudness: Volume and energy burst compared to background ambient noise.\n"
        "3. Acoustic Clarity: Clean pop sound without rustling, echo, or muffled background noise.\n"
        "4. Impact Energy: Physical force and pop resonance.\n\n"
        "Return ONLY a raw JSON object (no markdown formatting, no code blocks) matching this exact schema:\n"
        "{\n"
        '  "pop_detected": true,\n'
        '  "pop_quality": "explosive" | "crisp" | "moderate" | "soft" | "muffled",\n'
        '  "loudness_score": <integer 0 to 100>,\n'
        '  "sharpness_score": <integer 0 to 100>,\n'
        '  "clarity_score": <integer 0 to 100>,\n'
        '  "impact_score": <integer 0 to 100>,\n'
        '  "overall_score": <integer 0 to 100>,\n'
        '  "commentary": "<1-2 sentence witty, expert acoustic verdict about this leaf pop sound>",\n'
        '  "confidence": <float 0.85 to 0.99>\n'
        "}"
    )

    for model in GEMINI_MODELS:
        try:
            response = client.models.generate_content(
                model=model,
                contents=[audio_part, prompt],
                config=types.GenerateContentConfig(
                    response_mime_type="application/json",
                    temperature=0.4,
                ),
            )

            if response and response.text:
                clean_text = response.text.strip().removeprefix("```json").removeprefix("```").removesuffix("```").strip()
                data = json.loads(clean_text)
                logger.info("Gemini Audio pop analysis succeeded with model %s: score=%s (%s)",
                            model, data.get("overall_score"), data.get("pop_quality"))
                data["_model"] = model
                return data

        except Exception as exc:  # noqa: BLE001
            logger.warning("Gemini Audio model %s attempt failed: %s", model, exc)
            continue

    return None
