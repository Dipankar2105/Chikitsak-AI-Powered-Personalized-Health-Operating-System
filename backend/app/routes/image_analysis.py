"""
Unified Image Analysis Routes — single endpoint for MRI, X-ray, and skin analysis.
"""

from fastapi import APIRouter, UploadFile, File, Form, HTTPException, Depends
from typing import Optional
from sqlalchemy.orm import Session

from backend.app.database import get_db
from backend.app.models.user import User
from backend.app.models.image_analysis import ImageAnalysis
from backend.app.services.auth_service import get_current_user
from backend.app.logging_config import get_logger

logger = get_logger("routes.image_analysis")

router = APIRouter(prefix="/image", tags=["Image Analysis"])


@router.post("/analyze")
async def analyze_image(
    file: UploadFile = File(...),
    image_type: str = Form(..., description="Type of image: 'xray', 'mri', or 'skin'"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Unified image analysis endpoint.
    
    Upload a medical image and specify the type for AI analysis.
    Supports: X-ray (pneumonia), MRI (brain tumor), Skin (lesion classification).
    """
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image (JPEG, PNG, etc.)")

    image_type_lower = image_type.strip().lower()
    
    valid_types = {"xray", "x-ray", "mri", "skin"}
    if image_type_lower not in valid_types:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid image_type '{image_type}'. Must be one of: xray, mri, skin",
        )

    # Normalize X-ray variants
    if image_type_lower == "x-ray":
        image_type_lower = "xray"

    try:
        contents = await file.read()
        
        if image_type_lower == "xray":
            from backend.app.services.xray_service import predict_xray
            result = predict_xray(contents)
        elif image_type_lower == "mri":
            from backend.app.services.mri_service import predict_mri
            result = predict_mri(contents)
        elif image_type_lower == "skin":
            from backend.app.services.skin_service import predict_skin
            result = predict_skin(contents)
        else:
            raise HTTPException(status_code=400, detail=f"Unsupported type: {image_type}")

        # Add image type to result
        result["image_type"] = image_type_lower

        # Persist to database
        db_entry = ImageAnalysis(
            user_id=current_user.id,
            image_type=image_type_lower,
            prediction=result.get("prediction"),
            confidence=result.get("confidence"),
            risk_level=result.get("risk_level"),
            recommendation=result.get("recommendation"),
            analysis_result=result,
        )
        db.add(db_entry)
        db.commit()

        logger.info(
            "Image analyzed for user %d: type=%s, prediction=%s (%.2f%%)",
            current_user.id,
            image_type_lower,
            result.get("prediction"),
            (result.get("confidence", 0) or 0) * 100,
        )

        return result

    except FileNotFoundError as e:
        logger.error("Model not found for %s: %s", image_type_lower, e)
        raise HTTPException(
            status_code=503,
            detail=f"The {image_type} analysis model is not currently available. Please try again later.",
        )
    except Exception as e:
        logger.error("Image analysis failed for type %s: %s", image_type_lower, e)
        raise HTTPException(status_code=500, detail="Internal server error during image analysis")


@router.get("/history")
def get_image_history(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Retrieve image analysis history for the authenticated user."""
    analyses = (
        db.query(ImageAnalysis)
        .filter(ImageAnalysis.user_id == current_user.id)
        .order_by(ImageAnalysis.timestamp.desc())
        .limit(20)
        .all()
    )
    return [
        {
            "id": a.id,
            "image_type": a.image_type,
            "prediction": a.prediction,
            "confidence": a.confidence,
            "risk_level": a.risk_level,
            "recommendation": a.recommendation,
            "timestamp": a.timestamp.isoformat() if a.timestamp else None,
        }
        for a in analyses
    ]
