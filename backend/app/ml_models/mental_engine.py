import os

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../../"))
MODEL_PATH = os.path.join(BASE_DIR, "backend", "app", "ml_models", "mental_model.pkl")

_vectorizer = None
_model = None


def _load_model():
    global _vectorizer, _model
    if _vectorizer is not None and _model is not None:
        return True

    if not os.path.exists(MODEL_PATH):
        from backend.app.logging_config import get_logger
        get_logger("ml_models.mental_engine").warning(f"Engine data absent: {MODEL_PATH}")
        return False

    try:
        import joblib
        _vectorizer, _model = joblib.load(MODEL_PATH)
        return True
    except Exception as e:
        from backend.app.logging_config import get_logger
        get_logger("ml_models.mental_engine").error("Data load failed: %s", e)
        return False


def analyze_mental_state(text):
    if not _load_model():
        return {
            "emotion": "Unknown (Model missing)",
            "confidence": 0.0,
            "severity_level": "Low"
        }

    vec = _vectorizer.transform([text])
    prediction = _model.predict(vec)[0]
    confidence = _model.predict_proba(vec).max()

    # Simple severity mapping
    if prediction in ["sadness", "depression", "fear"]:
        severity = "High"
    elif prediction in ["anger"]:
        severity = "Moderate"
    else:
        severity = "Low"

    return {
        "emotion": prediction,
        "confidence": float(confidence),
        "severity_level": severity
    }
