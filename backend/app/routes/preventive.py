"""
Preventive Health Routes — predict disease risks based on user profile and lifestyle.
"""

from fastapi import APIRouter, Depends
from pydantic import BaseModel, Field
from typing import Optional, List
from sqlalchemy.orm import Session

from backend.app.database import get_db
from backend.app.models.user import User
from backend.app.services.auth_service import get_current_user
from backend.app.services.preventive_engine import predict_all_risks
from backend.app.logging_config import get_logger

logger = get_logger("routes.preventive")

router = APIRouter(prefix="/preventive", tags=["Preventive Health"])


class PreventiveRequest(BaseModel):
    """Optional overrides; if omitted, values are pulled from user profile."""
    height_cm: Optional[float] = None
    weight_kg: Optional[float] = None
    bmi: Optional[float] = None
    activity_level: str = Field("moderate", description="sedentary | light | moderate | active | very_active")
    sleep_quality: str = Field("fair", description="poor | fair | good")
    smoking: bool = False
    alcohol_heavy: bool = False
    family_history: Optional[List[str]] = None


@router.post("/predict")
def predict_risks(
    req: PreventiveRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Predict risk for diabetes, hypertension, heart disease, depression, and sleep disorders."""

    # Merge user profile with request overrides
    profile = None
    if hasattr(current_user, "medical_profile") and current_user.medical_profile:
        profile = current_user.medical_profile

    height = req.height_cm or (profile.height_cm if profile else None)
    weight = req.weight_kg or (profile.weight_kg if profile else None)
    bmi = req.bmi
    activity = req.activity_level or (profile.activity_level if profile else "moderate")
    family = req.family_history or (profile.family_history if profile else [])

    result = predict_all_risks(
        age=current_user.age,
        gender=current_user.gender,
        bmi=bmi,
        height_cm=height,
        weight_kg=weight,
        activity_level=activity,
        existing_conditions=current_user.existing_conditions or [],
        family_history=family,
        sleep_quality=req.sleep_quality,
        smoking=req.smoking,
        alcohol_heavy=req.alcohol_heavy,
    )

    logger.info("Preventive risk prediction for user %d: overall=%s", current_user.id, result["overall_risk_level"])
    return result


@router.get("/recommendations")
def get_recommendations(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get personalized prevention recommendations based on user profile."""

    profile = None
    if hasattr(current_user, "medical_profile") and current_user.medical_profile:
        profile = current_user.medical_profile

    result = predict_all_risks(
        age=current_user.age,
        gender=current_user.gender,
        bmi=None,
        height_cm=profile.height_cm if profile else None,
        weight_kg=profile.weight_kg if profile else None,
        activity_level=profile.activity_level if profile else "moderate",
        existing_conditions=current_user.existing_conditions or [],
        family_history=profile.family_history if profile else [],
    )

    return {
        "overall_risk": result["overall_risk_level"],
        "high_risk_conditions": result["high_risk_conditions"],
        "top_recommendations": result["top_recommendations"],
        "detailed_predictions": result["predictions"],
    }
