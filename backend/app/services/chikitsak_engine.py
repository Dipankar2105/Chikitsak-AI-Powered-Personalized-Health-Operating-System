"""
Chikitsak Engine — The high-level health orchestrator for the platform.
This engine coordinates triage, image analysis, lab results, and user history
to provide a holistic medical assessment.
"""

from typing import Dict, Any, List
from backend.app.services.hybrid_triage_service import predict_disease_with_fallback
from backend.app.services.safety_system import detect_emergency

class ChikitsakEngine:
    @staticmethod
    def analyze_health_query(user_id: int, message: str, symptoms: List[str], user_profile: Dict[str, Any] = None) -> Dict[str, Any]:
        """
        Unified analysis of a health-related query with clinical-grade reasoning (CDSS, XAI, RAG).
        """
        from backend.app.services.cdss_engine import rank_differential_diagnosis, get_risk_scores_for_symptoms
        from backend.app.services.xai_engine import explain_diagnosis
        from backend.app.services.medical_rag import generate_evidence_based_answer

        # 1. Emergency Check
        emergency = detect_emergency(message)
        if emergency.get("is_emergency"):
            return {
                "topDiagnosis": "EMERGENCY",
                "differentialDiagnosis": [],
                "triageLevel": "Emergency",
                "nextSteps": ["Call emergency services immediately", "Go to the nearest hospital"],
                "followUpQuestions": [],
                "aiConfidence": 1.0,
                "reasoning": f"Emergency detected: {emergency.get('emergency_type')}",
                "is_emergency": True,
                "clinical_data": {"emergency_type": emergency.get("emergency_type")}
            }

        # 2. Clinical Differential Diagnosis (CDSS)
        age = user_profile.get("age") if user_profile else None
        gender = user_profile.get("gender") if user_profile else None
        
        differential = rank_differential_diagnosis(
            symptoms=symptoms,
            age=age,
            gender=gender,
            existing_conditions=user_profile.get("existing_conditions") if user_profile else []
        )
        
        # 3. Clinical Risk Scoring
        risk_scores = get_risk_scores_for_symptoms(
            symptoms=symptoms,
            age=age,
            risk_factors=(user_profile.get("family_history", []) + 
                          user_profile.get("chronic_conditions", [])),
            existing_conditions=(user_profile.get("existing_conditions", []) + 
                                 user_profile.get("chronic_conditions", []))
        )

        # 4. Triage Prediction (ML Fallback integration)
        triage_result = predict_disease_with_fallback(symptoms)
        top_diagnosis = differential[0]["condition"] if differential else triage_result.get("disease_prediction", "Unknown")
        ml_conf = triage_result.get("confidence", 0.0)

        # 5. Explainable AI (XAI)
        explanation = explain_diagnosis(
            symptoms=symptoms,
            diagnosis=top_diagnosis,
            ml_confidence=ml_conf,
            differential=differential
        )

        # 6. Medical Knowledge RAG
        rag_info = generate_evidence_based_answer(f"Explain {top_diagnosis} symptoms and precautions")

        # 7. Comprehensive Clinical Output
        return {
            "topDiagnosis": top_diagnosis,
            "differentialDiagnosis": differential,
            "clinicalRiskScores": risk_scores,
            "explainableAI": explanation,
            "medicalKnowledge": rag_info,
            "triageLevel": triage_result.get("triage_level", "Routine"),
            "nextSteps": triage_result.get("next_steps", ["Consult a healthcare professional for a formal diagnosis"]),
            "followUpQuestions": triage_result.get("follow_up_questions", []),
            "aiConfidence": explanation["confidence_breakdown"]["combined_confidence"] / 100,
            "reasoning": explanation["reasoning"]["clinical_narrative"],
            "needsMoreInfo": triage_result.get("needs_more_info", False)
        }

    @staticmethod
    def synthesize_image_analysis(analysis_result: Dict[str, Any]) -> Dict[str, Any]:
        """Convert raw image model output to Chikitsak Engine format."""
        return {
            "possibleConditions": [analysis_result.get("prediction")] if analysis_result.get("prediction") else [],
            "triageLevel": analysis_result.get("risk_level", "Unknown"),
            "nextSteps": [analysis_result.get("recommendation")] if analysis_result.get("recommendation") else [],
            "followUpQuestions": [],
            "aiConfidence": analysis_result.get("confidence", 0.0),
            "reasoning": f"Image type: {analysis_result.get('image_type')}",
        }
