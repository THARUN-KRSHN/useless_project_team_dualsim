"""
Orchestrates the real-pop flow (Section 20):
    receive -> validate -> upload to storage -> create pop attempt ->
    analyze audio -> calculate score -> save result -> update leaderboard

Also implements the anti-cheat measures from Section 42 (duplicate-audio
hash rejection, rate limiting) and the AI-vs-actual comparison from Section 46.
"""
import logging
import mimetypes
import uuid
from datetime import datetime, timedelta, timezone

from app.config.settings import get_settings
from app.db import queries
from app.ml.audio_features import extract_audio_features
from app.services.scoring_service import score_real_pop
from app.utils.audio_utils import sha256_of_bytes
from app.utils.errors import DuplicateSubmissionError, RateLimitError, LeafNotFoundError
from app.utils.file_validation import validate_audio_upload, validate_audio_duration
from app.utils.scoring import prediction_error

logger = logging.getLogger("leafpop.audio_service")
settings = get_settings()


def _check_rate_limit(user_id: str) -> None:
    since = (datetime.now(timezone.utc) - timedelta(minutes=1)).isoformat()
    recent = queries.count_recent_pop_attempts(user_id, since)
    if recent >= settings.max_pop_attempts_per_minute:
        raise RateLimitError(
            f"Too many pop attempts — max {settings.max_pop_attempts_per_minute} per minute."
        )


async def upload_and_score_pop(user_id: str, filename: str, content: bytes,
                                leaf_id: str | None = None,
                                source: str = "uploaded") -> dict:
    validate_audio_upload(filename, content)
    _check_rate_limit(user_id)

    audio_hash = sha256_of_bytes(content)
    if queries.find_pop_attempt_by_hash(audio_hash):
        raise DuplicateSubmissionError("This recording has already been submitted.")

    logger.info("Pop audio received: user_id=%s leaf_id=%s", user_id, leaf_id)

    # Extract features first (this also validates it's decodable and has a pop) —
    # no point uploading unusable audio to storage.
    features = extract_audio_features(content)
    validate_audio_duration(features.audio_duration)
    logger.info("Pop detected: user_id=%s duration=%.2fs", user_id, features.pop_duration)

    leaf = None
    if leaf_id:
        leaf = queries.get_leaf_by_id(leaf_id)
        if not leaf:
            raise LeafNotFoundError(f"No leaf found with id {leaf_id}")

    pop_uuid = str(uuid.uuid4())
    ext = filename.rsplit(".", 1)[-1].lower() if "." in filename else "webm"
    storage_path = f"{user_id}/{pop_uuid}.{ext}"
    content_type = mimetypes.guess_type(filename)[0] or "audio/webm"

    audio_url = queries.upload_to_storage(
        bucket=settings.supabase_storage_audio_bucket,
        path=storage_path,
        content=content,
        content_type=content_type,
    )

    score_breakdown = score_real_pop(features)
    logger.info("Score calculated: user_id=%s final_score=%s", user_id, score_breakdown["final_score"])

    saved = queries.save_pop_attempt(
        user_id=user_id,
        leaf_id=leaf_id,
        audio_url=audio_url,
        audio_features=features.to_dict(),
        score_breakdown=score_breakdown,
        audio_hash=audio_hash,
        source=source,
    )
    queries.update_profile_stats(user_id, score_breakdown["final_score"])

    # AI prediction vs actual (Section 46) — only possible if this pop was
    # tied to a previously analyzed leaf.
    comparison = None
    if leaf_id:
        analysis = queries.get_latest_analysis_for_leaf(leaf_id)
        if analysis and analysis.get("pop_potential") is not None:
            comparison = prediction_error(
                predicted=float(analysis["pop_potential"]),
                actual=float(score_breakdown["final_score"]),
            )

    return {
        "pop_id": saved["id"],
        "id": saved["id"],
        "score": score_breakdown,
        "result": {
            "loudness": score_breakdown["loudness"],
            "sharpness": score_breakdown["sharpness"],
            "clarity": score_breakdown["clarity"],
            "impact": score_breakdown["impact"],
            "final_score": score_breakdown["final_score"],
        },
        "final_score": score_breakdown["final_score"],
        "audio_features": features.to_dict(),
        "pop_detected": True,
        "message": score_breakdown["message"],
        "prediction_comparison": comparison,
    }


def get_pop_result(pop_id: str) -> dict:
    from app.utils.errors import PopNotFoundError

    pop = queries.get_pop_attempt(pop_id)
    if not pop:
        raise PopNotFoundError(f"No pop attempt found with id {pop_id}")
    return pop
