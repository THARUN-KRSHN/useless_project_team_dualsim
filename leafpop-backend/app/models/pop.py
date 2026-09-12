"""
Row models for real and virtual pop attempts (pop_attempts / virtual_attempts).
"""
from dataclasses import dataclass
from datetime import datetime


@dataclass
class PopAttemptRow:
    id: str
    user_id: str
    leaf_id: str | None
    audio_url: str
    audio_hash: str
    audio_duration: float
    peak_amplitude: float
    rms_energy: float
    peak_frequency: float
    attack_time: float
    pop_duration: float
    noise_level: float
    signal_to_noise: float
    loudness_score: float
    sharpness_score: float
    clarity_score: float
    impact_score: float
    final_score: float
    created_at: datetime


@dataclass
class VirtualAttemptRow:
    id: str
    user_id: str
    leaf_type: str
    tap_count: int
    total_duration: float
    max_velocity: float
    average_velocity: float
    reaction_time: float
    impact_x: float
    impact_y: float
    combo: int
    generated_pop_strength: float
    final_score: float
    created_at: datetime
