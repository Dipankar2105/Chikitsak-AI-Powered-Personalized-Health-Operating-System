"""
Medication Adherence Routes — scheduling, interaction checking, and adherence tracking.
"""

from fastapi import APIRouter, Depends
from pydantic import BaseModel, Field
from typing import List, Optional
from sqlalchemy.orm import Session

from backend.app.database import get_db
from backend.app.models.user import User
from backend.app.services.auth_service import get_current_user
from backend.app.services.medication_adherence_service import (
    check_drug_interactions,
    create_medication_schedule,
    calculate_adherence_score,
    get_missed_dose_advice,
)
from backend.app.logging_config import get_logger

logger = get_logger("routes.medication_adherence")
router = APIRouter(prefix="/medication-adherence", tags=["Medication Adherence"])


class InteractionCheckRequest(BaseModel):
    medications: List[str] = Field(..., min_items=2, description="List of medication names")


class MedicationItem(BaseModel):
    name: str
    dose: str = ""
    frequency: str = Field("once_daily", description="once_daily | twice_daily | thrice_daily | four_times_daily | at_bedtime | with_meals")
    instructions: str = "Take as directed"


class ScheduleRequest(BaseModel):
    medications: List[MedicationItem]


class AdherenceRequest(BaseModel):
    total_doses_scheduled: int = Field(..., ge=0)
    doses_taken: int = Field(..., ge=0)
    doses_on_time: int = Field(..., ge=0)


class MissedDoseRequest(BaseModel):
    medication: str
    hours_late: float = Field(..., ge=0)


@router.post("/check-interactions")
def check_interactions(
    req: InteractionCheckRequest,
    current_user: User = Depends(get_current_user),
):
    """Check for drug-drug interactions between medications."""
    interactions = check_drug_interactions(req.medications)
    logger.info("Interaction check for user %d: %d medications → %d interactions", current_user.id, len(req.medications), len(interactions))
    return {
        "medications_checked": req.medications,
        "interactions_found": len(interactions),
        "interactions": interactions,
        "safe": len(interactions) == 0,
    }


@router.post("/schedule")
def build_schedule(
    req: ScheduleRequest,
    current_user: User = Depends(get_current_user),
):
    """Create a daily medication schedule with reminder times."""
    meds = [m.dict() for m in req.medications]
    schedule = create_medication_schedule(meds)
    return schedule


@router.post("/adherence-score")
def get_adherence(
    req: AdherenceRequest,
    current_user: User = Depends(get_current_user),
):
    """Calculate medication adherence score."""
    return calculate_adherence_score(
        total_doses_scheduled=req.total_doses_scheduled,
        doses_taken=req.doses_taken,
        doses_on_time=req.doses_on_time,
    )


@router.post("/missed-dose")
def missed_dose(
    req: MissedDoseRequest,
    current_user: User = Depends(get_current_user),
):
    """Get advice for a missed medication dose."""
    return get_missed_dose_advice(req.medication, req.hours_late)
