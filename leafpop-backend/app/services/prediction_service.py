"""
Orchestrates leaf analysis (Section 18):
    get leaf -> download image -> extract features -> run prediction ->
    store analysis -> return report
"""
import logging

from app.db import queries
from app.ml.leaf_features import extract_leaf_features
from app.ml.leaf_predictor import predict_pop_potential
from app.services.image_service import download_image
from app.utils.errors import AnalysisFailedError, LeafNotFoundError

logger = logging.getLogger("leafpop.prediction_service")


async def analyze_leaf(leaf_id: str) -> dict:
    leaf = queries.get_leaf_by_id(leaf_id)
    if not leaf:
        raise LeafNotFoundError(f"No leaf found with id {leaf_id}")

    logger.info("Leaf analysis started: leaf_id=%s", leaf_id)

    try:
        image_bytes = await download_image(leaf["image_url"])
        features = extract_leaf_features(image_bytes)
        prediction = predict_pop_potential(features)
    except Exception as exc:  # noqa: BLE001
        logger.exception("Leaf analysis failed: leaf_id=%s", leaf_id)
        raise AnalysisFailedError(f"Could not analyze leaf image: {exc}") from exc

    saved = queries.save_leaf_analysis(leaf_id, features.to_dict(), prediction.to_dict())
    logger.info("Leaf analysis completed: leaf_id=%s pop_potential=%s",
                leaf_id, prediction.pop_potential)

    return {
        "leaf_id": leaf_id,
        "analysis": {
            "type": features.leaf_type,
            "condition": features.health_condition,
            "dryness": round(features.dryness_score * 100),
            "vein_density": round(features.vein_density * 100),
            "pop_potential": prediction.pop_potential,
            "predicted_loudness": prediction.predicted_loudness,
            "predicted_sharpness": prediction.predicted_sharpness,
            "predicted_duration": prediction.predicted_duration,
            "difficulty": prediction.difficulty,
            "recommendation": prediction.recommendation,
            "confidence": prediction.confidence,
        },
        "_raw": saved,
    }
