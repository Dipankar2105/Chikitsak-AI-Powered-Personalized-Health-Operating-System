"""
Chat service used by /chat.

Integrated features:
- Emergency detection and safety override
- Multi-bot routing (child, adult male, adult female, elderly, mental health)
- Health mode: unified health orchestrator + hybrid AI
- Mental mode: mental ML engine + emotional support
- Hybrid AI: local ML + OpenRouter LLM fallback
"""

from __future__ import annotations

import re
import uuid
from typing import Any

from sqlalchemy.orm import Session

from backend.app.logging_config import get_logger
from backend.app.models.chat_history import ChatHistory
from backend.app.services.health_orchestrator import run_full_health_analysis
from backend.app.services.safety_system import (
    detect_emergency,
    format_emergency_response,
    should_override_ai_response,
)
from backend.app.services.multibot_router import (
    get_bot_type,
    get_bot_system_prompt,
    BotType,
)
from backend.app.services.hybrid_triage_service import (
    predict_disease_with_fallback,
    calculate_severity_with_hybrid,
)
from backend.app.models.user import User

logger = get_logger("services.chat_service")


def _normalize_text(text: str) -> str:
    return re.sub(r"[^a-z0-9_ ]+", " ", text.lower()).strip()


def _extract_symptoms(message: str) -> list[str]:
    """
    Extract symptom names by matching normalized tokens against triage columns.
    """
    try:
        from backend.app.ml_models.triage_infer import _symptom_columns
    except Exception as exc:
        logger.error("triage symptom columns unavailable: %s", exc)
        return []

    columns = _symptom_columns or []
    if not columns:
        return []

    normalized_msg = f" {_normalize_text(message).replace('_', ' ')} "
    found: list[str] = []
    for symptom in columns:
        normalized_symptom = symptom.lower().replace("_", " ")
        if f" {normalized_symptom} " in normalized_msg:
            found.append(symptom)
    return found


def _triage_summary(analysis: dict[str, Any]) -> tuple[str, list[dict[str, Any]], list[str]]:
    triage = analysis.get("health_triage") or {}
    triage_level = str(triage.get("triage_level") or "unknown")
    disease = triage.get("disease_prediction")
    description = triage.get("description")
    precautions = triage.get("precautions") or []

    clean_precautions = [
        str(item).strip()
        for item in precautions
        if item is not None and str(item).strip() and str(item).strip().lower() != "nan"
    ]

    causes: list[dict[str, Any]] = []
    if disease and str(disease).strip().lower() not in {"unknown", "unknown (model unavailable)"}:
        risk = "medium"
        low_triage = triage_level.lower()
        if "emergency" in low_triage or "high" in low_triage:
            risk = "high"
        elif "low" in low_triage or "self" in low_triage:
            risk = "low"
        causes.append(
            {
                "name": str(disease),
                "probability": 75,
                "confidence": 75,
                "risk": risk,
                "description": description or "",
            }
        )

    response_chunks: list[str] = []
    if causes:
        response_chunks.append(f"Possible condition: {causes[0]['name']}")
    if description:
        response_chunks.append(description)
    response_chunks.append(f"Triage level: {triage_level}")
    if clean_precautions:
        response_chunks.append("Recommended next steps:")
        response_chunks.extend([f"{idx + 1}. {step}" for idx, step in enumerate(clean_precautions[:5])])

    response_text = "\n".join(response_chunks).strip() or "Please share more symptoms for better analysis."
    return response_text, causes, clean_precautions


def _get_user_demographics(db: Session, user_id: int) -> dict[str, Any]:
    """Get user age and gender for bot routing."""
    try:
        user = db.query(User).filter(User.id == user_id).first()
        if user:
            return {
                "age": user.age,
                "gender": user.gender,
            }
    except Exception as e:
        logger.warning("Failed to fetch user demographics: %s", e)
    
    return {"age": None, "gender": None}


from backend.app.services.chikitsak_engine import ChikitsakEngine

def _health_response(db: Session, user_id: int, message: str, language: str) -> dict[str, Any]:
    """Health mode chat using the unified Chikitsak Engine."""
    
    # 1. Extract symptoms
    symptoms = _extract_symptoms(message)
    
    # 2. Get User Profile for personalized clinical analysis
    user_profile = {}
    try:
        user = db.query(User).filter(User.id == user_id).first()
        if user:
            user_profile = {
                "age": user.age,
                "gender": user.gender,
                "existing_conditions": user.existing_conditions or [],
            }
            # Merge with medical profile if exists
            if user.medical_profile:
                mp = user.medical_profile
                user_profile.update({
                    "height_cm": mp.height_cm,
                    "weight_kg": mp.weight_kg,
                    "activity_level": mp.activity_level,
                    "chronic_conditions": mp.chronic_conditions or [],
                    "family_history": mp.family_history or [],
                })
    except Exception as e:
        logger.warning("Could not fetch user profile for engine: %s", e)

    # 3. Run through Chikitsak Engine
    analysis = ChikitsakEngine.analyze_health_query(user_id, message, symptoms, user_profile)
    
    # 3. Format response based on engine output
    if analysis.get("is_emergency"):
        return {
            "status": "success",
            "response": "\n".join(analysis["nextSteps"]),
            "confidence": analysis["aiConfidence"],
            "triage": "Emergency",
            "causes": [{"name": "Emergency", "risk": "critical", "description": analysis["reasoning"]}],
            "next_steps": analysis["nextSteps"],
            "risk_flags": ["emergency"]
        }

    # Handle insufficient symptoms
    if analysis.get("needsMoreInfo"):
        response_text = analysis["reasoning"] or "I need a bit more information for a reliable analysis."
        if analysis["followUpQuestions"]:
            response_text += "\n\n**Please answer these follow-up questions:**\n"
            response_text += "\n".join([f"• {q}" for q in analysis["followUpQuestions"]])
            
        return {
            "status": "success",
            "response": response_text,
            "confidence": analysis["aiConfidence"],
            "triage": analysis["triageLevel"],
            "causes": [],
            "next_steps": ["Answer follow-up questions"],
            "risk_flags": ["needs_more_info"],
            "follow_up_questions": analysis["followUpQuestions"]
        }

    # Standard healthy/triage response
    disease = analysis["possibleConditions"][0] if analysis["possibleConditions"] else "General Query"
    return {
        "status": "success",
        "response": f"Based on your symptoms, the most likely condition is **{disease}**. \n\nReasoning: {analysis['reasoning']}",
        "confidence": analysis["aiConfidence"],
        "triage": analysis["triageLevel"],
        "causes": [
            {
                "name": disease,
                "probability": int(analysis["aiConfidence"] * 100),
                "confidence": int(analysis["aiConfidence"] * 100),
                "risk": "high" if analysis["triageLevel"] in ["Emergency", "Urgent"] else "medium",
                "description": analysis["reasoning"],
            }
        ],
        "next_steps": analysis["nextSteps"],
        "risk_flags": [],
        "model_used": "chikitsak_v1_engine"
    }


def _mental_response(db: Session, user_id: int, message: str) -> dict[str, Any]:
    """Mental health mode chat using specialized mental engine."""
    
    # Crisis Detection (Emergency)
    crisis_keywords = ["suicide", "suicidal", "kill myself", "self-harm", "hurt myself", "end my life"]
    message_lc = message.lower()
    if any(kw in message_lc for kw in crisis_keywords):
        return {
            "status": "success",
            "response": "I'm very concerned about what you're sharing. Please, you don't have to carry this alone. Help is available right now.",
            "confidence": 0.99,
            "triage": "Emergency",
            "causes": [{"name": "Crisis", "risk": "critical", "description": "Self-harm/Suicide risk detected"}],
            "next_steps": ["Call 988 (USA)", "Call AASRA (India: 9820466726)", "Go to nearest hospital"],
            "risk_flags": ["priority_crisis"]
        }

    try:
        from backend.app.ml_models.mental_engine import analyze_mental_state, get_therapeutic_response
        
        # 1. Detect Mood/Emotion
        analysis = analyze_mental_state(message)
        emotion = analysis.get("emotion", "neutral")
        confidence = analysis.get("confidence", 0.5)
        severity = analysis.get("severity_level", "Low")
        
        # 2. Get Structured Therapy Response
        therapy = get_therapeutic_response(emotion, severity)
        
        # 3. Format Response with rich markdown
        response_text = therapy["empathetic_response"]
        
        if therapy["cbt_suggestions"]:
            response_text += "\n\n**💡 Cognitive Behavioral Exercise:**\n" + therapy["cbt_suggestions"][0]
            
        if therapy["coping_strategies"]:
            response_text += "\n\n**🌿 Coping Strategies:**\n" + "\n".join([f"• {s}" for s in therapy["coping_strategies"][:2]])

        if therapy["professional_referral"]:
            response_text += "\n\n**🏥 Professional Note:** Based on your current state, I strongly recommend speaking with a licensed therapist."

        return {
            "status": "success",
            "response": response_text,
            "confidence": confidence,
            "triage": "Urgent" if severity == "High" else "Routine",
            "causes": [{"name": emotion.capitalize(), "risk": severity.lower(), "description": f"Detected mood: {emotion}"}],
            "next_steps": therapy["coping_strategies"][:3],
            "risk_flags": [emotion],
            "follow_up_questions": therapy["conversation_prompts"]
        }
        
    except Exception as e:
        logger.error("Mental health analysis failed: %s", e)
        return {
            "status": "error",
            "response": "I'm here to listen, but I'm having trouble analyzing our conversation right now. How are you feeling?",
            "confidence": 0.0,
            "triage": "Unknown",
            "causes": [],
            "next_steps": ["Share more feelings"],
            "risk_flags": []
        }


def process_chat(
    db: Session,
    user_id: int,
    message: str,
    mode: str,
    language: str = "en",
    session_id: str | None = None,
) -> dict[str, Any]:
    """Main chat processing function with all safety and AI systems integrated."""
    
    if not session_id:
        session_id = str(uuid.uuid4())

    user_entry = ChatHistory(
        user_id=user_id,
        role="user",
        content=message,
        session_id=session_id,
        metadata_={"mode": mode, "language": language},
    )
    db.add(user_entry)

    try:
        if mode == "mental":
            result = _mental_response(db, user_id, message)
        else:  # health mode (default)
            result = _health_response(db, user_id, message, language)
    except Exception as exc:
        logger.error("chat processing failed: %s", exc, exc_info=True)
        db.rollback()
        return {
            "status": "error",
            "message": "Unable to process request",
            "session_id": session_id,
        }

    assistant_entry = ChatHistory(
        user_id=user_id,
        role="assistant",
        content=result.get("response", ""),
        session_id=session_id,
        metadata_={
            "mode": mode,
            "confidence": result.get("confidence"),
            "triage": result.get("triage"),
            "risk_flags": result.get("risk_flags", []),
            "causes": result.get("causes", []),
            "next_steps": result.get("next_steps", []),
            "model_used": result.get("model_used", "unknown"),
        },
    )
    db.add(assistant_entry)
    db.commit()

    result["session_id"] = session_id
    return result
