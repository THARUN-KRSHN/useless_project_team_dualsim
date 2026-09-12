"""
Virtual leaf scoring (Sections 27-28, 43). The frontend sends raw interaction
metrics only — never a score — and the backend is the sole source of truth
for the final number, same as the real-pop audio path.
"""
import logging
from datetime import datetime, timedelta, timezone

from app.config.constants import VIRTUAL_SCORE_WEIGHTS, get_score_message
from app.config.settings import get_settings
from app.db import queries
from app.utils.errors import RateLimitError
from app.utils.scoring import clamp, normalize, weighted_sum

logger = logging.getLogger("leafpop.virtual_game_service")
settings = get_settings()


def _check_rate_limit(user_id: str) -> None:
    since = (datetime.now(timezone.utc) - timedelta(minutes=1)).isoformat()
    recent = queries.count_recent_virtual_attempts(user_id, since)
    if recent >= settings.max_pop_attempts_per_minute:
        raise RateLimitError(
            f"Too many virtual pop attempts — max {settings.max_pop_attempts_per_minute} per minute."
        )


def _impact_position_score(x: float, y: float) -> float:
    """Center-of-leaf taps score highest; edge taps score lower."""
    dx, dy = x - 0.5, y - 0.5
    distance_from_center = (dx ** 2 + dy ** 2) ** 0.5  # max ~0.707
    return normalize(0.707 - distance_from_center, 0, 0.707)


def score_virtual_pop(interaction: dict) -> dict:
    velocity_value = interaction.get("max_velocity", interaction.get("velocity", 0))
    reaction_value = interaction.get("reaction_time", interaction.get("reaction_time_ms", 0) / 1000.0)
    impact_x = interaction.get("impact_x", interaction.get("click_x", 0.5))
    impact_y = interaction.get("impact_y", interaction.get("click_y", 0.5))
    total_duration = interaction.get("total_duration", interaction.get("duration_ms", 0) / 1000.0)

    velocity_score = normalize(float(velocity_value), 5, 120)
    reaction_score = normalize(0.6 - float(reaction_value), -0.2, 0.6)
    impact_position_score = _impact_position_score(float(impact_x), float(impact_y))
    # Timing rewards a decisive, quick interaction over a long drawn-out one.
    timing_score = normalize(1.0 - float(total_duration), -0.5, 1.0)
    combo_score = normalize(float(interaction.get("combo", 1)), 1, 10)

    final_score = weighted_sum(
        {
            "velocity": velocity_score,
            "reaction": reaction_score,
            "impact": impact_position_score,
            "timing": timing_score,
            "combo": combo_score,
        },
        VIRTUAL_SCORE_WEIGHTS,
    )

    pop_strength = clamp(0.7 * velocity_score + 0.3 * impact_position_score) / 100

    impact_label = "HIGH" if final_score >= 75 else "MEDIUM" if final_score >= 45 else "LOW"

    return {
        "final_score": round(final_score),
        "impact": impact_label,
        "pop_strength": round(pop_strength, 2),
        "message": get_score_message(final_score),
    }


def submit_virtual_pop(user_id: str, interaction: dict) -> dict:
    _check_rate_limit(user_id)

    score_breakdown = score_virtual_pop(interaction)
    saved = queries.save_virtual_attempt(user_id, interaction, score_breakdown)
    queries.update_profile_stats(user_id, score_breakdown["final_score"])

    logger.info("Virtual pop scored: user_id=%s score=%s", user_id, score_breakdown["final_score"])

    return {
        "score": score_breakdown["final_score"],
        "impact": score_breakdown["impact"],
        "pop_strength": score_breakdown["pop_strength"],
        "message": score_breakdown["message"],
        "_raw": saved,
    }
