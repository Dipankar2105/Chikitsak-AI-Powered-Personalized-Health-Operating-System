"""
Symptom Routes — log symptoms with authentication, hybrid AI triage, and safety checks.
"""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from pydantic import BaseModel, Field

from backend.app.database import get_db
from backend.app.models.user import User
from backend.app.models.symptom_log import SymptomLog
from backend.app.schemas.symptom_log import SymptomLogCreate, SymptomLogResponse
from backend.app.services.auth_service import get_current_user
from backend.app.services.hybrid_triage_service import predict_disease_with_fallback, calculate_severity_with_hybrid
from backend.app.services.safety_system import detect_emergency, format_emergency_response, should_override_ai_response
from backend.app.logging_config import get_logger

logger = get_logger("routes.symptoms")

router = APIRouter(prefix="/symptoms", tags=["Symptoms"])


class SymptomAnalysisRequest(BaseModel):
    """Enhanced symptom analysis request."""
    symptoms: list[str] = Field(..., min_items=1, max_items=10)
    duration_days: int = Field(None, ge=1, le=365)
    severity_scale: int = Field(None, ge=1, le=10)


class SymptomAnalysisResponse(BaseModel):
    """Enhanced symptom analysis response."""
    status: str
    data: dict
    message: str = None
    confidence: float


@router.post("/log", response_model=SymptomLogResponse)
def log_symptoms(
    entry: SymptomLogCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Log symptoms with hybrid triage (ML + LLM fallback)."""
    
    # 1. Check for emergencies
    symptoms_text = " ".join(entry.symptoms) if entry.symptoms else ""
    emergency_detection = detect_emergency(
        symptoms_text,
        age=current_user.age,
        gender=current_user.gender,
    )
    
    # 2. Run hybrid triage
    predicted_result = predict_disease_with_fallback(entry.symptoms)
    predicted = predicted_result.get("disease_prediction", "Unknown")
    
    # 3. Get severity
    severity_result = calculate_severity_with_hybrid(entry.symptoms)
    triage = severity_result.get("triage_level", "Unknown")
    
    # Override if emergency
    if should_override_ai_response(emergency_detection):
        triage = "Emergency"
        predicted = emergency_detection.get("type", "Emergency Condition")
    
    # Store in database
    db_entry = SymptomLog(
        user_id=current_user.id,
        symptoms=entry.symptoms,
        predicted_disease=predicted,
        triage_level=triage,
    )
    db.add(db_entry)
    db.commit()
    db.refresh(db_entry)
    
    logger.info(
        "Symptoms logged for user %d: %s → %s (%s) | Emergency: %s",
        current_user.id,
        entry.symptoms,
        predicted,
        triage,
        emergency_detection["is_emergency"],
    )
    
    return db_entry


@router.post("/analyze", response_model=SymptomAnalysisResponse)
def analyze_symptoms(
    request: SymptomAnalysisRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Clinical-grade symptom analysis with CDSS, Explainable AI,
    emergency detection, and evidence-based reasoning.
    """
    
    symptoms_text = " ".join(request.symptoms)
    
    # 1. Emergency check
    emergency_detection = detect_emergency(
        symptoms_text,
        age=current_user.age,
        gender=current_user.gender,
    )
    
    if should_override_ai_response(emergency_detection):
        emergency_msg = format_emergency_response(emergency_detection)
        logger.warning("Emergency detected for user %d: %s", current_user.id, emergency_detection["type"])
        
        return {
            "status": "error",
            "data": {
                "emergency": True,
                "type": emergency_detection["type"],
                "level": emergency_detection["level"],
                "action": emergency_detection["action"],
            },
            "message": emergency_msg,
            "confidence": 1.0,
        }
    
    # 2. Hybrid triage (ML + LLM fallback)
    disease_result = predict_disease_with_fallback(request.symptoms)
    severity_result = calculate_severity_with_hybrid(request.symptoms)
    
    # 3. CDSS — differential diagnosis ranking
    from backend.app.services.cdss_engine import rank_differential_diagnosis, get_risk_scores_for_symptoms
    
    differential = rank_differential_diagnosis(
        symptoms=request.symptoms,
        age=current_user.age,
        gender=current_user.gender,
        existing_conditions=current_user.existing_conditions or [],
        family_history=None,  # From medical profile if available
    )
    
    # 4. Clinical risk scores (auto-selected based on symptoms)
    risk_scores = get_risk_scores_for_symptoms(
        symptoms=request.symptoms,
        age=current_user.age,
        risk_factors=current_user.existing_conditions or [],
        existing_conditions=current_user.existing_conditions or [],
    )
    
    # 5. XAI — explainable AI analysis
    from backend.app.services.xai_engine import explain_diagnosis
    
    top_diagnosis = disease_result.get("disease_prediction", "Unknown")
    ml_confidence = disease_result.get("confidence", 0.5)
    
    explanation = explain_diagnosis(
        symptoms=request.symptoms,
        diagnosis=top_diagnosis,
        ml_confidence=ml_confidence,
        differential=differential,
    )
    
    return {
        "status": "success",
        "data": {
            # Core diagnosis
            "disease_prediction": top_diagnosis,
            "confidence": ml_confidence,
            "model_used": disease_result.get("model_used"),
            "reasoning": disease_result.get("reasoning"),
            "triage_level": severity_result.get("triage_level"),
            "severity_score": severity_result.get("severity_score"),
            "red_flags": severity_result.get("red_flags", []),
            "next_steps": disease_result.get("next_steps", []),
            "top_predictions": disease_result.get("top_predictions", []),
            "follow_up_questions": disease_result.get("follow_up_questions", []),
            "needs_more_info": disease_result.get("needs_more_info", False),
            
            # CDSS — Differential Diagnosis
            "differential_diagnosis": differential,
            "risk_scores": risk_scores,
            
            # XAI — Explainable AI
            "symptom_contributions": explanation.get("symptom_contributions", []),
            "clinical_reasoning": explanation.get("reasoning", {}),
            "confidence_breakdown": explanation.get("confidence_breakdown", {}),
            "medical_references": explanation.get("medical_references", []),
        },
        "message": f"Analysis complete. Diagnosis: {top_diagnosis}",
        "confidence": ml_confidence,
    }

