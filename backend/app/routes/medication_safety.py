from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from backend.app.database import get_db
from backend.app.services.medication_safety_service import run_safety_check
from backend.app.schemas.medication_safety_service import (
    MedicationSafetyRequest,
    MedicationSafetyResponse,
)

router = APIRouter(prefix="/medication", tags=["Medication Safety"])


@router.post("/safety-check", response_model=MedicationSafetyResponse)
def medication_safety_check(
    payload: MedicationSafetyRequest,
    db: Session = Depends(get_db),
):
    """
    Analyse a list of medications for a user:
    - Duplicate detection
    - High-frequency usage
    - Allergy cross-reference
    - Condition conflict flagging
    """
    result = run_safety_check(db, payload.user_id, payload.medications)
    if "error" in result:
        raise HTTPException(status_code=404, detail=result["error"])
    return result
