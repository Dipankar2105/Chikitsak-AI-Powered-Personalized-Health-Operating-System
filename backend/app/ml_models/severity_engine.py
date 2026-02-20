import os

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../../"))
SEVERITY_PATH = os.path.join(BASE_DIR, "datasets", "triage", "Symptom-severity.csv")

_severity_map = None


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
    severity_map = _get_severity_map()
    total_score = 0
    
    for symptom in symptoms_list:
        symptom = symptom.strip().lower()
        if symptom in severity_map:
            total_score += severity_map[symptom]

    # Simple triage levels
    if total_score <= 5:
        level = "Mild"
    elif total_score <= 12:
        level = "Moderate"
    else:
        level = "High / Emergency"

    return {
        "total_severity_score": total_score,
        "triage_level": level
    }
