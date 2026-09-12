"""
Orchestrates the leaf upload flow (Section 12 of the spec):
    receive -> validate -> generate UUID -> upload to storage -> create record
"""
import logging
import mimetypes
import uuid

from app.config.constants import TABLE_LEAVES  # noqa: F401 (kept for clarity/reference)
from app.config.settings import get_settings
from app.db import queries
from app.utils.errors import LeafNotFoundError
from app.utils.file_validation import validate_image_upload

logger = logging.getLogger("leafpop.leaf_service")
settings = get_settings()


async def upload_leaf(user_id: str, filename: str, content: bytes) -> dict:
    validate_image_upload(filename, content)

    leaf_uuid = str(uuid.uuid4())
    ext = filename.rsplit(".", 1)[-1].lower() if "." in filename else "jpg"
    storage_path = f"{user_id}/{leaf_uuid}.{ext}"
    content_type = mimetypes.guess_type(filename)[0] or "image/jpeg"

    image_url = queries.upload_to_storage(
        bucket=settings.supabase_storage_leaf_bucket,
        path=storage_path,
        content=content,
        content_type=content_type,
    )

    record = queries.create_leaf_record(user_id=user_id, image_url=image_url, file_path=storage_path)
    logger.info("Leaf uploaded: leaf_id=%s user_id=%s", record["id"], user_id)
    return record


def get_leaf_report(leaf_id: str) -> dict:
    leaf = queries.get_leaf_by_id(leaf_id)
    if not leaf:
        raise LeafNotFoundError(f"No leaf found with id {leaf_id}")

    analysis = queries.get_latest_analysis_for_leaf(leaf_id)
    prediction = None
    if analysis:
        prediction = {
            "pop_potential": analysis.get("pop_potential"),
            "predicted_loudness": analysis.get("predicted_loudness"),
            "predicted_sharpness": analysis.get("predicted_sharpness"),
            "predicted_duration": analysis.get("predicted_duration"),
            "difficulty": analysis.get("difficulty"),
            "recommendation": analysis.get("recommendation"),
            "confidence": analysis.get("confidence"),
        }

    return {"leaf": leaf, "analysis": analysis, "prediction": prediction}
