from pydantic import BaseModel, Field, model_validator


class VirtualPopRequest(BaseModel):
    """
    Final interaction statistics computed client-side (Section 1/27). The
    backend never trusts a client-supplied score — only these raw metrics.

    Accepts both the legacy backend payload shape and the current frontend
    shape (`click_x`, `click_y`, `velocity`, `duration_ms`, `reaction_time_ms`)
    so the virtual game remains compatible across clients.
    """
    leaf_type: str = Field(default="broad", max_length=32)
    tap_count: int = Field(default=1, ge=1, le=50)
    total_duration: float = Field(default=0.0, ge=0, le=60)
    max_velocity: float = Field(default=0.0, ge=0, le=10_000)
    average_velocity: float = Field(default=0.0, ge=0, le=10_000)
    reaction_time: float = Field(default=0.0, ge=0, le=30)
    impact_x: float = Field(default=0.5, ge=0, le=1)
    impact_y: float = Field(default=0.5, ge=0, le=1)
    combo: int = Field(default=1, ge=1, le=100)

    @model_validator(mode="before")
    @classmethod
    def normalize_frontend_payload(cls, data):
        if not isinstance(data, dict):
            return data

        payload = dict(data)
        payload.setdefault("leaf_type", "broad")
        payload.setdefault("tap_count", 1)
        payload.setdefault("combo", 1)

        if "impact_x" not in payload and "click_x" in payload:
            payload["impact_x"] = float(payload["click_x"])
        if "impact_y" not in payload and "click_y" in payload:
            payload["impact_y"] = float(payload["click_y"])

        if "total_duration" not in payload and "duration_ms" in payload:
            payload["total_duration"] = float(payload["duration_ms"]) / 1000.0
        if "reaction_time" not in payload and "reaction_time_ms" in payload:
            payload["reaction_time"] = float(payload["reaction_time_ms"]) / 1000.0

        velocity_value = payload.get("velocity")
        if velocity_value is not None:
            if "max_velocity" not in payload:
                payload["max_velocity"] = max(0.0, min(1000.0, float(velocity_value) * 120.0))
            if "average_velocity" not in payload:
                payload["average_velocity"] = payload["max_velocity"]

        return payload


class VirtualPopResponse(BaseModel):
    score: int
    impact: str
    pop_strength: float
    message: str
