from fastapi import APIRouter, Depends

from app.api.dependencies import CurrentUser, get_current_user
from app.schemas.user import CurrentUserResponse
from app.services import user_service

router = APIRouter(prefix="/auth", tags=["Auth"])


@router.get("/me", response_model=CurrentUserResponse)
async def get_me(current_user: CurrentUser = Depends(get_current_user)):
    profile = user_service.get_current_user_profile(
        current_user.id, current_user.username, current_user.email
    )
    return CurrentUserResponse(**profile)
