import os

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../../"))
SEVERITY_PATH = os.path.join(BASE_DIR, "datasets", "triage", "Symptom-severity.csv")

_severity_map = None

# Symptoms that are always red flags regardless of weight
RED_FLAG_SYMPTOMS = {
    "chest_pain", "loss_of_consciousness", "breathlessness",
    "altered_sensorium", "coma", "internal_itching",
    "toxic_look_(typhos)", "unsteadiness",
}


def _get_severity_map():
    global _severity_map
    if _severity_map is not None:
        return _severity_map

    _severity_map = {}
    if not os.path.exists(SEVERITY_PATH):
        from backend.app.logging_config import get_logger
        get_logger("ml_models.severity_engine").warning(f"Engine data absent: {SEVERITY_PATH}")
        return _severity_map

    try:
        import pandas as pd
        severity_df = pd.read_csv(SEVERITY_PATH)
        _severity_map = dict(zip(severity_df["Symptom"], severity_df["weight"]))
    except Exception as e:
        from backend.app.logging_config import get_logger
        get_logger("ml_models.severity_engine").error("Data load failed: %s", e)

    return _severity_map


def calculate_severity(symptoms_list):
    """
    Calculate severity with standard triage levels and red flag detection.

    Returns:
        {
            "total_severity_score": int,
            "severity_score": int (0-100 normalized),
            "triage_level": "Self-care" | "Routine" | "Urgent" | "Emergency",
            "red_flags": list[str],
        }
    """
    severity_map = _get_severity_map()
    total_score = 0
    red_flags = []

    for symptom in symptoms_list:
        symptom_clean = symptom.strip().lower().replace(" ", "_")
        if symptom_clean in severity_map:
            total_score += severity_map[symptom_clean]
        # Also try without underscores (some datasets use spaces)
        symptom_space = symptom.strip().lower()
        if symptom_space in severity_map:
            total_score += severity_map[symptom_space]

        # Detect red flags
        if symptom_clean in RED_FLAG_SYMPTOMS:
            red_flags.append(f"Critical symptom: {symptom.strip()}")

    # Normalize to 0-100
    # Max reasonable score is ~50 (7 symptoms × ~7 weight each)
    severity_score = min(100, int((total_score / 50) * 100))

    # Standard triage levels matching hybrid_triage_service expectations
    if total_score <= 5:
        level = "Self-care"
    elif total_score <= 12:
        level = "Routine"
    elif total_score <= 18:
        level = "Urgent"
    else:
        level = "Emergency"

    # Red flags can elevate triage
    if red_flags and level in ("Self-care", "Routine"):
        level = "Urgent"

    return {
        "total_severity_score": total_score,
        "severity_score": severity_score,
        "triage_level": level,
        "red_flags": red_flags,
    }
