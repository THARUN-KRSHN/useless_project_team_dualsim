"""
Small audio helpers that don't belong to the feature-extraction pipeline itself.
"""
import hashlib

import numpy as np


def sha256_of_bytes(content: bytes) -> str:
    """Used for leaderboard anti-cheat: reject identical re-submitted recordings."""
    return hashlib.sha256(content).hexdigest()


def amplitude_envelope(samples: np.ndarray, frame_size: int = 1024, hop_size: int = 512) -> np.ndarray:
    """Simple max-amplitude envelope over sliding frames."""
    if len(samples) < frame_size:
        return np.array([np.max(np.abs(samples))]) if len(samples) else np.array([0.0])
    return np.array([
        np.max(np.abs(samples[i:i + frame_size]))
        for i in range(0, len(samples) - frame_size + 1, hop_size)
    ])
