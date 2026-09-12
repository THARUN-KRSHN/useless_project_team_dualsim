from io import BytesIO

import numpy as np
import pytest
import soundfile as sf

from app.ml.audio_features import extract_audio_features
from app.utils.errors import PopNotDetectedError

SR = 22050


def _wav_bytes(samples: np.ndarray, sr: int = SR) -> bytes:
    buf = BytesIO()
    sf.write(buf, samples, sr, format="WAV")
    return buf.getvalue()


def _synthetic_pop(sr: int = SR) -> np.ndarray:
    """2 seconds of near-silence with a sharp transient 'pop' in the middle."""
    duration = 2.0
    t = np.linspace(0, duration, int(sr * duration), endpoint=False)
    signal = np.random.normal(0, 0.001, size=t.shape)  # background hiss

    pop_start = int(sr * 1.0)
    pop_len = int(sr * 0.15)
    envelope = np.exp(-np.linspace(0, 12, pop_len))  # sharp decay
    pop_tone = np.sin(2 * np.pi * 1200 * np.linspace(0, 0.15, pop_len)) * envelope
    signal[pop_start:pop_start + pop_len] += pop_tone * 0.9
    return signal.astype(np.float32)


def test_extract_audio_features_detects_pop():
    audio_bytes = _wav_bytes(_synthetic_pop())
    features = extract_audio_features(audio_bytes)

    assert features.audio_duration == pytest.approx(2.0, abs=0.05)
    assert features.peak_amplitude > 0.3
    assert features.pop_duration < 1.0
    assert features.signal_to_noise > 0


def test_silence_raises_pop_not_detected():
    silence = np.zeros(SR * 2, dtype=np.float32)
    with pytest.raises(PopNotDetectedError):
        extract_audio_features(_wav_bytes(silence))


@pytest.mark.asyncio
async def test_upload_and_score_pop_response():
    from app.services.audio_service import upload_and_score_pop
    audio_bytes = _wav_bytes(_synthetic_pop())
    result = await upload_and_score_pop("user-test-response", "test_pop.wav", audio_bytes)

    assert "pop_id" in result
    assert "id" in result
    assert "score" in result
    assert "result" in result
    assert "final_score" in result
    assert result["final_score"] > 0
    assert result["score"]["final_score"] == result["final_score"]
    assert "audio_features" in result
    assert result["pop_detected"] is True
    assert "message" in result

