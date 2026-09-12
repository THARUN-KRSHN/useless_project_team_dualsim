"""
Real pop scoring (Section 24). Converts raw AudioFeatures into the four
0-100 sub-scores, then combines them with AUDIO_SCORE_WEIGHTS.

These normalization ranges are hackathon-reasonable heuristics, not
scientifically calibrated acoustic thresholds — tune them against real
recordings once you have some.
"""
from app.config.constants import AUDIO_SCORE_WEIGHTS, get_score_message
from app.ml.audio_features import AudioFeatures
from app.utils.scoring import clamp, normalize, weighted_sum


def score_real_pop(features: AudioFeatures) -> dict:
    loudness = normalize(features.peak_amplitude, 0.02, 1.0)
    # Sharpness: fast attack + bright spectral centroid = a "crack" not a "thud".
    attack_component = normalize(0.08 - features.attack_time, -0.05, 0.08)  # faster attack -> higher
    brightness_component = normalize(features.spectral_centroid, 500, 6000)
    sharpness = clamp(0.5 * attack_component + 0.5 * brightness_component)

    clarity = normalize(features.signal_to_noise, 0, 40)

    # Impact: strong energy delivered quickly (short but energetic pop).
    energy_component = normalize(features.rms_energy, 0.01, 0.6)
    duration_component = normalize(0.3 - features.pop_duration, -0.1, 0.3)
    impact = clamp(0.6 * energy_component + 0.4 * duration_component)

    final_score = weighted_sum(
        {"loudness": loudness, "sharpness": sharpness, "clarity": clarity, "impact": impact},
        AUDIO_SCORE_WEIGHTS,
    )

    return {
        "loudness": round(loudness, 1),
        "sharpness": round(sharpness, 1),
        "clarity": round(clarity, 1),
        "impact": round(impact, 1),
        "final_score": round(final_score, 1),
        "message": get_score_message(final_score),
    }
