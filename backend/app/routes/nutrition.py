from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from backend.app.database import get_db
from backend.app.models.nutrition_log import NutritionLog
from backend.app.schemas.nutrition_log import NutritionLogCreate, NutritionLogResponse

router = APIRouter(prefix="/nutrition", tags=["Nutrition"])


@router.post("/log", response_model=NutritionLogResponse)
def log_nutrition(entry: NutritionLogCreate, db: Session = Depends(get_db)):
    """Log a nutrition entry for a user."""
    db_entry = NutritionLog(**entry.model_dump())
    db.add(db_entry)
    db.commit()
    db.refresh(db_entry)
    return db_entry
