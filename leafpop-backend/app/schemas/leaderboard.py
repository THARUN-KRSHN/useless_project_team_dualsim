from pydantic import BaseModel


class LeaderboardEntry(BaseModel):
    rank: int
    username: str
    score: float
    mode: str
    created_at: str


class LeaderboardResponse(BaseModel):
    leaderboard: list[LeaderboardEntry]
