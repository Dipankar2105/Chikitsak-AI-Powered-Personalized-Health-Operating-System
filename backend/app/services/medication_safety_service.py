from collections import Counter
from datetime import datetime, timedelta, timezone

from sqlalchemy.orm import Session

from backend.app.models.user import User
from backend.app.models.medication_log import MedicationLog
from backend.app.logging_config import get_logger

logger = get_logger("services.medication_safety_service")


# ─────────────────────────────────────────────────────────────────────────
# Rule Tables
# ─────────────────────────────────────────────────────────────────────────

# Medications that may worsen specific conditions
CONDITION_CONFLICTS: dict[str, dict[str, str]] = {
    "hypertension": {
        "ibuprofen":      "NSAIDs can raise blood pressure.",
        "naproxen":       "NSAIDs can raise blood pressure.",
        "pseudoephedrine": "Decongestants may spike blood pressure.",
        "prednisone":     "Corticosteroids can cause fluid retention and elevate BP.",
    },
    "diabetes": {
        "prednisone":     "Corticosteroids can elevate blood sugar.",
        "thiazide":       "Thiazide diuretics may impair glucose control.",
        "atenolol":       "Beta-blockers can mask hypoglycemia symptoms.",
    },
    "asthma": {
        "propranolol":    "Non-selective beta-blockers may trigger bronchospasm.",
        "atenolol":       "Beta-blockers may worsen asthma.",
        "aspirin":        "Aspirin can trigger asthma attacks in sensitive patients.",
    },
    "kidney disease": {
        "ibuprofen":      "NSAIDs can worsen renal function.",
        "naproxen":       "NSAIDs can worsen renal function.",
        "metformin":      "Risk of lactic acidosis with impaired renal clearance.",
        "lithium":        "Narrow therapeutic index — renal impairment increases toxicity.",
    },
    "liver disease": {
        "acetaminophen":  "Hepatotoxic — avoid high doses with liver impairment.",
        "paracetamol":    "Hepatotoxic — avoid high doses with liver impairment.",
        "methotrexate":   "Can cause further liver damage.",
        "statins":        "May elevate liver enzymes.",
    },
    "heart disease": {
        "ibuprofen":      "NSAIDs increase cardiovascular event risk.",
        "naproxen":       "NSAIDs increase cardiovascular event risk.",
        "sildenafil":     "Contraindicated with nitrates — severe hypotension.",
    },
    "gerd": {
        "aspirin":        "May worsen gastric erosion.",
        "ibuprofen":      "NSAIDs aggravate acid reflux.",
        "naproxen":       "NSAIDs aggravate acid reflux.",
    },
}

# Known allergy class expansions (allergy → related drugs)
ALLERGY_CLASSES: dict[str, list[str]] = {
    "nsaid":       ["ibuprofen", "naproxen", "aspirin", "diclofenac", "celecoxib"],
    "penicillin":  ["amoxicillin", "ampicillin", "penicillin"],
    "sulfa":       ["sulfamethoxazole", "sulfasalazine", "dapsone"],
    "statin":      ["simvastatin", "atorvastatin", "rosuvastatin", "pravastatin"],
    "cephalosporin": ["cephalexin", "cefuroxime", "ceftriaxone"],
}

# High-frequency threshold (entries per week)
HIGH_FREQ_THRESHOLD = 5


# ─────────────────────────────────────────────────────────────────────────
# A. Interaction Checker
# ─────────────────────────────────────────────────────────────────────────

def _check_duplicates(medications: list[str]) -> list[str]:
    """Flag duplicate medication entries in the input list."""
    normed = [m.strip().lower() for m in medications]
    counts = Counter(normed)
    return [med for med, c in counts.items() if c > 1]


def _check_high_frequency(
    db: Session, user_id: int, medications: list[str], days: int = 7
) -> list[dict]:
    """Flag medications logged more than HIGH_FREQ_THRESHOLD times in the past week."""
    cutoff = datetime.now(timezone.utc) - timedelta(days=days)
    logs = (
        db.query(MedicationLog)
        .filter(MedicationLog.user_id == user_id, MedicationLog.timestamp >= cutoff)
        .all()
    )

    freq = Counter(log.medication_name.strip().lower() for log in logs)
    med_set = {m.strip().lower() for m in medications}

    return [
        {"medication": med, "times_this_week": freq[med]}
        for med in med_set
        if freq.get(med, 0) >= HIGH_FREQ_THRESHOLD
    ]


# ─────────────────────────────────────────────────────────────────────────
# B. Allergy Check
# ─────────────────────────────────────────────────────────────────────────

def _check_allergies(
    medications: list[str], allergies: str | list | None
) -> list[dict]:
    """Compare user's allergies against the medication list."""
    if not allergies:
        return []

    # Support both JSON list and legacy comma-separated string
    if isinstance(allergies, list):
        raw_items = allergies
    else:
        raw_items = [a.strip() for a in allergies.split(",") if a.strip()]

    allergy_set: set[str] = set()
    for raw in raw_items:
        a = raw.strip().lower()
        if not a:
            continue
        allergy_set.add(a)
        # Expand class aliases
        if a in ALLERGY_CLASSES:
            allergy_set.update(ALLERGY_CLASSES[a])

    warnings: list[dict] = []
    for med in medications:
        normed = med.strip().lower()
        if normed in allergy_set:
            warnings.append({
                "medication": normed,
                "matched_allergy": normed,
                "severity": "high",
                "message": f"Patient has a known allergy to {normed}.",
            })

    return warnings


# ─────────────────────────────────────────────────────────────────────────
# C. Condition Conflict Check
# ─────────────────────────────────────────────────────────────────────────

def _check_condition_conflicts(
    medications: list[str], conditions: str | list | None
) -> list[dict]:
    """Flag medications that may worsen existing conditions."""
    if not conditions:
        return []

    # Support both JSON list and legacy comma-separated string
    if isinstance(conditions, list):
        user_conditions = [c.strip().lower() for c in conditions if c.strip()]
    else:
        user_conditions = [c.strip().lower() for c in conditions.split(",") if c.strip()]

    med_set = {m.strip().lower() for m in medications}

    conflicts: list[dict] = []
    for condition in user_conditions:
        bad_meds = CONDITION_CONFLICTS.get(condition, {})
        for med in med_set:
            if med in bad_meds:
                conflicts.append({
                    "medication": med,
                    "condition": condition,
                    "reason": bad_meds[med],
                })

    return conflicts


# ─────────────────────────────────────────────────────────────────────────
# Risk Level & Recommendation
# ─────────────────────────────────────────────────────────────────────────

def _assess_risk(
    allergy_warnings: list,
    condition_conflicts: list,
    high_freq: list,
    duplicates: list,
) -> tuple[str, str]:
    """Determine overall risk level and generate a recommendation."""

    if allergy_warnings:
        return (
            "critical",
            "STOP — allergy match detected. Do not administer without physician review.",
        )

    danger_points = len(condition_conflicts) * 3 + len(high_freq) * 2 + len(duplicates)

    if danger_points >= 6:
        return (
            "high",
            "Multiple safety concerns found. Consult a healthcare provider before proceeding.",
        )
    if danger_points >= 3:
        return (
            "moderate",
            "Some concerns detected. Review medication list with a pharmacist.",
        )
    if danger_points >= 1:
        return (
            "low",
            "Minor flags noted. Continue with caution.",
        )

    return ("safe", "No safety concerns detected.")


# ─────────────────────────────────────────────────────────────────────────
# Public API
# ─────────────────────────────────────────────────────────────────────────

def run_safety_check(db: Session, user_id: int, medications: list[str]) -> dict:
    """
    Full medication safety analysis for a user.
    """
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        return {"error": "User not found"}

    duplicates = _check_duplicates(medications)
    high_freq = _check_high_frequency(db, user_id, medications)
    allergy_warnings = _check_allergies(medications, user.allergies)
    condition_conflicts = _check_condition_conflicts(medications, user.existing_conditions)

    risk_level, recommendation = _assess_risk(
        allergy_warnings, condition_conflicts, high_freq, duplicates
    )

    # Build interaction warnings list
    interaction_warnings: list[dict] = []
    if duplicates:
        interaction_warnings.append({
            "type": "duplicate",
            "detail": f"Duplicate medications in list: {', '.join(duplicates)}",
        })
    for hf in high_freq:
        interaction_warnings.append({
            "type": "high_frequency",
            "detail": f"{hf['medication']} taken {hf['times_this_week']} times this week.",
        })

    logger.info(
        "Safety check for user %d — risk: %s (%d allergy, %d conflict, %d freq warnings)",
        user_id, risk_level,
        len(allergy_warnings), len(condition_conflicts), len(high_freq),
    )

    return {
        "risk_level": risk_level,
        "interaction_warnings": interaction_warnings,
        "allergy_warnings": allergy_warnings,
        "condition_conflicts": condition_conflicts,
        "recommendation": recommendation,
    }
