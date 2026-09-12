"""
Real pop audio analysis (Sections 22-23 of the spec).

Pipeline:
    raw audio bytes -> decode with librosa -> find the pop event window
    within the recording -> extract features from that window only.
"""
from dataclasses import dataclass, asdict
from io import BytesIO

import librosa
import numpy as np

from app.utils.audio_utils import amplitude_envelope
from app.utils.errors import PopNotDetectedError

TARGET_SR = 22050


@dataclass
class AudioFeatures:
    audio_duration: float
    peak_amplitude: float        # 0-1
    rms_energy: float            # 0-1 scale (relative)
    peak_frequency: float        # Hz
    spectral_centroid: float     # Hz, brightness/sharpness proxy
    attack_time: float           # seconds
    pop_duration: float          # seconds
    noise_level: float           # 0-1, background noise floor
    signal_to_noise: float       # dB

    def to_dict(self) -> dict:
        return asdict(self)


def load_waveform(audio_bytes: bytes) -> tuple[np.ndarray, int]:
    """Decode arbitrary supported audio bytes into a mono float waveform."""
    import soundfile as sf
    from scipy.io import wavfile

    # 1. Try soundfile directly
    try:
        data, sr = sf.read(BytesIO(audio_bytes), always_2d=False, dtype="float32")
        if data.ndim > 1:
            data = np.mean(data, axis=1)
        if sr != TARGET_SR:
            data = librosa.resample(data, orig_sr=sr, target_sr=TARGET_SR)
            sr = TARGET_SR
        if data.size == 0:
            raise PopNotDetectedError("Audio file contains no audio data.")
        return data, sr
    except Exception:
        pass

    # 2. Try scipy.io.wavfile
    try:
        sr, data = wavfile.read(BytesIO(audio_bytes))
        if data.dtype == np.int16:
            data = data.astype(np.float32) / 32768.0
        elif data.dtype == np.int32:
            data = data.astype(np.float32) / 2147483648.0
        elif data.dtype == np.uint8:
            data = (data.astype(np.float32) - 128.0) / 128.0
        if data.ndim > 1:
            data = np.mean(data, axis=1)
        if sr != TARGET_SR:
            data = librosa.resample(data, orig_sr=sr, target_sr=TARGET_SR)
            sr = TARGET_SR
        if data.size == 0:
            raise PopNotDetectedError("Audio file contains no audio data.")
        return data, sr
    except Exception:
        pass

    # 3. Fallback to librosa.load
    try:
        samples, sr = librosa.load(BytesIO(audio_bytes), sr=TARGET_SR, mono=True)
    except Exception as exc:  # noqa: BLE001
        raise PopNotDetectedError(
            f"Could not decode audio file: {exc}. Please upload a standard WAV, MP3, or OGG recording."
        ) from exc

    if samples.size == 0:
        raise PopNotDetectedError("Audio file contains no audio data.")
    return samples, sr


def _estimate_noise_floor(env: np.ndarray, pop_frame: int) -> float:
    """Average envelope level outside a small window around the pop peak."""
    if len(env) <= 3:
        return float(np.min(env))
    mask = np.ones(len(env), dtype=bool)
    lo, hi = max(0, pop_frame - 2), min(len(env), pop_frame + 3)
    mask[lo:hi] = False
    background = env[mask]
    if background.size == 0:
        return float(np.min(env))
    return float(np.mean(background))


def detect_pop_window(samples: np.ndarray, sr: int) -> tuple[int, int]:
    """
    Find the sample-index window containing the loudest transient ("the pop").
    Simple, robust approach for an MVP: amplitude envelope + peak search,
    then expand outward while the envelope stays above a decay threshold.
    """
    frame_size = 1024
    hop_size = 256
    env = amplitude_envelope(samples, frame_size=frame_size, hop_size=hop_size)

    if env.size == 0 or np.max(env) < 1e-4:
        raise PopNotDetectedError("No audible pop event found in the recording.")

    peak_frame = int(np.argmax(env))
    peak_value = env[peak_frame]
    noise_floor = _estimate_noise_floor(env, peak_frame)

    # A "pop" must clearly stand out above the ambient noise floor.
    if peak_value < max(noise_floor * 3, 0.02):
        raise PopNotDetectedError(
            "Couldn't detect a clear pop — try recording closer to the leaf with less background noise."
        )

    threshold = noise_floor + 0.15 * (peak_value - noise_floor)

    start_frame = peak_frame
    while start_frame > 0 and env[start_frame] > threshold:
        start_frame -= 1

    end_frame = peak_frame
    while end_frame < len(env) - 1 and env[end_frame] > threshold:
        end_frame += 1

    # Small padding so we capture the full transient, not just its core.
    pad_frames = 2
    start_frame = max(0, start_frame - pad_frames)
    end_frame = min(len(env) - 1, end_frame + pad_frames)

    start_sample = start_frame * hop_size
    end_sample = min(len(samples), end_frame * hop_size + frame_size)

    if end_sample <= start_sample:
        raise PopNotDetectedError("Pop event window could not be isolated.")

    return start_sample, end_sample


def extract_audio_features(audio_bytes: bytes) -> AudioFeatures:
    samples, sr = load_waveform(audio_bytes)
    total_duration = float(len(samples) / sr)

    start, end = detect_pop_window(samples, sr)
    pop_segment = samples[start:end]
    pop_duration = float(len(pop_segment) / sr)

    peak_amplitude = float(np.max(np.abs(pop_segment))) if pop_segment.size else 0.0
    rms_energy = float(np.sqrt(np.mean(pop_segment ** 2))) if pop_segment.size else 0.0

    # Spectral features over the isolated pop segment.
    if pop_segment.size >= 32:
        stft = np.abs(librosa.stft(pop_segment, n_fft=1024, hop_length=256))
        freqs = librosa.fft_frequencies(sr=sr, n_fft=1024)
        avg_spectrum = np.mean(stft, axis=1)
        peak_frequency = float(freqs[int(np.argmax(avg_spectrum))]) if avg_spectrum.size else 0.0
        centroid = librosa.feature.spectral_centroid(y=pop_segment, sr=sr, n_fft=1024, hop_length=256)
        spectral_centroid = float(np.mean(centroid)) if centroid.size else 0.0
    else:
        peak_frequency = 0.0
        spectral_centroid = 0.0

    # Attack time: time from segment start to its amplitude peak.
    if pop_segment.size:
        peak_idx = int(np.argmax(np.abs(pop_segment)))
        attack_time = float(peak_idx / sr)
    else:
        attack_time = 0.0

    # Noise floor from the rest of the recording (outside the pop window).
    outside = np.concatenate([samples[:start], samples[end:]]) if (start > 0 or end < len(samples)) else samples
    noise_level = float(np.sqrt(np.mean(outside ** 2))) if outside.size else 0.0

    if noise_level > 1e-6:
        snr_db = float(20 * np.log10(max(rms_energy, 1e-6) / noise_level))
    else:
        snr_db = 60.0  # effectively silent background -> excellent SNR, cap it sanely
    snr_db = float(np.clip(snr_db, 0, 60))

    return AudioFeatures(
        audio_duration=round(total_duration, 3),
        peak_amplitude=round(peak_amplitude, 4),
        rms_energy=round(rms_energy, 4),
        peak_frequency=round(peak_frequency, 1),
        spectral_centroid=round(spectral_centroid, 1),
        attack_time=round(attack_time, 4),
        pop_duration=round(pop_duration, 4),
        noise_level=round(noise_level, 4),
        signal_to_noise=round(snr_db, 2),
    )
