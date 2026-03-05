"""
Nutrition Routes — log food, retrieve history, analyze food from USDA dataset.
"""

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from datetime import datetime, timedelta, timezone

from backend.app.database import get_db
from backend.app.models.user import User
from backend.app.models.nutrition_log import NutritionLog
from backend.app.schemas.nutrition_log import NutritionLogCreate, NutritionLogResponse
from backend.app.services.auth_service import get_current_user
from backend.app.ml_models.nutrition_engine import analyze_food
from backend.app.logging_config import get_logger

logger = get_logger("routes.nutrition")

router = APIRouter(prefix="/nutrition", tags=["Nutrition"])


@router.post("/log", response_model=NutritionLogResponse)
def log_nutrition(
    entry: NutritionLogCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Log a nutrition entry for the authenticated user."""
    # If calories not provided, try to look up from USDA dataset
    calories = entry.calories
    protein = entry.protein
    carbs = entry.carbs
    fats = entry.fats

    if calories is None:
        analysis = analyze_food(entry.food_name)
        if "error" not in analysis:
            calories = analysis.get("calories")
            protein = protein or analysis.get("protein")
            carbs = carbs or analysis.get("carbs")
            fats = fats or analysis.get("fat")

    db_entry = NutritionLog(
        user_id=current_user.id,
        food_name=entry.food_name,
        calories=calories,
        protein=protein,
        carbs=carbs,
        fats=fats,
    )
    db.add(db_entry)
    db.commit()
    db.refresh(db_entry)

    logger.info("Nutrition logged for user %d: %s", current_user.id, entry.food_name)
    return db_entry


@router.get("/history", response_model=list[NutritionLogResponse])
def get_nutrition_history(
    days: int = Query(7, ge=1, le=90, description="Number of days to look back"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Retrieve nutrition log history for the authenticated user."""
    since = datetime.now(timezone.utc) - timedelta(days=days)
    entries = (
        db.query(NutritionLog)
        .filter(NutritionLog.user_id == current_user.id)
        .filter(NutritionLog.timestamp >= since)
        .order_by(NutritionLog.timestamp.desc())
        .all()
    )
    return entries


@router.get("/analyze/{food_name}")
def analyze_food_endpoint(
    food_name: str,
    current_user: User = Depends(get_current_user),
):
    """Look up nutritional data for a food item from USDA dataset."""
    result = analyze_food(food_name)
    return result
