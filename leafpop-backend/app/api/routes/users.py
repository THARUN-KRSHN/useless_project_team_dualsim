from fastapi import APIRouter, Depends

from app.api.dependencies import CurrentUser, get_current_user
from app.schemas.pop import PopHistoryResponse
from app.schemas.user import UserStatsResponse
from app.services import user_service

router = APIRouter(prefix="/users/me", tags=["Users"])


@router.get("/stats", response_model=UserStatsResponse)
async def get_my_stats(current_user: CurrentUser = Depends(get_current_user)):
    stats = user_service.get_user_stats(current_user.id)
    return UserStatsResponse(**stats)


@router.get("/pops", response_model=PopHistoryResponse)
async def get_my_pop_history(current_user: CurrentUser = Depends(get_current_user)):
    history = user_service.get_user_pop_history(current_user.id)
    return PopHistoryResponse(pops=history)
