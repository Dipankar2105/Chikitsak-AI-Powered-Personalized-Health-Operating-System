"""
Hybrid Triage Service — Local ML + OpenRouter Fallback

Architecture:
1. Try local triage ML model first (from ml_models_registry)
2. If confidence < threshold → use OpenRouter for reasoning
3. Combine results for best diagnosis
4. Return structured response with AI source tracking

Trained Models Used:
- Triage Model: Trained on symptom data for disease prediction
"""

import logging
from typing import Dict, Any, Optional, List
from backend.app.config import get_settings
from backend.app.services.openrouter_service import (
    call_openrouter_sync,
    should_use_fallback,
    get_triage_system_prompt,
)
from backend.app.services.ml_models_registry import (
    get_model,
    is_model_available,
    MODEL_REGISTRY,
)

logger = logging.getLogger(__name__)
settings = get_settings()


def predict_disease_with_fallback(user_symptoms: List[str]) -> Dict[str, Any]:
    """
    Predict disease using local ML model, fall back to LLM if needed.
    
    Returns:
        {
            "disease_prediction": str,
            "confidence": float (0-1),
            "model_used": "local_ml" | "openrouter" | "default",
            "description": str,
            "reasoning": str,
            "triage_level": str,
            "model_info": dict,
            "top_predictions": list[dict],
            "follow_up_questions": list[str],
            "needs_more_info": bool,
        }
    """
    
    # 1. Try local ML model with safety checks
    try:
        from backend.app.ml_models.triage_infer import (
            predict_disease_safe,
            _load_resources,
        )
        
        if _load_resources():
            safe_result = predict_disease_safe(user_symptoms)
            
            # If insufficient symptoms, return follow-up questions
            if safe_result.get("needs_more_info"):
                logger.info(
                    "⚠️ Insufficient symptoms (%d) for reliable diagnosis. Requesting follow-up.",
                    safe_result.get("symptom_count", 0),
                )
                top_preds = safe_result.get("top_predictions", [])
                return {
                    "disease_prediction": safe_result.get("message", "Need more information"),
                    "confidence": safe_result.get("confidence", 0.0),
                    "model_used": "local_ml",
                    "model_info": {
                        "name": "Triage ML Model",
                        "type": "sklearn Random Forest / Classification",
                    },
                    "description": safe_result.get("message", "Insufficient symptoms for reliable diagnosis."),
                    "reasoning": f"Only {safe_result.get('symptom_count', 0)} symptom(s) provided. Minimum 2 required for reliable analysis.",
                    "triage_level": "Routine",
                    "top_predictions": top_preds,
                    "follow_up_questions": safe_result.get("follow_up_questions", []),
                    "needs_more_info": True,
                    "next_steps": ["Please answer the follow-up questions for a more accurate assessment"],
                }
            
            disease = safe_result.get("disease_prediction")
            confidence = safe_result.get("confidence", 0.75)
            
            if disease and disease != "Unknown" and disease != "Unknown (Model unavailable)":
                if not should_use_fallback(confidence):
                    top_preds = safe_result.get("top_predictions", [])
                    logger.info(
                        "🧠 Disease prediction from LOCAL ML MODEL: %s (confidence: %.2f) | Symptoms: %s",
                        disease,
                        confidence,
                        user_symptoms[:3],
                    )
                    
                    # Build description from top predictions
                    desc_parts = [f"Based on {len(user_symptoms)} reported symptoms, the most likely condition is {disease}."]
                    if len(top_preds) > 1:
                        others = ", ".join([f"{p['name']} ({p['probability']:.0%})" for p in top_preds[1:3]])
                        desc_parts.append(f"Other possibilities: {others}.")
                    
                    return {
                        "disease_prediction": disease,
                        "confidence": confidence,
                        "model_used": "local_ml",
                        "model_info": {
                            "name": "Triage ML Model",
                            "type": "sklearn Random Forest / Classification",
                            "dataset": "Symptom-Disease Training Dataset",
                            "dataset_size": "Train/Test split from medical dataset",
                        },
                        "description": " ".join(desc_parts),
                        "reasoning": f"Analyzed symptoms: {', '.join(user_symptoms[:5])}. Model confidence: {confidence:.0%}",
                        "triage_level": "Routine",
                        "top_predictions": top_preds,
                        "follow_up_questions": safe_result.get("follow_up_questions", []),
                        "needs_more_info": False,
                    }
    except Exception as e:
        logger.warning("Local ML model inference failed: %s", str(e))

    # 2. Fall back to OpenRouter LLM
    logger.info(
        "⚠️ Using OPENROUTER LLM for triage (confidence threshold not met or ML unavailable) | Symptoms: %s",
        user_symptoms[:3],
    )
    
    try:
        symptoms_text = ", ".join(user_symptoms) if user_symptoms else "No specific symptoms provided"
        prompt = f"""Patient is reporting the following symptoms: {symptoms_text}

Based on these symptoms, provide your medical assessment including:
1. Most likely diagnosis
2. Confidence level (0-100)
3. Triage level
4. Recommended next steps
5. Red flags to watch for

Format as JSON with keys: diagnosis, confidence, triage_level, next_steps, red_flags"""

        llm_result = call_openrouter_sync(
            prompt=prompt,
            system_prompt=get_triage_system_prompt(),
            temperature=0.3,
            max_tokens=500,
            cache_key=f"triage_{','.join(sorted(user_symptoms))}" if user_symptoms else None,
        )

        if llm_result["status"] == "success":
            try:
                import json
                response_text = llm_result["response"]
                
                json_start = response_text.find('{')
                json_end = response_text.rfind('}') + 1
                
                if json_start >= 0 and json_end > json_start:
                    json_str = response_text[json_start:json_end]
                    parsed = json.loads(json_str)
                    
                    return {
                        "disease_prediction": parsed.get("diagnosis", "Unknown"),
                        "confidence": min(1.0, max(0.0, parsed.get("confidence", 0) / 100.0)),
                        "model_used": "openrouter",
                        "model_info": {
                            "name": "OpenRouter LLM",
                            "provider": llm_result.get("model", settings.OPENROUTER_MODEL),
                            "type": "Large Language Model",
                            "reasoning": "Used when local ML confidence insufficient",
                        },
                        "description": response_text[:300],
                        "reasoning": f"LLM analyzed: {symptoms_text}",
                        "triage_level": parsed.get("triage_level", "Routine"),
                    }
            except (json.JSONDecodeError, ValueError, KeyError) as e:
                logger.warning("Failed to parse LLM JSON response: %s", str(e))
                
                return {
                    "disease_prediction": "Requires evaluation",
                    "confidence": 0.6,
                    "model_used": "openrouter",
                    "model_info": {
                        "name": "OpenRouter LLM",
                        "type": "Text Response",
                    },
                    "description": llm_result["response"][:300],
                    "reasoning": f"LLM analyzed: {symptoms_text}",
                    "triage_level": "Routine",
                }

        # LLM call failed
        return {
            "disease_prediction": "Unknown",
            "confidence": 0.0,
            "model_used": "default",
            "model_info": {"name": "None", "type": "Fallback"},
            "description": "Unable to analyze symptoms at this time. Please try again.",
            "reasoning": llm_result.get("response", "AI services unavailable"),
            "triage_level": "Self-care",
        }

    except Exception as e:
        logger.error("OpenRouter triage failed: %s", str(e))
        return {
            "disease_prediction": "Unknown",
            "confidence": 0.0,
            "model_used": "default",
            "model_info": {"name": "None", "type": "Error"},
            "description": f"Error during analysis: {str(e)[:100]}",
            "reasoning": "Both ML model and LLM services encountered errors",
            "triage_level": "Self-care",
        }


def calculate_severity_with_hybrid(symptoms: List[str]) -> Dict[str, Any]:
    """
    Calculate symptom severity using local model or LLM.
    
    Returns:
        {
            "triage_level": "Self-care" | "Routine" | "Urgent" | "Emergency",
            "severity_score": 0-100,
            "red_flags": List[str],
            "model_used": str,
        }
    """
    
    # 1. Try local severity engine
    try:
        from backend.app.ml_models.severity_engine import calculate_severity
        result = calculate_severity(symptoms)
        if result and result.get("triage_level") in ["Self-care", "Routine", "Urgent", "Emergency"]:
            logger.info(
                "🧠 Severity from LOCAL ML: %s | Symptoms: %s",
                result.get("triage_level"),
                symptoms[:3],
            )
            return {
                "triage_level": result.get("triage_level", "Routine"),
                "severity_score": result.get("severity_score", 50),
                "red_flags": result.get("red_flags", []),
                "model_used": "local_ml",
                "model_info": {
                    "name": "Severity Engine",
                    "type": "ML-based severity assessment",
                },
            }
    except Exception as e:
        logger.warning("Local severity engine failed: %s", str(e))

    # 2. Fall back to LLM severity assessment
    logger.info("⚠️ Using OPENROUTER LLM for severity assessment")
    try:
        symptoms_text = ", ".join(symptoms) if symptoms else "No symptoms"
        prompt = f"""Rate the severity of these symptoms: {symptoms_text}

Return JSON with:
- triage_level: "Self-care" | "Routine" | "Urgent" | "Emergency"
- severity_score: 0-100
- red_flags: list of concerning signs"""

        llm_result = call_openrouter_sync(
            prompt=prompt,
            system_prompt="You are a medical severity assessment AI. Classify symptoms by urgency.",
            temperature=0.2,
            max_tokens=300,
        )

        if llm_result["status"] == "success":
            try:
                import json
                response_text = llm_result["response"]
                json_start = response_text.find('{')
                json_end = response_text.rfind('}') + 1
                
                if json_start >= 0 and json_end > json_start:
                    parsed = json.loads(response_text[json_start:json_end])
                    return {
                        "triage_level": parsed.get("triage_level", "Routine"),
                        "severity_score": parsed.get("severity_score", 50),
                        "red_flags": parsed.get("red_flags", []),
                        "model_used": "openrouter",
                        "model_info": {
                            "name": "OpenRouter LLM",
                            "type": "Severity Assessment",
                        },
                    }
            except (json.JSONDecodeError, ValueError):
                pass

        return {
            "triage_level": "Routine",
            "severity_score": 50,
            "red_flags": [],
            "model_used": "default",
        }

    except Exception as e:
        logger.error("LLM severity assessment failed: %s", str(e))
        return {
            "triage_level": "Self-care",
            "severity_score": 30,
            "red_flags": [],
            "model_used": "default",
        }
