from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from backend.app.database import get_db
from backend.app.models.symptom_log import SymptomLog
from backend.app.schemas.symptom_log import SymptomLogCreate, SymptomLogResponse

router = APIRouter(prefix="/symptoms", tags=["Symptoms"])


@router.post("/log", response_model=SymptomLogResponse)
def log_symptoms(entry: SymptomLogCreate, db: Session = Depends(get_db)):
    """Log a symptom entry for a user."""
    db_entry = SymptomLog(**entry.model_dump())
    db.add(db_entry)
    db.commit()
    db.refresh(db_entry)
    return db_entry
