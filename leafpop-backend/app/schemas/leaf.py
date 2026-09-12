from pydantic import BaseModel


class LeafUploadResponse(BaseModel):
    success: bool = True
    leaf_id: str
    image_url: str
    message: str = "Leaf uploaded successfully"


class LeafOut(BaseModel):
    id: str
    user_id: str
    image_url: str
    created_at: str


class LeafReportResponse(BaseModel):
    leaf: dict
    analysis: dict | None = None
    prediction: dict | None = None
