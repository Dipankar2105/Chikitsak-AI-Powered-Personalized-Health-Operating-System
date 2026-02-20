import os

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../../"))

DESC_PATH = os.path.join(BASE_DIR, "datasets", "triage", "symptom_Description.csv")
PREC_PATH = os.path.join(BASE_DIR, "datasets", "triage", "symptom_precaution.csv")

_description_map = None
_precaution_map = None


def _load_maps():
    global _description_map, _precaution_map
    if _description_map is not None and _precaution_map is not None:
        return
    
    try:
        import pandas as pd
        desc_df = pd.read_csv(DESC_PATH)
        prec_df = pd.read_csv(PREC_PATH)
        
        _description_map = dict(zip(desc_df["Disease"], desc_df["Description"]))
        _precaution_map = dict(zip(prec_df["Disease"], prec_df.iloc[:, 1:].values.tolist()))
    except Exception as e:
        from backend.app.logging_config import get_logger
        get_logger("ml_models.health_engine").warning(f"Engine data absent or load failed: {e}")
        _description_map = {}
        _precaution_map = {}


def run_health_engine(symptoms_list, user_query=None):
    from .triage_infer import predict_disease
    from .severity_engine import calculate_severity
    
    disease = predict_disease(symptoms_list)
    severity_info = calculate_severity(symptoms_list)

    _load_maps()
    description = _description_map.get(disease, "No description available.")
    precautions = _precaution_map.get(disease, [])

    chatbot_response = None
    if user_query:
        from .medquad_engine import get_medical_answer
        chatbot_response = get_medical_answer(user_query)

    return {
        "predicted_disease": disease,
        "severity": severity_info,
        "description": description,
        "precautions": precautions,
        "chatbot_response": chatbot_response
    }
