import os

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../../"))

MODEL_PATH = os.path.join(BASE_DIR, "backend", "app", "ml_models", "triage_model.pkl")
DATASET_PATH = os.path.join(BASE_DIR, "datasets", "triage", "Training.csv")

_model = None
_symptom_columns = None

# Follow-up question templates per body system
FOLLOW_UP_MAP = {
    "headache": [
        "Do you feel nausea or vomiting?",
        "Is the pain on one side of your head?",
        "Does light or sound worsen the pain?",
        "Have you had any visual disturbances (aura)?",
    ],
    "fever": [
        "How high is your temperature (°C or °F)?",
        "Has the fever lasted more than 3 days?",
        "Do you have chills or night sweats?",
        "Are you experiencing body aches?",
    ],
    "chest_pain": [
        "Does the pain radiate to your arm, jaw, or back?",
        "Does it worsen with deep breathing?",
        "Are you experiencing shortness of breath?",
        "Do you feel your heart racing or palpitations?",
    ],
    "cough": [
        "Is the cough dry or producing mucus?",
        "Have you noticed any blood in the mucus?",
        "How long have you had the cough?",
        "Do you have difficulty breathing?",
    ],
    "stomach_pain": [
        "Where exactly is the pain (upper, lower, left, right)?",
        "Does the pain worsen after eating?",
        "Do you have nausea, vomiting, or diarrhea?",
        "Have you noticed any changes in bowel habits?",
    ],
    "skin_rash": [
        "Is the rash itchy, painful, or numb?",
        "Has the rash spread or changed in size?",
        "Have you started any new medications recently?",
        "Did you come into contact with any new substances?",
    ],
    "joint_pain": [
        "Which joints are affected?",
        "Is there swelling, redness, or warmth in the joint?",
        "Does the pain worsen with movement or at rest?",
        "Have you had any recent injuries?",
    ],
    "fatigue": [
        "How long have you been feeling fatigued?",
        "Have you noticed any unintended weight changes?",
        "Are you sleeping well at night?",
        "Do you have any other symptoms like fever or pain?",
    ],
}

# Default follow-up questions when no specific match
DEFAULT_FOLLOW_UPS = [
    "How long have you been experiencing these symptoms?",
    "Have the symptoms been getting worse, better, or staying the same?",
    "Are you currently taking any medications?",
    "Do you have any known medical conditions?",
    "Is this the first time you've experienced these symptoms?",
]


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
        # Also try with underscores replaced by spaces and vice versa
        symptom_alt = symptom.replace(" ", "_")
        if symptom_alt in _symptom_columns:
            index = _symptom_columns.index(symptom_alt)
            vector[index] = 1

    return vector


def predict_disease(user_symptoms):
    """Original prediction function — kept for backward compatibility."""
    if not _load_resources():
        return "Unknown (Model unavailable)"

    vector = build_symptom_vector(user_symptoms)
    if not vector:
        return "Unknown"

    prediction = _model.predict([vector])[0]
    return prediction


def get_follow_up_questions(symptoms):
    """
    Generate context-appropriate follow-up questions based on reported symptoms.
    """
    questions = []
    seen_categories = set()

    for symptom in symptoms:
        symptom_lower = symptom.strip().lower().replace("_", " ")
        for key, qs in FOLLOW_UP_MAP.items():
            key_readable = key.replace("_", " ")
            if key_readable in symptom_lower or symptom_lower in key_readable:
                if key not in seen_categories:
                    seen_categories.add(key)
                    questions.extend(qs[:2])  # Take top 2 per category

    # Fill with defaults if we don't have enough
    if len(questions) < 3:
        for q in DEFAULT_FOLLOW_UPS:
            if q not in questions:
                questions.append(q)
            if len(questions) >= 5:
                break

    return questions[:5]


def predict_disease_safe(user_symptoms):
    """
    Safe prediction with minimum-symptom enforcement, probability normalization,
    confidence thresholds, and follow-up question generation.

    Returns:
        {
            "disease_prediction": str or None,
            "top_predictions": list[dict],  # [{name, probability}, ...]
            "confidence": float (0-1),
            "needs_more_info": bool,
            "follow_up_questions": list[str],
            "symptom_count": int,
        }
    """
    symptom_count = len(user_symptoms) if user_symptoms else 0

    # Minimum symptom check
    if symptom_count < 2:
        follow_ups = get_follow_up_questions(user_symptoms) if user_symptoms else DEFAULT_FOLLOW_UPS[:5]
        return {
            "disease_prediction": None,
            "top_predictions": [],
            "confidence": 0.0,
            "needs_more_info": True,
            "follow_up_questions": follow_ups,
            "symptom_count": symptom_count,
            "message": (
                "I need a bit more information to provide an accurate assessment. "
                "Please answer a few follow-up questions."
            ),
        }

    if not _load_resources():
        return {
            "disease_prediction": "Unknown (Model unavailable)",
            "top_predictions": [],
            "confidence": 0.0,
            "needs_more_info": False,
            "follow_up_questions": [],
            "symptom_count": symptom_count,
        }

    vector = build_symptom_vector(user_symptoms)
    if not vector or sum(vector) == 0:
        # No recognized symptoms matched the model's vocabulary
        return {
            "disease_prediction": None,
            "top_predictions": [],
            "confidence": 0.0,
            "needs_more_info": True,
            "follow_up_questions": get_follow_up_questions(user_symptoms),
            "symptom_count": symptom_count,
            "message": (
                "I couldn't match your symptoms to my medical database. "
                "Could you describe them differently?"
            ),
        }

    # Get probabilities for all classes
    try:
        probabilities = _model.predict_proba([vector])[0]
        classes = _model.classes_
    except AttributeError:
        # Model doesn't support predict_proba — fall back to single prediction
        prediction = _model.predict([vector])[0]
        return {
            "disease_prediction": prediction,
            "top_predictions": [{"name": prediction, "probability": 0.75}],
            "confidence": 0.75,
            "needs_more_info": False,
            "follow_up_questions": get_follow_up_questions(user_symptoms),
            "symptom_count": symptom_count,
        }

    # Get top-3 predictions sorted by probability
    sorted_indices = probabilities.argsort()[::-1][:3]
    top_predictions = []
    for idx in sorted_indices:
        prob = float(probabilities[idx])
        if prob > 0.01:  # Only include predictions with >1% probability
            top_predictions.append({
                "name": str(classes[idx]),
                "probability": round(prob, 4),
            })

    # Top prediction
    top_idx = sorted_indices[0]
    top_disease = str(classes[top_idx])
    top_confidence = float(probabilities[top_idx])

    # Confidence threshold check
    CONFIDENCE_THRESHOLD = 0.30
    if top_confidence < CONFIDENCE_THRESHOLD:
        return {
            "disease_prediction": None,
            "top_predictions": top_predictions,
            "confidence": round(top_confidence, 4),
            "needs_more_info": True,
            "follow_up_questions": get_follow_up_questions(user_symptoms),
            "symptom_count": symptom_count,
            "message": (
                "The analysis is inconclusive. Here are some possibilities, "
                "but I need more information for a reliable assessment."
            ),
        }

    return {
        "disease_prediction": top_disease,
        "top_predictions": top_predictions,
        "confidence": round(top_confidence, 4),
        "needs_more_info": False,
        "follow_up_questions": get_follow_up_questions(user_symptoms),
        "symptom_count": symptom_count,
    }
