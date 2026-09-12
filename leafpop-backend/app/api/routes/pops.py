from fastapi import APIRouter, Depends, UploadFile, File, Form

from app.api.dependencies import CurrentUser, get_current_user
from app.services import audio_service

router = APIRouter(prefix="/pops", tags=["Pops"])


@router.post("/upload")
async def upload_pop(
    file: UploadFile = File(...),
    leaf_id: str | None = Form(default=None),
    source: str = Form(default="uploaded"),
    current_user: CurrentUser = Depends(get_current_user),
):
    content = await file.read()
    result = await audio_service.upload_and_score_pop(
        current_user.id,
        file.filename,
        content,
        leaf_id=leaf_id,
        source=source,
    )
    return result


@router.get("/{pop_id}")
async def get_pop_result(pop_id: str):
    return audio_service.get_pop_result(pop_id)
