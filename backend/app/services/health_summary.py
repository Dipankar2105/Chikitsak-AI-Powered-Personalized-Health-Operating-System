from sqlalchemy.orm import Session
from datetime import datetime, timedelta, timezone

from backend.app.models.user import User
from backend.app.models.symptom_log import SymptomLog
from backend.app.models.nutrition_log import NutritionLog
from backend.app.models.medication_log import MedicationLog
from backend.app.models.lab_report import LabReport
from backend.app.services.health_analytics import get_symptom_frequency, get_nutrition_summary
from backend.app.logging_config import get_logger

from collections import Counter

logger = get_logger("services.health_summary")

# Triage levels considered high-risk
HIGH_RISK_TRIAGE = {"emergency", "urgent", "high"}


def _detect_recurring_conditions(
    symptoms_list: list[SymptomLog], days: int = 30
) -> list[str]:
    """
    Identify conditions that appear more than twice in the given period.
    """
    if not symptoms_list:
        return []

    conditions = [
        log.predicted_disease
        for log in symptoms_list
        if log.predicted_disease and log.predicted_disease.strip()
    ]
    counts = Counter(conditions)
    
    recurring = [
        cond for cond, count in counts.items() 
        if count > 2
    ]
    return recurring


def _generate_weekly_text_summary(
    user_name: str,
    symptom_logs: list[SymptomLog],
    nutrition_avg: dict,
    risk_flags: list[str],
) -> str:
    """
    Generate a natural language summary of the user's health week.
    """
    lines = [f"Health Summary for {user_name}:"]
    
    # Symptoms
    if not symptom_logs:
        lines.append("No symptoms reported this week.")
    else:
        count = len(symptom_logs)
        unique_symptoms = set()
        for log in symptom_logs:
            # Parse symptoms (could be list or string)
            if isinstance(log.symptoms, list):
                symptoms_list = log.symptoms
            else:
                symptoms_list = log.symptoms.split(",")
            
            for s in symptoms_list:
                s_clean = s.strip().lower()
                if s_clean:
                    unique_symptoms.add(s_clean)
        
        lines.append(
            f"Reported {count} symptom entries involving: {', '.join(list(unique_symptoms)[:5])}."
        )

    # Nutrition
    cals = nutrition_avg.get("avg_daily_calories", 0)
    if cals > 0:
        lines.append(f"Average daily intake: {cals} kcal.")
    else:
        lines.append("No nutrition data logged.")

    # Risks
    if risk_flags:
        lines.append(f"Attention needed: {'; '.join(risk_flags)}.")
    else:
        lines.append("No significant risk factors detected.")

    return " ".join(lines)



def generate_health_summary(db: Session, user_id: int) -> dict:
    """
    Build a comprehensive health snapshot for a user:
    - Profile overview
    - Recent symptom trends
    - Nutrition averages (7-day)
    - Active medications
    - Latest lab abnormalities
    - Risk flags
    """
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        return {"error": "User not found"}

    # ── Profile ──────────────────────────────────────────────────────────
    profile = {
        "name": user.name,
        "age": user.age,
        "gender": user.gender,
        "existing_conditions": user.existing_conditions,
        "allergies": user.allergies,
    }

    # ── Symptom trends (last 30 days) ────────────────────────────────────
    cutoff_30d = datetime.now(timezone.utc) - timedelta(days=30)
    recent_symptoms = (
        db.query(SymptomLog)
        .filter(SymptomLog.user_id == user_id, SymptomLog.timestamp >= cutoff_30d)
        .order_by(SymptomLog.timestamp.desc())
        .all()
    )
    symptom_frequency = get_symptom_frequency(db, user_id)

    top_symptoms = symptom_frequency[:5]
    recent_diseases = list({
        s.predicted_disease
        for s in recent_symptoms
        if s.predicted_disease
    })

    # ── Nutrition (7-day average) ────────────────────────────────────────
    nutrition_avg = get_nutrition_summary(db, user_id, days=7)

    # ── Active medications ───────────────────────────────────────────────
    cutoff_7d = datetime.now(timezone.utc) - timedelta(days=7)
    recent_meds = (
        db.query(MedicationLog)
        .filter(MedicationLog.user_id == user_id, MedicationLog.timestamp >= cutoff_7d)
        .all()
    )
    active_medications = list({m.medication_name for m in recent_meds})

    # ── Latest lab abnormalities ─────────────────────────────────────────
    latest_labs = (
        db.query(LabReport)
        .filter(LabReport.user_id == user_id)
        .order_by(LabReport.timestamp.desc())
        .limit(5)
        .all()
    )
    lab_abnormals = [
        {"report": lab.report_name, "abnormal_values": lab.abnormal_values}
        for lab in latest_labs
        if lab.abnormal_values
    ]

    # ── Risk flags ───────────────────────────────────────────────────────
    risk_flags: list[str] = []

    high_triage_count = sum(
        1 for s in recent_symptoms
        if s.triage_level and s.triage_level.lower() in HIGH_RISK_TRIAGE
    )
    if high_triage_count >= 3:
        risk_flags.append(
            f"Frequent high-severity symptoms ({high_triage_count} in last 30 days)"
        )

    if nutrition_avg["total_entries"] > 0 and nutrition_avg["avg_daily_calories"] < 1200:
        risk_flags.append(
            f"Low calorie intake ({nutrition_avg['avg_daily_calories']} kcal/day avg)"
        )

    if len(active_medications) >= 5:
        risk_flags.append(
            f"Polypharmacy risk ({len(active_medications)} active medications)"
        )

    if lab_abnormals:
        risk_flags.append(
            f"{len(lab_abnormals)} lab report(s) with abnormal values"
        )

    # ── Recurring Conditions ─────────────────────────────────────────────
    recurring_conditions = _detect_recurring_conditions(recent_symptoms)
    if recurring_conditions:
        risk_flags.append(f"Recurring conditions: {', '.join(recurring_conditions)}")

    # ── Weekly Text Summary ──────────────────────────────────────────────
    weekly_summary_text = _generate_weekly_text_summary(
        user.name, recent_symptoms, nutrition_avg, risk_flags
    )

    logger.info("Health summary generated for user %d — %d risk flags", user_id, len(risk_flags))

    return {
        "user_id": user_id,
        "profile": profile,
        "symptom_trends": {
            "top_symptoms": top_symptoms,
            "recent_predicted_diseases": recent_diseases,
            "total_logs_30d": len(recent_symptoms),
        },
        "nutrition_7d_avg": nutrition_avg,
        "active_medications": active_medications,
        "lab_abnormals": lab_abnormals,
        "recurring_conditions": recurring_conditions,
        "weekly_summary_text": weekly_summary_text,
        "risk_flags": risk_flags,
    }

