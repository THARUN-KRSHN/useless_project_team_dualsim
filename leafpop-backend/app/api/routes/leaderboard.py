from fastapi import APIRouter, Query

from app.schemas.leaderboard import LeaderboardResponse
from app.services import leaderboard_service

router = APIRouter(prefix="/leaderboard", tags=["Leaderboard"])


@router.get("", response_model=LeaderboardResponse)
async def get_leaderboard(
    mode: str = Query(default="all", pattern="^(real|virtual|all)$"),
    limit: int = Query(default=10, ge=1, le=100),
):
    entries = leaderboard_service.get_leaderboard(mode=mode, limit=limit)
    return LeaderboardResponse(leaderboard=entries)
