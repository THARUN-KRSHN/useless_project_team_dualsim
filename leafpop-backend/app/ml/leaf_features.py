"""
Leaf image feature extraction (Section 14/15 of the spec).

MVP approach: classic computer-vision measurements with OpenCV/NumPy, not a
trained classifier. This is deliberate — see leaf_predictor.py for the
upgrade path once real leaf-pop data has been collected.
"""
from dataclasses import dataclass, asdict
from io import BytesIO

import cv2
import numpy as np
from PIL import Image

from app.config.constants import LEAF_CATEGORIES


@dataclass
class LeafFeatures:
    leaf_type: str
    health_condition: str
    estimated_size: str
    color: str
    shape: str
    vein_density: float          # 0-1
    surface_condition: str
    dryness_score: float         # 0-1 (0 = fresh, 1 = very dry)
    thickness_estimate: float    # 0-1, proxy derived from edge density
    area_ratio: float            # leaf area / image area, 0-1
    aspect_ratio: float
    circularity: float           # 0-1, 1 = perfect circle

    def to_dict(self) -> dict:
        return asdict(self)


def _load_bgr_image(image_bytes: bytes) -> np.ndarray:
    """Decode raw bytes -> OpenCV BGR array (handles orientation via PIL first)."""
    pil_img = Image.open(BytesIO(image_bytes)).convert("RGB")
    rgb = np.array(pil_img)
    return cv2.cvtColor(rgb, cv2.COLOR_RGB2BGR)


def _largest_leaf_contour(bgr: np.ndarray):
    """Segment the most likely leaf via HSV green-ish masking + contour detection."""
    hsv = cv2.cvtColor(bgr, cv2.COLOR_BGR2HSV)

    # Broad "plant-like" range: greens through yellow-browns, so wilted/dry
    # leaves aren't missed just because they've lost their green.
    lower = np.array([10, 20, 20])
    upper = np.array([95, 255, 255])
    mask = cv2.inRange(hsv, lower, upper)

    mask = cv2.morphologyEx(mask, cv2.MORPH_CLOSE, np.ones((7, 7), np.uint8))
    mask = cv2.morphologyEx(mask, cv2.MORPH_OPEN, np.ones((5, 5), np.uint8))

    contours, _ = cv2.findContours(mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    if not contours:
        return None, mask
    largest = max(contours, key=cv2.contourArea)
    return largest, mask


def _classify_shape(aspect_ratio: float, circularity: float) -> str:
    if circularity > 0.75:
        return "Round Leaf"
    if aspect_ratio > 2.5:
        return "Long Leaf" if aspect_ratio < 4 else "Narrow Leaf"
    if 1.4 <= aspect_ratio <= 2.5:
        return "Oval Leaf"
    if aspect_ratio < 1.4 and circularity <= 0.75:
        return "Broad Leaf"
    return "Unknown"


def _classify_color(mean_hsv: tuple[float, float, float]) -> tuple[str, float]:
    """Returns (color_label, dryness_score 0-1)."""
    h, s, v = mean_hsv
    if h < 25 or h > 150:
        # yellow/brown/orange hues -> drying or dead
        return "Yellow-Brown", 0.75
    if s < 60:
        return "Pale Green", 0.5
    if v < 90:
        return "Dark Green", 0.2
    return "Bright Green", 0.1


def extract_leaf_features(image_bytes: bytes) -> LeafFeatures:
    bgr = _load_bgr_image(image_bytes)
    h, w = bgr.shape[:2]
    image_area = float(h * w)

    contour, mask = _largest_leaf_contour(bgr)

    if contour is None or cv2.contourArea(contour) < image_area * 0.01:
        # Couldn't confidently segment a leaf; fall back to whole-frame stats
        # rather than failing outright, so the pipeline never dead-ends.
        area_ratio = 0.15
        aspect_ratio = 1.5
        circularity = 0.5
        vein_density = 0.4
        thickness_estimate = 0.4
        roi_hsv = cv2.cvtColor(bgr, cv2.COLOR_BGR2HSV)
    else:
        area = cv2.contourArea(contour)
        perimeter = cv2.arcLength(contour, True)
        x, y, bw, bh = cv2.boundingRect(contour)

        area_ratio = float(np.clip(area / image_area, 0, 1))
        aspect_ratio = float(max(bw, bh) / max(1, min(bw, bh)))
        circularity = float(np.clip((4 * np.pi * area) / (perimeter ** 2 + 1e-6), 0, 1))

        roi_bgr = bgr[y:y + bh, x:x + bw]
        roi_hsv = cv2.cvtColor(roi_bgr, cv2.COLOR_BGR2HSV)

        # Vein density proxy: edge pixel density inside the leaf ROI.
        gray = cv2.cvtColor(roi_bgr, cv2.COLOR_BGR2GRAY)
        edges = cv2.Canny(gray, 50, 150)
        vein_density = float(np.clip(np.count_nonzero(edges) / max(1, edges.size) * 6, 0, 1))

        # Thickness proxy: leaves with denser, high-contrast texture read as
        # thicker/leathery; smoother low-contrast regions read as thin.
        thickness_estimate = float(np.clip(gray.std() / 80.0, 0, 1))

    mean_h, mean_s, mean_v = [float(x) for x in cv2.mean(roi_hsv)[:3]]
    color_label, dryness_score = _classify_color((mean_h, mean_s, mean_v))

    shape = _classify_shape(aspect_ratio, circularity)
    if shape not in LEAF_CATEGORIES:
        shape = "Unknown"

    size_label = "Small" if area_ratio < 0.15 else "Medium" if area_ratio < 0.45 else "Large"
    surface_condition = "Smooth" if vein_density < 0.35 else "Textured"
    health_condition = "Fresh" if dryness_score < 0.35 else "Wilting" if dryness_score < 0.65 else "Dry"

    return LeafFeatures(
        leaf_type=shape,
        health_condition=health_condition,
        estimated_size=size_label,
        color=color_label,
        shape=shape,
        vein_density=round(vein_density, 3),
        surface_condition=surface_condition,
        dryness_score=round(dryness_score, 3),
        thickness_estimate=round(thickness_estimate, 3),
        area_ratio=round(area_ratio, 3),
        aspect_ratio=round(aspect_ratio, 3),
        circularity=round(circularity, 3),
    )
