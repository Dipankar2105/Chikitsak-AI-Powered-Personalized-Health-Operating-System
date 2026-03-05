"""
Health Score Route — AI-powered composite health score with breakdown.
"""

from fastapi import APIRouter, Depends
from pydantic import BaseModel, Field
from typing import Optional, List
from sqlalchemy.orm import Session

from backend.app.database import get_db
from backend.app.models.user import User
from backend.app.services.auth_service import get_current_user
from backend.app.services.health_score_engine import calculate_health_score
from backend.app.logging_config import get_logger

logger = get_logger("routes.health_score")
router = APIRouter(prefix="/health-score", tags=["Health Score"])


class HealthScoreRequest(BaseModel):
    activity_level: str = Field("moderate", description="sedentary | light | moderate | active | very_active")
    sleep_hours: float = Field(7.0, ge=0, le=24)
    sleep_quality: str = Field("fair", description="poor | fair | good")
    diet_quality: str = Field("average", description="poor | average | good")
    fruits_vegs_servings: int = Field(3, ge=0, le=15)
    water_glasses: int = Field(6, ge=0, le=20)
    stress_level: str = Field("moderate", description="low | moderate | high | very_high")
    mood: str = Field("neutral", description="positive | neutral | negative | very_negative")
    social_connection: str = Field("moderate", description="strong | moderate | weak | isolated")
    smoking: bool = False
    alcohol_heavy: bool = False
    recent_checkup: bool = False
    medications_adherent: bool = True


@router.post("/calculate")
def get_health_score(
    req: HealthScoreRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Calculate comprehensive AI health score with dimensional breakdown."""
    result = calculate_health_score(
        age=current_user.age,
        gender=current_user.gender,
        activity_level=req.activity_level,
        sleep_hours=req.sleep_hours,
        sleep_quality=req.sleep_quality,
        diet_quality=req.diet_quality,
        fruits_vegs_servings=req.fruits_vegs_servings,
        water_glasses=req.water_glasses,
        stress_level=req.stress_level,
        mood=req.mood,
        social_connection=req.social_connection,
        smoking=req.smoking,
        alcohol_heavy=req.alcohol_heavy,
        existing_conditions=current_user.existing_conditions or [],
        recent_checkup=req.recent_checkup,
        medications_adherent=req.medications_adherent,
    )
    logger.info("Health score for user %d: %d (%s)", current_user.id, result["total_score"], result["grade"])
    return result
