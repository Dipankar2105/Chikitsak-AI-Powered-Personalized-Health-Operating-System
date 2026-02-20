from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from backend.app.database import get_db
from backend.app.services.health_analytics import (
    get_symptom_frequency,
    get_nutrition_summary,
    get_health_timeline,
)
from backend.app.schemas.analytics import (
    NutritionSummaryResponse,
    TimelineEvent,
)

router = APIRouter(prefix="/analytics", tags=["Analytics"])


@router.get("/{user_id}/symptoms")
def symptom_frequency(user_id: int, db: Session = Depends(get_db)):
    """Get symptom frequency formatted for Recharts (labels + values)."""
    items = get_symptom_frequency(db, user_id)
    labels = [i["symptom"] for i in items]
    values = [int(i["count"]) for i in items]
    return {"labels": labels, "values": values}


@router.get("/{user_id}/nutrition", response_model=NutritionSummaryResponse)
def nutrition_summary(
    user_id: int,
    days: int = Query(default=7, ge=1, le=365),
    db: Session = Depends(get_db),
):
    """Get average daily nutrition over the last N days."""
    return get_nutrition_summary(db, user_id, days)


@router.get("/{user_id}/timeline", response_model=list[TimelineEvent])
def health_timeline(
    user_id: int,
    limit: int = Query(default=50, ge=1, le=200),
    db: Session = Depends(get_db),
):
    """Get chronological health event timeline for a user."""
    return get_health_timeline(db, user_id, limit)
