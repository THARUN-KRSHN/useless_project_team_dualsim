from fastapi import APIRouter

from app.config.settings import get_settings
from app.schemas.common import HealthResponse

router = APIRouter(tags=["Health"])
settings = get_settings()


@router.get("/health", response_model=HealthResponse)
async def health_check():
    return HealthResponse(status="healthy", service=settings.app_name, version=settings.app_version)
