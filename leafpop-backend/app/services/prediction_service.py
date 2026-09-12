"""
Orchestrates leaf analysis (Section 18):
    get leaf -> download image -> extract features -> run prediction ->
    store analysis -> return report
"""
import logging

from app.db import queries
from app.ml.leaf_features import extract_leaf_features
from app.ml.leaf_predictor import predict_pop_potential
from app.services.gemini_service import analyze_leaf_image_with_gemini
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

        # Enhance leaf analysis using Google Gemini AI multimodal vision model
        gemini_result = await analyze_leaf_image_with_gemini(image_bytes)
        if gemini_result:
            leaf_type = gemini_result.get("leaf_type", features.leaf_type)
            health_condition = gemini_result.get("health_condition", features.health_condition)
            dryness_score = float(gemini_result.get("dryness_score", features.dryness_score))
            vein_density = float(gemini_result.get("vein_density", features.vein_density))
            pop_potential = int(gemini_result.get("pop_potential", prediction.pop_potential))
            predicted_loudness = int(gemini_result.get("predicted_loudness", prediction.predicted_loudness))
            predicted_sharpness = int(gemini_result.get("predicted_sharpness", prediction.predicted_sharpness))
            predicted_duration = float(gemini_result.get("predicted_duration", prediction.predicted_duration))
            difficulty = str(gemini_result.get("difficulty", prediction.difficulty))
            recommendation = str(gemini_result.get("recommendation", prediction.recommendation))
            confidence = float(gemini_result.get("confidence", prediction.confidence))
        else:
            leaf_type = features.leaf_type
            health_condition = features.health_condition
            dryness_score = features.dryness_score
            vein_density = features.vein_density
            pop_potential = prediction.pop_potential
            predicted_loudness = prediction.predicted_loudness
            predicted_sharpness = prediction.predicted_sharpness
            predicted_duration = prediction.predicted_duration
            difficulty = prediction.difficulty
            recommendation = prediction.recommendation
            confidence = prediction.confidence

    except Exception as exc:  # noqa: BLE001
        logger.exception("Leaf analysis failed: leaf_id=%s", leaf_id)
        raise AnalysisFailedError(f"Could not analyze leaf image: {exc}") from exc

    saved = queries.save_leaf_analysis(leaf_id, features.to_dict(), prediction.to_dict())
    logger.info("Leaf analysis completed: leaf_id=%s pop_potential=%s", leaf_id, pop_potential)

    return {
        "leaf_id": leaf_id,
        "analysis": {
            "leaf_type": leaf_type,
            "type": leaf_type,
            "health_condition": health_condition,
            "condition": health_condition,
            "dryness_score": round(dryness_score * 100) if dryness_score <= 1.0 else round(dryness_score),
            "dryness": round(dryness_score * 100) if dryness_score <= 1.0 else round(dryness_score),
            "vein_density": round(vein_density * 100) if vein_density <= 1.0 else round(vein_density),
            "pop_potential": pop_potential,
            "predicted_loudness": predicted_loudness,
            "predicted_sharpness": predicted_sharpness,
            "predicted_duration": predicted_duration,
            "difficulty": difficulty,
            "recommendation": recommendation,
            "confidence": confidence,
            "ai_engine": "Gemini 2.5 Flash Multimodal" if gemini_result else "Computer Vision Rules Engine",
        },
        "_raw": saved,
    }
