from fastapi import APIRouter, UploadFile, File, HTTPException
from backend.app.services.xray_service import predict_xray
from backend.app.schemas.xray_service import XrayAnalysisResponse
from backend.app.logging_config import get_logger

logger = get_logger("routes.xray")
router = APIRouter(prefix="/xray", tags=["X-Ray Analysis"])


@router.post("/analyze", response_model=XrayAnalysisResponse)
async def analyze_xray(file: UploadFile = File(...)):
    """
    Upload a chest X-ray image for Pneumonia detection.
    """
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image")

    try:
        contents = await file.read()
        result = predict_xray(contents)
        return result
    except Exception as e:
        logger.error("X-ray analysis failed: %s", e)
        raise HTTPException(status_code=500, detail="Internal server error during analysis")
