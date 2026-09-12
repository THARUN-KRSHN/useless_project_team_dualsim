"""
Small generic numeric helpers shared by the ML/scoring services.
"""


def clamp(value: float, low: float = 0.0, high: float = 100.0) -> float:
    return max(low, min(high, value))


def normalize(value: float, min_value: float, max_value: float) -> float:
    """Linearly map value from [min_value, max_value] to [0, 100], clamped."""
    if max_value <= min_value:
        return 0.0
    pct = (value - min_value) / (max_value - min_value) * 100.0
    return clamp(pct)


def weighted_sum(components: dict[str, float], weights: dict[str, float]) -> float:
    """
    components: {"loudness": 91, "sharpness": 95, ...} (each already 0-100)
    weights: {"loudness": 0.30, "sharpness": 0.30, ...} (should sum to ~1.0)
    """
    total = 0.0
    weight_sum = 0.0
    for key, weight in weights.items():
        if key in components:
            total += components[key] * weight
            weight_sum += weight
    if weight_sum == 0:
        return 0.0
    # Re-normalize in case some components were missing.
    return clamp(total / weight_sum)


def prediction_error(predicted: float, actual: float) -> dict:
    diff = actual - predicted
    return {
        "predicted_score": round(predicted, 1),
        "actual_score": round(actual, 1),
        "difference": round(diff, 1),
        "absolute_error": round(abs(diff), 1),
        "message": (
            f"AI underestimated this leaf by {abs(round(diff))} points!"
            if diff > 5
            else f"AI overestimated this leaf by {abs(round(diff))} points."
            if diff < -5
            else "AI prediction was accurate!"
        ),
    }
