"""
Image retrieval helper used by the analysis pipeline. Uploading is handled
directly in leaf_service (it owns the leaves table write that must happen
alongside the storage write).
"""
import base64
import httpx

from app.utils.errors import StorageError

_MOCK_STORAGE_FILES: dict[str, bytes] = {}


async def download_image(image_url: str) -> bytes:
    if image_url in _MOCK_STORAGE_FILES:
        return _MOCK_STORAGE_FILES[image_url]

    if image_url.startswith("data:"):
        try:
            _, encoded = image_url.split(",", 1)
            return base64.b64decode(encoded)
        except Exception as exc:
            raise StorageError(f"Invalid data URL format: {exc}") from exc

    try:
        async with httpx.AsyncClient(timeout=15.0) as client:
            response = await client.get(image_url)
            response.raise_for_status()
            return response.content
    except httpx.HTTPError as exc:
        raise StorageError(f"Failed to download leaf image: {exc}") from exc

