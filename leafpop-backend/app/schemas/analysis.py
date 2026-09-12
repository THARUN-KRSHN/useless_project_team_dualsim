from pydantic import BaseModel


class LeafAnalysisDetail(BaseModel):
    type: str
    condition: str
    dryness: float
    vein_density: float
    pop_potential: int
    predicted_loudness: int
    predicted_sharpness: int
    predicted_duration: float
    difficulty: str
    recommendation: str
    confidence: float


class LeafAnalysisResponse(BaseModel):
    leaf_id: str
    analysis: LeafAnalysisDetail
