from collections import Counter
from datetime import datetime, timedelta, timezone

from sqlalchemy.orm import Session

from backend.app.models.user import User
from backend.app.models.symptom_log import SymptomLog
from backend.app.models.nutrition_log import NutritionLog
from backend.app.models.medication_log import MedicationLog
from backend.app.logging_config import get_logger

logger = get_logger("services.health_summary_service")


# ─────────────────────────────────────────────────────────────────────────
# 1. Recurring Condition Detection
# ─────────────────────────────────────────────────────────────────────────

def _detect_recurring_conditions(
    db: Session, user_id: int, days: int = 90
) -> list[dict]:
    """
    Flag any predicted_disease that appears 3+ times within the window.
    """
    cutoff = datetime.now(timezone.utc) - timedelta(days=days)
    logs = (
        db.query(SymptomLog)
        .filter(SymptomLog.user_id == user_id, SymptomLog.timestamp >= cutoff)
        .all()
    )

    diseases = [
        log.predicted_disease
        for log in logs
        if log.predicted_disease and log.predicted_disease.strip()
    ]
    counts = Counter(diseases)

    return [
        {"condition": cond, "occurrences": count}
        for cond, count in counts.items()
        if count >= 3
    ]


# ─────────────────────────────────────────────────────────────────────────
# 2. Nutrition Risk Pattern
# ─────────────────────────────────────────────────────────────────────────

_NUTRITION_THRESHOLDS = {
    "high_calories":  {"field": "calories", "direction": "above", "limit": 2500},
    "low_protein":    {"field": "protein",  "direction": "below", "limit": 30},
    "high_fats":      {"field": "fats",     "direction": "above", "limit": 90},
    "low_calories":   {"field": "calories", "direction": "below", "limit": 1200},
    "high_carbs":     {"field": "carbs",    "direction": "above", "limit": 350},
}


def _analyse_nutrition(db: Session, user_id: int, days: int = 30) -> dict:
    cutoff = datetime.now(timezone.utc) - timedelta(days=days)
    logs = (
        db.query(NutritionLog)
        .filter(NutritionLog.user_id == user_id, NutritionLog.timestamp >= cutoff)
        .all()
    )

    if not logs:
        return {"avg_calories": 0, "avg_protein": 0, "avg_carbs": 0, "avg_fats": 0, "flags": []}

    total_cal = sum(l.calories or 0 for l in logs)
    total_pro = sum(l.protein or 0 for l in logs)
    total_crb = sum(l.carbs or 0 for l in logs)
    total_fat = sum(l.fats or 0 for l in logs)
    n = len(logs)

    avgs = {
        "calories": round(total_cal / n, 1),
        "protein":  round(total_pro / n, 1),
        "carbs":    round(total_crb / n, 1),
        "fats":     round(total_fat / n, 1),
    }

    flags: list[str] = []
    for label, rule in _NUTRITION_THRESHOLDS.items():
        val = avgs[rule["field"]]
        if rule["direction"] == "above" and val > rule["limit"]:
            flags.append(label)
        elif rule["direction"] == "below" and val < rule["limit"]:
            flags.append(label)

    return {
        "avg_calories": avgs["calories"],
        "avg_protein":  avgs["protein"],
        "avg_carbs":    avgs["carbs"],
        "avg_fats":     avgs["fats"],
        "flags":        flags,
    }


# ─────────────────────────────────────────────────────────────────────────
# 3. Medication Frequency Analysis
# ─────────────────────────────────────────────────────────────────────────

def _analyse_medications(db: Session, user_id: int, days: int = 30) -> dict:
    cutoff = datetime.now(timezone.utc) - timedelta(days=days)
    logs = (
        db.query(MedicationLog)
        .filter(MedicationLog.user_id == user_id, MedicationLog.timestamp >= cutoff)
        .all()
    )

    counts = Counter(log.medication_name.strip().lower() for log in logs)
    top = [
        {"medication": med, "count": c}
        for med, c in counts.most_common(5)
    ]
    return {"total_entries": len(logs), "top_medications": top}


# ─────────────────────────────────────────────────────────────────────────
# 4. Risk Score (0–100)
# ─────────────────────────────────────────────────────────────────────────

def _calculate_risk_score(
    recurring: list[dict],
    nutrition_flags: list[str],
    med_total: int,
) -> int:
    """
    Higher score → higher risk.  Starts at 0 and accumulates penalties.
    """
    score = 0

    # Recurring conditions: +12 per condition
    score += len(recurring) * 12

    # Nutrition flags: +8 each
    score += len(nutrition_flags) * 8

    # Excessive medication use (>20 entries/month → concern)
    if med_total > 20:
        score += 15
    elif med_total > 10:
        score += 8

    return min(score, 100)


# ─────────────────────────────────────────────────────────────────────────
# 5. Text Summary
# ─────────────────────────────────────────────────────────────────────────

def _build_summary_text(
    user_name: str,
    recurring: list[dict],
    nutrition: dict,
    medication: dict,
    risk_score: int,
) -> str:
    parts: list[str] = [f"Health Intelligence Report for {user_name}."]

    # Risk headline
    if risk_score >= 60:
        parts.append(f"Overall risk score is {risk_score}/100 — elevated risk detected.")
    elif risk_score >= 30:
        parts.append(f"Overall risk score is {risk_score}/100 — moderate attention recommended.")
    else:
        parts.append(f"Overall risk score is {risk_score}/100 — looking good.")

    # Recurring
    if recurring:
        conds = ", ".join(r["condition"] for r in recurring)
        parts.append(f"Recurring conditions detected: {conds}.")
    else:
        parts.append("No recurring conditions detected.")

    # Nutrition
    flags = nutrition.get("flags", [])
    if flags:
        parts.append(f"Nutrition concerns: {', '.join(f.replace('_', ' ') for f in flags)}.")
    else:
        parts.append("Nutrition intake appears balanced.")

    # Medication
    top_meds = medication.get("top_medications", [])
    if top_meds:
        names = ", ".join(m["medication"] for m in top_meds[:3])
        parts.append(f"Most used medications: {names}.")
    else:
        parts.append("No medication logs recorded recently.")

    return " ".join(parts)


# ─────────────────────────────────────────────────────────────────────────
# Public API
# ─────────────────────────────────────────────────────────────────────────

def generate_health_intelligence(db: Session, user_id: int) -> dict:
    """
    Aggregate all analyses into the Health Intelligence response.
    """
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        return {"error": "User not found"}

    recurring = _detect_recurring_conditions(db, user_id)
    nutrition = _analyse_nutrition(db, user_id)
    medication = _analyse_medications(db, user_id)

    risk_score = _calculate_risk_score(
        recurring,
        nutrition.get("flags", []),
        medication.get("total_entries", 0),
    )

    summary_text = _build_summary_text(
        user.name, recurring, nutrition, medication, risk_score
    )

    logger.info(
        "Health intelligence generated for user %d — risk %d/100", user_id, risk_score
    )

    return {
        "risk_score": risk_score,
        "recurring_conditions": recurring,
        "nutrition_pattern": nutrition,
        "medication_pattern": medication,
        "summary_text": summary_text,
    }
