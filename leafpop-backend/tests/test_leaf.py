from io import BytesIO

import numpy as np
from PIL import Image

from app.ml.leaf_features import extract_leaf_features
from app.ml.leaf_predictor import predict_pop_potential


def _synthetic_leaf_png() -> bytes:
    """A simple green oval on a white background — enough to exercise the CV pipeline."""
    img = np.full((300, 400, 3), 255, dtype=np.uint8)
    yy, xx = np.ogrid[:300, :400]
    mask = ((xx - 200) / 120) ** 2 + ((yy - 150) / 80) ** 2 <= 1
    img[mask] = [40, 140, 40]  # green
    buf = BytesIO()
    Image.fromarray(img).save(buf, format="PNG")
    return buf.getvalue()


def test_extract_leaf_features_returns_valid_ranges():
    features = extract_leaf_features(_synthetic_leaf_png())
    assert 0 <= features.vein_density <= 1
    assert 0 <= features.dryness_score <= 1
    assert 0 <= features.area_ratio <= 1
    assert features.shape in {
        "Broad Leaf", "Narrow Leaf", "Oval Leaf", "Long Leaf", "Round Leaf", "Unknown",
    }


def test_predict_pop_potential_is_bounded():
    features = extract_leaf_features(_synthetic_leaf_png())
    prediction = predict_pop_potential(features)
    assert 0 <= prediction.pop_potential <= 100
    assert prediction.difficulty in {"Easy", "Medium", "Hard"}
