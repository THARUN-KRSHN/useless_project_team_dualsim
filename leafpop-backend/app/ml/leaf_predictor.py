"""
Pop Potential prediction (Section 16/17 of the spec).

RULE-BASED MVP -> collect real (features, actual_pop_score) pairs from
pop_attempts joined to leaf_analyses -> train a RandomForestRegressor here
without touching the public predict_pop_potential() signature. Routes and
services never need to change when that upgrade happens.
"""
from dataclasses import dataclass, asdict

from app.config.constants import LEAF_PREDICTION_WEIGHTS
from app.ml.leaf_features import LeafFeatures
from app.utils.scoring import clamp, weighted_sum


@dataclass
class PopPrediction:
    pop_potential: int
    predicted_loudness: int
    predicted_sharpness: int
    predicted_duration: float
    difficulty: str
    recommendation: str
    confidence: float

    def to_dict(self) -> dict:
        return asdict(self)


def _shape_score(shape: str) -> float:
    # Broad, flat leaves are classic "satisfying pop" shapes; narrow/long
    # leaves tend to fold rather than pop cleanly.
    table = {
        "Broad Leaf": 90, "Round Leaf": 80, "Oval Leaf": 70,
        "Long Leaf": 45, "Narrow Leaf": 35, "Unknown": 55,
    }
    return table.get(shape, 55)


def predict_pop_potential(features: LeafFeatures) -> PopPrediction:
    thickness_score = features.thickness_estimate * 100
    dryness_score = (1 - features.dryness_score) * 100  # fresher (low dryness) scores higher
    area_score = features.area_ratio * 100
    shape_score = _shape_score(features.shape)
    vein_score = features.vein_density * 100

    pop_potential = weighted_sum(
        {
            "thickness": thickness_score,
            "dryness": dryness_score,
            "area": area_score,
            "shape": shape_score,
            "vein_structure": vein_score,
        },
        LEAF_PREDICTION_WEIGHTS,
    )

    # Derived acoustic predictions — simple heuristics tied to the same features.
    predicted_loudness = clamp(0.5 * thickness_score + 0.3 * area_score + 0.2 * shape_score)
    predicted_sharpness = clamp(0.6 * dryness_score * 0.4 + 0.6 * vein_score + 20)
    # Drier + thinner leaves pop faster (shorter duration); scale to ~0.1-0.35s.
    predicted_duration = round(0.35 - 0.20 * (dryness_score / 100) - 0.10 * (thickness_score / 100), 3)
    predicted_duration = max(0.05, predicted_duration)

    if pop_potential >= 75:
        difficulty = "Easy"
        recommendation = "Fast thumb press"
    elif pop_potential >= 45:
        difficulty = "Medium"
        recommendation = "Firm two-finger pinch"
    else:
        difficulty = "Hard"
        recommendation = "Sharp snap fold, then press"

    # Confidence proxy: how decisively the CV pipeline segmented the leaf.
    confidence = clamp(50 + features.area_ratio * 50, 0, 100) / 100

    return PopPrediction(
        pop_potential=round(pop_potential),
        predicted_loudness=round(predicted_loudness),
        predicted_sharpness=round(predicted_sharpness),
        predicted_duration=predicted_duration,
        difficulty=difficulty,
        recommendation=recommendation,
        confidence=round(confidence, 2),
    )
