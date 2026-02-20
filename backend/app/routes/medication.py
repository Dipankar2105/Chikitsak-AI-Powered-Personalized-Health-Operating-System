from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from backend.app.database import get_db
from backend.app.models.medication_log import MedicationLog
from backend.app.schemas.medication_log import MedicationLogCreate, MedicationLogResponse

router = APIRouter(prefix="/medication", tags=["Medication"])


@router.post("/log", response_model=MedicationLogResponse)
def log_medication(entry: MedicationLogCreate, db: Session = Depends(get_db)):
    """Log a medication entry for a user."""
    db_entry = MedicationLog(**entry.model_dump())
    db.add(db_entry)
    db.commit()
    db.refresh(db_entry)
    return db_entry
