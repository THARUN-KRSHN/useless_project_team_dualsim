from fastapi import APIRouter, Depends, UploadFile, File

from app.api.dependencies import CurrentUser, get_current_user
from app.schemas.leaf import LeafUploadResponse, LeafReportResponse
from app.services import leaf_service

router = APIRouter(prefix="/leaves", tags=["Leaves"])


@router.post("/upload", response_model=LeafUploadResponse)
async def upload_leaf(
    file: UploadFile = File(...),
    current_user: CurrentUser = Depends(get_current_user),
):
    content = await file.read()
    record = await leaf_service.upload_leaf(current_user.id, file.filename, content)
    return LeafUploadResponse(leaf_id=record["id"], image_url=record["image_url"])


@router.get("/{leaf_id}", response_model=LeafReportResponse)
async def get_leaf_report(leaf_id: str):
    report = leaf_service.get_leaf_report(leaf_id)
    return LeafReportResponse(**report)
