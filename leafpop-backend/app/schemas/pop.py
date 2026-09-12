from pydantic import BaseModel


class PopScoreBreakdown(BaseModel):
    loudness: float
    sharpness: float
    clarity: float
    impact: float
    final_score: float


class PopResultResponse(BaseModel):
    pop_id: str
    result: PopScoreBreakdown
    message: str
    prediction_comparison: dict | None = None


class PopHistoryItem(BaseModel):
    id: str
    mode: str = "real"
    score: float
    created_at: str


class PopHistoryResponse(BaseModel):
    pops: list[dict]
