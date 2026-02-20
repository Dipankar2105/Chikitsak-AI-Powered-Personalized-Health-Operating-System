import os

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../../"))

MODEL_PATH = os.path.join(BASE_DIR, "backend", "app", "ml_models", "triage_model.pkl")
DATASET_PATH = os.path.join(BASE_DIR, "datasets", "triage", "Training.csv")

_model = None
_symptom_columns = None


def _load_resources():
    global _model, _symptom_columns
    if _model is not None and _symptom_columns is not None:
        return True

    if not os.path.exists(MODEL_PATH) or not os.path.exists(DATASET_PATH):
        from backend.app.logging_config import get_logger
        get_logger("ml_models.triage_infer").warning("Engine data or model absent")
        return False

    try:
        import joblib
        import pandas as pd
        _model = joblib.load(MODEL_PATH)

        df = pd.read_csv(DATASET_PATH)
        df = df.loc[:, ~df.columns.str.contains("^Unnamed")]
        _symptom_columns = df.drop("prognosis", axis=1).columns.tolist()
        return True
    except Exception as e:
        from backend.app.logging_config import get_logger
        get_logger("ml_models.triage_infer").error("Data load failed: %s", e)
        return False


def build_symptom_vector(user_symptoms):
    if not _symptom_columns:
        return []

    vector = [0] * len(_symptom_columns)
    for symptom in user_symptoms:
        symptom = symptom.strip().lower()
        if symptom in _symptom_columns:
            index = _symptom_columns.index(symptom)
            vector[index] = 1

    return vector


def predict_disease(user_symptoms):
    if not _load_resources():
        return "Unknown (Model unavailable)"

    vector = build_symptom_vector(user_symptoms)
    if not vector:
        return "Unknown"

    prediction = _model.predict([vector])[0]
    return prediction
