from pydantic import BaseModel


class LeaderboardEntry(BaseModel):
    rank: int
    username: str
    best_score: float
    total_pops: int = 1
    score: float | None = None
    mode: str
    source: str | None = None
    audio_url: str | None = None
    created_at: str


class LeaderboardResponse(BaseModel):
    leaderboard: list[LeaderboardEntry]
