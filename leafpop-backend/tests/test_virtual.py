from app.schemas.virtual import VirtualPopRequest
from app.services.virtual_game_service import score_virtual_pop


def _base_interaction(**overrides) -> dict:
    interaction = {
        "leaf_type": "broad",
        "tap_count": 1,
        "total_duration": 0.3,
        "max_velocity": 90,
        "average_velocity": 80,
        "reaction_time": 0.25,
        "impact_x": 0.5,
        "impact_y": 0.5,
        "combo": 1,
    }
    interaction.update(overrides)
    return interaction


def test_fast_centered_tap_scores_high():
    result = score_virtual_pop(_base_interaction())
    assert result["final_score"] > 60
    assert result["impact"] in {"MEDIUM", "HIGH"}


def test_slow_edge_tap_scores_low():
    slow_edge = _base_interaction(
        max_velocity=8, average_velocity=6, reaction_time=1.5,
        impact_x=0.02, impact_y=0.98, total_duration=2.0,
    )
    result = score_virtual_pop(slow_edge)
    assert result["final_score"] < 40
    assert result["impact"] == "LOW"


def test_score_is_bounded_0_to_100():
    extreme = _base_interaction(max_velocity=9999, reaction_time=0, total_duration=0, combo=100)
    result = score_virtual_pop(extreme)
    assert 0 <= result["final_score"] <= 100


def test_frontend_virtual_payload_is_accepted():
    payload = {
        "click_x": 0.48,
        "click_y": 0.52,
        "velocity": 0.82,
        "duration_ms": 340,
        "reaction_time_ms": 180,
    }
    model = VirtualPopRequest.model_validate(payload)
    assert model.impact_x == 0.48
    assert model.impact_y == 0.52
    assert model.total_duration == 0.34
    assert model.reaction_time == 0.18
    assert model.tap_count == 1
