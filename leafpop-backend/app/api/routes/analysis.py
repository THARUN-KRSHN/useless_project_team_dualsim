from fastapi import APIRouter, Depends

from app.api.dependencies import CurrentUser, get_current_user
from app.services import prediction_service

router = APIRouter(prefix="/leaves", tags=["Analysis"])


@router.post("/{leaf_id}/analyze")
async def analyze_leaf(leaf_id: str, current_user: CurrentUser = Depends(get_current_user)):
    result = await prediction_service.analyze_leaf(leaf_id)
    return {"leaf_id": result["leaf_id"], "analysis": result["analysis"]}
