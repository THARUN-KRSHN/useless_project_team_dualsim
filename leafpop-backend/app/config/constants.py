"""
Shared constants: allowed file types, table names, scoring weights, message bands.
"""

# ---------------------------------------------------------------------------
# File validation
# ---------------------------------------------------------------------------
ALLOWED_IMAGE_MIME_TYPES = {"image/jpeg", "image/png", "image/webp"}
ALLOWED_IMAGE_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp"}

ALLOWED_AUDIO_MIME_TYPES = {
    "audio/wav", "audio/x-wav", "audio/wave",
    "audio/mpeg", "audio/mp3",
    "audio/webm",
    "audio/mp4", "audio/x-m4a", "audio/m4a",
}
ALLOWED_AUDIO_EXTENSIONS = {".wav", ".mp3", ".webm", ".m4a"}

# ---------------------------------------------------------------------------
# Database tables
# ---------------------------------------------------------------------------
TABLE_PROFILES = "profiles"
TABLE_LEAVES = "leaves"
TABLE_LEAF_ANALYSES = "leaf_analyses"
TABLE_POP_ATTEMPTS = "pop_attempts"
TABLE_VIRTUAL_ATTEMPTS = "virtual_attempts"

# ---------------------------------------------------------------------------
# Leaf classification categories (MVP rule-based)
# ---------------------------------------------------------------------------
LEAF_CATEGORIES = ["Broad Leaf", "Narrow Leaf", "Oval Leaf", "Long Leaf", "Round Leaf", "Unknown"]

# ---------------------------------------------------------------------------
# Pop Potential prediction weights (Section 17)
# ---------------------------------------------------------------------------
LEAF_PREDICTION_WEIGHTS = {
    "thickness": 0.30,
    "dryness": 0.20,   # lower dryness -> higher score (fresher pops better)
    "area": 0.20,
    "shape": 0.15,
    "vein_structure": 0.15,
}

# ---------------------------------------------------------------------------
# Real pop audio scoring weights (Section 24)
# ---------------------------------------------------------------------------
AUDIO_SCORE_WEIGHTS = {
    "loudness": 0.30,
    "sharpness": 0.30,
    "clarity": 0.20,
    "impact": 0.20,
}

# ---------------------------------------------------------------------------
# Virtual pop scoring weights (Section 28)
# ---------------------------------------------------------------------------
VIRTUAL_SCORE_WEIGHTS = {
    "velocity": 0.35,
    "reaction": 0.25,
    "impact": 0.15,
    "timing": 0.15,
    "combo": 0.10,
}

# ---------------------------------------------------------------------------
# Score message bands (Section 26)
# ---------------------------------------------------------------------------
SCORE_MESSAGE_BANDS = [
    (0, 30, "That was barely a pop."),
    (31, 50, "Leaf survived."),
    (51, 70, "Respectable pop."),
    (71, 85, "That's a good one!"),
    (86, 95, "CRACK! Excellent pop!"),
    (96, 99, "Absolutely violent."),
    (100, 100, "LEAF POP GOD."),
]


def get_score_message(score: float) -> str:
    score = max(0, min(100, round(score)))
    for low, high, message in SCORE_MESSAGE_BANDS:
        if low <= score <= high:
            return message
    return "Pop recorded."
