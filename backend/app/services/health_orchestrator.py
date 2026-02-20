from backend.app.ml_models.health_engine import run_health_engine
from backend.app.ml_models.lab_engine import analyze_lab_report
from backend.app.ml_models.drug_engine import check_drug_interactions
from backend.app.ml_models.mental_engine import analyze_mental_state
from backend.app.ml_models.nutrition_engine import analyze_food

from backend.app.services.translation_service import (
    translate_to_english,
    translate_from_english
)

from backend.app.services.location_service import get_region_alerts


def run_full_health_analysis(payload: dict):

    result = {}
    language = payload.get("language", "en")

    # ─────────────────────────────
    # TRANSLATE INPUT TO ENGLISH
    # ─────────────────────────────

    if language != "en":

        if payload.get("symptoms"):
            payload["symptoms"] = [
                translate_to_english(s, language)
                for s in payload["symptoms"]
            ]

        if payload.get("mental_text"):
            payload["mental_text"] = translate_to_english(
                payload["mental_text"], language
            )

        if payload.get("user_query"):
            payload["user_query"] = translate_to_english(
                payload["user_query"], language
            )

        if payload.get("food"):
            payload["food"] = translate_to_english(
                payload["food"], language
            )

    # ─────────────────────────────
    # RUN AI ENGINES (ENGLISH)
    # ─────────────────────────────

    if payload.get("symptoms"):
        result["symptom_analysis"] = run_health_engine(
            payload["symptoms"],
            payload.get("user_query")
        )

    if payload.get("lab_values"):
        result["lab_analysis"] = analyze_lab_report(payload["lab_values"])

    if payload.get("medications"):
        result["drug_analysis"] = check_drug_interactions(payload["medications"])

    if payload.get("mental_text"):
        result["mental_analysis"] = analyze_mental_state(payload["mental_text"])

    if payload.get("food"):
        result["nutrition_analysis"] = analyze_food(payload["food"])

    if payload.get("location"):
        result["regional_alerts"] = get_region_alerts(payload["location"])

    # ─────────────────────────────
    # TRANSLATE OUTPUT BACK
    # ─────────────────────────────

    if language != "en":
        for key, value in result.items():
            if isinstance(value, dict):
                for subkey in value:
                    if isinstance(value[subkey], str):
                        value[subkey] = translate_from_english(
                            value[subkey], language
                        )

    return result