from pydantic import BaseModel


class CurrentUserResponse(BaseModel):
    id: str
    username: str
    email: str | None = None


class UserStatsResponse(BaseModel):
    total_pops: int
    best_score: float
    average_score: float
    real_pops: int
    virtual_pops: int
    leaves_analyzed: int
    global_rank: int | None = None
