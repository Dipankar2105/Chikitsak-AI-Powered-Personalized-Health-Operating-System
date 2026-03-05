"""
Personal Health Twin Routes — digital health model with lifestyle simulation.
"""

from fastapi import APIRouter, Depends
from pydantic import BaseModel, Field
from typing import Optional, List
from sqlalchemy.orm import Session

from backend.app.database import get_db
from backend.app.models.user import User
from backend.app.services.auth_service import get_current_user
from backend.app.services.health_twin_engine import build_health_twin, simulate_lifestyle_change
from backend.app.logging_config import get_logger

logger = get_logger("routes.health_twin")

router = APIRouter(prefix="/health-twin", tags=["Health Twin"])


class HealthTwinRequest(BaseModel):
    """Optional overrides for health twin construction."""
    height_cm: Optional[float] = None
    weight_kg: Optional[float] = None
    bmi: Optional[float] = None
    activity_level: str = Field("moderate", description="sedentary | light | moderate | active | very_active")
    sleep_quality: str = Field("fair", description="poor | fair | good")
    diet_quality: str = Field("average", description="poor | average | good")
    smoking: bool = False
    alcohol_heavy: bool = False
    family_history: Optional[List[str]] = None


class SimulateRequest(BaseModel):
    """Lifestyle changes to simulate."""
    changes: List[str] = Field(
        ..., min_items=1, max_items=5,
        description="Changes to simulate: weight_loss_5kg, weight_loss_10kg, increase_activity, quit_smoking, improve_diet, improve_sleep, reduce_alcohol, stress_management"
    )
    # Optional profile overrides
    height_cm: Optional[float] = None
    weight_kg: Optional[float] = None
    bmi: Optional[float] = None
    activity_level: str = "moderate"
    sleep_quality: str = "fair"
    diet_quality: str = "average"
    smoking: bool = False
    alcohol_heavy: bool = False
    family_history: Optional[List[str]] = None


@router.get("/profile")
def get_health_twin(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get Health Twin snapshot with current health score, risk assessment, and improvement roadmap."""

    profile = None
    if hasattr(current_user, "medical_profile") and current_user.medical_profile:
        profile = current_user.medical_profile

    twin = build_health_twin(
        age=current_user.age,
        gender=current_user.gender,
        height_cm=profile.height_cm if profile else None,
        weight_kg=profile.weight_kg if profile else None,
        activity_level=profile.activity_level if profile else "moderate",
        existing_conditions=current_user.existing_conditions or [],
        family_history=profile.family_history if profile else [],
    )

    logger.info("Health Twin built for user %d: score=%d", current_user.id, twin["health_score"])
    return twin


@router.post("/profile")
def create_health_twin(
    req: HealthTwinRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Build Health Twin with explicit overrides."""

    profile = None
    if hasattr(current_user, "medical_profile") and current_user.medical_profile:
        profile = current_user.medical_profile

    twin = build_health_twin(
        age=current_user.age,
        gender=current_user.gender,
        height_cm=req.height_cm or (profile.height_cm if profile else None),
        weight_kg=req.weight_kg or (profile.weight_kg if profile else None),
        bmi=req.bmi,
        activity_level=req.activity_level,
        existing_conditions=current_user.existing_conditions or [],
        family_history=req.family_history or (profile.family_history if profile else []),
        sleep_quality=req.sleep_quality,
        smoking=req.smoking,
        alcohol_heavy=req.alcohol_heavy,
        diet_quality=req.diet_quality,
    )

    return twin


@router.post("/simulate")
def simulate_changes(
    req: SimulateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Simulate lifestyle changes and project risk reductions."""

    valid_changes = {
        "weight_loss_5kg", "weight_loss_10kg", "increase_activity",
        "quit_smoking", "improve_diet", "improve_sleep",
        "reduce_alcohol", "stress_management",
    }
    invalid = [c for c in req.changes if c not in valid_changes]
    if invalid:
        from fastapi import HTTPException
        raise HTTPException(
            status_code=400,
            detail=f"Invalid changes: {invalid}. Valid: {sorted(valid_changes)}",
        )

    profile = None
    if hasattr(current_user, "medical_profile") and current_user.medical_profile:
        profile = current_user.medical_profile

    twin = build_health_twin(
        age=current_user.age,
        gender=current_user.gender,
        height_cm=req.height_cm or (profile.height_cm if profile else None),
        weight_kg=req.weight_kg or (profile.weight_kg if profile else None),
        bmi=req.bmi,
        activity_level=req.activity_level,
        existing_conditions=current_user.existing_conditions or [],
        family_history=req.family_history or (profile.family_history if profile else []),
        sleep_quality=req.sleep_quality,
        smoking=req.smoking,
        alcohol_heavy=req.alcohol_heavy,
        diet_quality=req.diet_quality,
    )

    result = simulate_lifestyle_change(twin, req.changes)

    logger.info(
        "Simulation for user %d: %s → score %d→%d",
        current_user.id, req.changes, result["current_health_score"], result["new_health_score"],
    )
    return result
