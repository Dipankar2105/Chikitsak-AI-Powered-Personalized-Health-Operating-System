from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime, timedelta, timezone
from collections import Counter

from backend.app.models.symptom_log import SymptomLog
from backend.app.models.nutrition_log import NutritionLog
from backend.app.models.medication_log import MedicationLog
from backend.app.models.lab_report import LabReport
from backend.app.logging_config import get_logger

logger = get_logger("services.health_analytics")


def get_symptom_frequency(db: Session, user_id: int) -> list[dict]:
    """Count occurrences of each symptom across all logs for a user."""
    logs = db.query(SymptomLog).filter(SymptomLog.user_id == user_id).all()

    counter: Counter[str] = Counter()
    for log in logs:
        # Support both JSON list and legacy comma-separated string
        if isinstance(log.symptoms, list):
            symptoms_list = log.symptoms
        else:
            symptoms_list = log.symptoms.split(",")

        for symptom in symptoms_list:
            cleaned = symptom.strip().lower()
            if cleaned:
                counter[cleaned] += 1

    result = [
        {"symptom": symptom, "count": count}
        for symptom, count in counter.most_common()
    ]
    logger.debug("Symptom frequency for user %d: %d unique symptoms", user_id, len(result))
    return result


def get_nutrition_summary(db: Session, user_id: int, days: int = 7) -> dict:
    """Calculate average daily macros over the given number of days."""
    cutoff = datetime.now(timezone.utc) - timedelta(days=days)
    logs = (
        db.query(NutritionLog)
        .filter(NutritionLog.user_id == user_id, NutritionLog.timestamp >= cutoff)
        .all()
    )

    if not logs:
        return {
            "period_days": days,
            "total_entries": 0,
            "avg_daily_calories": 0,
            "avg_daily_protein": 0,
            "avg_daily_carbs": 0,
            "avg_daily_fats": 0,
        }

    total_cal = sum(l.calories or 0 for l in logs)
    total_pro = sum(l.protein or 0 for l in logs)
    total_carb = sum(l.carbs or 0 for l in logs)
    total_fat = sum(l.fats or 0 for l in logs)

    return {
        "period_days": days,
        "total_entries": len(logs),
        "avg_daily_calories": round(total_cal / days, 1),
        "avg_daily_protein": round(total_pro / days, 1),
        "avg_daily_carbs": round(total_carb / days, 1),
        "avg_daily_fats": round(total_fat / days, 1),
    }


def get_health_timeline(db: Session, user_id: int, limit: int = 50) -> list[dict]:
    """Return a chronological feed of all health events for a user."""
    events: list[dict] = []

    for log in db.query(SymptomLog).filter(SymptomLog.user_id == user_id).all():
        events.append({
            "type": "symptom",
            "description": log.symptoms,
            "detail": log.predicted_disease,
            "timestamp": log.timestamp.isoformat() if log.timestamp else None,
        })

    for log in db.query(NutritionLog).filter(NutritionLog.user_id == user_id).all():
        events.append({
            "type": "nutrition",
            "description": log.food_name,
            "detail": f"{log.calories or 0} kcal",
            "timestamp": log.timestamp.isoformat() if log.timestamp else None,
        })

    for log in db.query(MedicationLog).filter(MedicationLog.user_id == user_id).all():
        events.append({
            "type": "medication",
            "description": log.medication_name,
            "detail": None,
            "timestamp": log.timestamp.isoformat() if log.timestamp else None,
        })

    for log in db.query(LabReport).filter(LabReport.user_id == user_id).all():
        events.append({
            "type": "lab_report",
            "description": log.report_name,
            "detail": log.abnormal_values,
            "timestamp": log.timestamp.isoformat() if log.timestamp else None,
        })

    # Sort descending by timestamp, newest first
    events.sort(key=lambda e: e["timestamp"] or "", reverse=True)
    return events[:limit]
