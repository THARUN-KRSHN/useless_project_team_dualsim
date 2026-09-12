from app.ml.audio_features import AudioFeatures
from app.services.scoring_service import score_real_pop
from app.utils.scoring import clamp, normalize, weighted_sum, prediction_error


def test_normalize_and_clamp():
    assert normalize(50, 0, 100) == 50
    assert normalize(-10, 0, 100) == 0
    assert normalize(150, 0, 100) == 100
    assert clamp(150) == 100
    assert clamp(-10) == 0


def test_weighted_sum_basic():
    score = weighted_sum({"a": 100, "b": 0}, {"a": 0.5, "b": 0.5})
    assert score == 50


def test_score_real_pop_loud_sharp_pop_scores_high():
    loud_sharp = AudioFeatures(
        audio_duration=1.5, peak_amplitude=0.95, rms_energy=0.5,
        peak_frequency=3000, spectral_centroid=4500, attack_time=0.01,
        pop_duration=0.12, noise_level=0.01, signal_to_noise=30,
    )
    result = score_real_pop(loud_sharp)
    assert result["final_score"] > 60


def test_score_real_pop_quiet_dull_pop_scores_low():
    quiet_dull = AudioFeatures(
        audio_duration=1.5, peak_amplitude=0.05, rms_energy=0.02,
        peak_frequency=300, spectral_centroid=600, attack_time=0.07,
        pop_duration=0.3, noise_level=0.03, signal_to_noise=3,
    )
    result = score_real_pop(quiet_dull)
    assert result["final_score"] < 40


def test_prediction_error_message_directions():
    under = prediction_error(predicted=70, actual=90)
    assert "underestimated" in under["message"]

    over = prediction_error(predicted=90, actual=70)
    assert "overestimated" in over["message"]

    accurate = prediction_error(predicted=80, actual=81)
    assert "accurate" in accurate["message"]
