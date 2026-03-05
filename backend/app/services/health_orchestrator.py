from datetime import datetime
from sqlalchemy.orm import Session
from backend.app.ml_models.health_engine import run_health_engine
from backend.app.ml_models.severity_engine import calculate_severity
from backend.app.ml_models.lab_engine import analyze_lab_report
from backend.app.ml_models.drug_engine import check_drug_interactions
from backend.app.ml_models.mental_engine import analyze_mental_state
from backend.app.ml_models.nutrition_engine import analyze_food
from backend.app.services.medication_safety_service import run_safety_check
from backend.app.services.location_service import get_region_alerts
from backend.app.services.translation_service import translate_to_english, translate_from_english

def run_full_health_analysis(db: Session, user_id: int, payload: dict):
    """
    Master Intelligence Orchestrator.
    Combines triage, severity, labs, drugs, mental, nutrition, and epidemiology.
    """
    result = {}
    language = payload.get("language", "en")
    location = payload.get("location")

    # 1. Translation Layer (Input)
    if language != "en":
        if payload.get("symptoms"):
            payload["symptoms"] = [translate_to_english(s, language) for s in payload["symptoms"]]
        if payload.get("mental_text"):
            payload["mental_text"] = translate_to_english(payload["mental_text"], language)
        if payload.get("user_query"):
            payload["user_query"] = translate_to_english(payload["user_query"], language)
        if payload.get("food"):
            payload["food"] = translate_to_english(payload["food"], language)

    # 2. Symptom & Triage Pipeline
    if payload.get("symptoms"):
        symptoms = payload["symptoms"]
        triage = run_health_engine(symptoms, payload.get("user_query"))
        severity = calculate_severity(symptoms)
        
        result["health_triage"] = {
            "disease_prediction": triage.get("predicted_disease"),
            "severity_score": severity.get("total_severity_score"),
            "triage_level": severity.get("triage_level"),
            "description": triage.get("description"),
            "precautions": triage.get("precautions")
        }

    # 3. Diagnostic & Safety Pipeline
    if payload.get("lab_values"):
        result["lab_analysis"] = analyze_lab_report(payload["lab_values"])

    if payload.get("medications"):
        meds = payload["medications"]
        interactions = check_drug_interactions(meds)
        safety = run_safety_check(db, user_id, meds)
        
        result["medication_analysis"] = {
            "interactions": interactions,
            "safety_flags": safety.get("flags", []),
            "summary": safety.get("summary", "No major medication issues detected.")
        }

    # 4. Mental & Nutrition Pipeline
    if payload.get("mental_text"):
        result["mental_analysis"] = analyze_mental_state(payload["mental_text"])

    if payload.get("food"):
        result["nutrition_analysis"] = analyze_food(payload["food"])

    # 5. Contextual Intelligence (Epidemiology)
    if location:
        result["epidemiology"] = get_region_alerts(location)

    # 6. Translation Layer (Output)
    if language != "en":
        # Deep translate string values in result dict
        result = _deep_translate(result, language)

    return result

def _deep_translate(data, lang):
    if isinstance(data, dict):
        return {k: _deep_translate(v, lang) for k, v in data.items()}
    elif isinstance(data, list):
        return [_deep_translate(i, lang) for i in data]
    elif isinstance(data, str) and len(data) > 2:
        return translate_from_english(data, lang)
    return data
