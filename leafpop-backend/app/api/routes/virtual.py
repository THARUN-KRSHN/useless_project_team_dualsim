from fastapi import APIRouter, Depends

from app.api.dependencies import CurrentUser, get_current_user
from app.schemas.virtual import VirtualPopRequest, VirtualPopResponse
from app.services import virtual_game_service

router = APIRouter(prefix="/virtual", tags=["Virtual"])


@router.post("/pop", response_model=VirtualPopResponse)
async def submit_virtual_pop(
    interaction: VirtualPopRequest,
    current_user: CurrentUser = Depends(get_current_user),
):
    result = virtual_game_service.submit_virtual_pop(current_user.id, interaction.model_dump())
    return VirtualPopResponse(
        score=result["score"],
        impact=result["impact"],
        pop_strength=result["pop_strength"],
        message=result["message"],
    )
