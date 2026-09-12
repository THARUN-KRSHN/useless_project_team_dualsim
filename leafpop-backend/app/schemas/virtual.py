from pydantic import BaseModel, Field


class VirtualPopRequest(BaseModel):
    """
    Final interaction statistics computed client-side (Section 1/27). The
    backend never trusts a client-supplied score — only these raw metrics.
    """
    leaf_type: str = Field(default="broad", max_length=32)
    tap_count: int = Field(ge=1, le=50)
    total_duration: float = Field(ge=0, le=60)
    max_velocity: float = Field(ge=0, le=10_000)
    average_velocity: float = Field(ge=0, le=10_000)
    reaction_time: float = Field(ge=0, le=30)
    impact_x: float = Field(ge=0, le=1)
    impact_y: float = Field(ge=0, le=1)
    combo: int = Field(default=1, ge=1, le=100)


class VirtualPopResponse(BaseModel):
    score: int
    impact: str
    pop_strength: float
    message: str
