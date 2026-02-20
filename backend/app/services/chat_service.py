"""
Chat Service — Dual-mode chatbot engine.

Mode 1: Health Assistant — general health, medicine suggestions, treatment guidance.
Mode 2: Mental Health Therapist — empathetic, supportive, crisis detection.

Uses ML engines (medquad, mental, triage) when available, falls back to
rule-based responses when models are missing.
"""

import uuid
from datetime import datetime, timezone
from sqlalchemy.orm import Session

from backend.app.logging_config import get_logger
from backend.app.models.chat_history import ChatHistory

logger = get_logger("services.chat_service")

# ── Crisis keywords for mental-health mode ──────────────────────────────
CRISIS_KEYWORDS = [
    "suicide", "suicidal", "kill myself", "end my life", "want to die",
    "self-harm", "cutting myself", "no reason to live", "overdose",
    "hurt myself", "ending it all", "don't want to live",
]

# ── Health emergency keywords ───────────────────────────────────────────
EMERGENCY_KEYWORDS = [
    "chest pain", "heart attack", "can't breathe", "breathing difficulty",
    "unconscious", "severe bleeding", "stroke", "seizure", "anaphylaxis",
    "choking",
]


def _detect_crisis(text: str) -> list[str]:
    """Return list of matched crisis keywords found in text."""
    lower = text.lower()
    return [kw for kw in CRISIS_KEYWORDS if kw in lower]


def _detect_emergency(text: str) -> list[str]:
    """Return list of matched emergency keywords found in text."""
    lower = text.lower()
    return [kw for kw in EMERGENCY_KEYWORDS if kw in lower]


def _health_response(message: str, language: str) -> dict:
    """
    Generate a health assistant response.
    Tries to use medquad_engine for medical QA, falls back to structured advice.
    """
    risk_flags = _detect_emergency(message)

    # Try ML-based medical QA
    try:
        from backend.app.ml_models.medquad_engine import get_medical_answer
        result = get_medical_answer(message)
        if result.get("confidence", 0) > 0.15:
            response_text = result["answer"]
            confidence = result["confidence"]
        else:
            response_text = _health_fallback(message)
            confidence = 0.60
    except Exception as e:
        logger.warning("medquad_engine unavailable: %s", e)
        response_text = _health_fallback(message)
        confidence = 0.60

    if risk_flags:
        response_text = (
            "🚨 **EMERGENCY ALERT**: Your symptoms suggest a potentially serious condition. "
            "Please call emergency services (112/911) immediately.\n\n"
            "While waiting for help:\n"
            "- Stay calm and rest\n"
            "- Do not exert yourself\n"
            "- Keep your phone nearby\n\n"
            f"Detected concerns: {', '.join(risk_flags)}\n\n"
            "---\n\n" + response_text
        )
        confidence = 0.95

    return {
        "response": response_text,
        "confidence": round(confidence, 2),
        "risk_flags": risk_flags,
    }


def _health_fallback(message: str) -> str:
    """Rule-based health response when ML models are unavailable."""
    lower = message.lower()

    if any(w in lower for w in ["headache", "head pain", "migraine"]):
        return (
            "Based on your description, here are some suggestions:\n\n"
            "**Possible causes:** Tension headache, migraine, dehydration, stress\n\n"
            "**Recommended actions:**\n"
            "1. Rest in a quiet, dark room\n"
            "2. Stay hydrated — drink water\n"
            "3. Consider OTC pain relief (paracetamol/ibuprofen)\n"
            "4. Apply a cold compress to your forehead\n\n"
            "⚠️ Seek medical attention if: headache is sudden and severe, "
            "accompanied by fever, stiff neck, confusion, or vision changes."
        )
    elif any(w in lower for w in ["fever", "temperature", "hot"]):
        return (
            "**Fever Management Guidance:**\n\n"
            "1. Monitor your temperature every 4 hours\n"
            "2. Stay well hydrated (water, clear fluids)\n"
            "3. Rest and avoid strenuous activity\n"
            "4. Consider paracetamol for comfort\n"
            "5. Wear light, breathable clothing\n\n"
            "⚠️ Seek medical attention if: fever exceeds 103°F (39.4°C), "
            "lasts more than 3 days, or is accompanied by severe symptoms."
        )
    elif any(w in lower for w in ["cold", "cough", "sore throat", "runny nose"]):
        return (
            "**Common Cold / Upper Respiratory Symptoms:**\n\n"
            "1. Get plenty of rest\n"
            "2. Drink warm fluids (tea, soup, warm water with honey)\n"
            "3. Gargle with salt water for sore throat\n"
            "4. Use a humidifier if available\n"
            "5. OTC decongestants may help\n\n"
            "⚠️ See a doctor if: symptoms worsen after 7-10 days, "
            "you have difficulty breathing, or develop a high fever."
        )
    elif any(w in lower for w in ["stomach", "nausea", "vomiting", "diarrhea"]):
        return (
            "**Gastrointestinal Symptom Guidance:**\n\n"
            "1. Stay hydrated — small sips of water or ORS\n"
            "2. Follow the BRAT diet (bananas, rice, applesauce, toast)\n"
            "3. Avoid dairy, fatty, or spicy foods\n"
            "4. Rest your stomach — eat light meals\n\n"
            "⚠️ Seek medical attention if: you see blood, have severe abdominal pain, "
            "or cannot keep fluids down for 24 hours."
        )
    elif any(w in lower for w in ["medicine", "medication", "drug", "tablet", "pill"]):
        return (
            "I can help with medication information. Please provide:\n\n"
            "1. The name of the medication\n"
            "2. Your existing conditions (if any)\n"
            "3. Other medications you're taking\n\n"
            "⚠️ Always consult a doctor or pharmacist before starting, "
            "stopping, or changing any medication."
        )
    else:
        return (
            "Thank you for sharing your health concern. To provide better guidance, "
            "could you please tell me:\n\n"
            "1. What specific symptoms are you experiencing?\n"
            "2. How long have you had these symptoms?\n"
            "3. On a scale of 1-10, how severe are they?\n"
            "4. Do you have any existing medical conditions?\n\n"
            "This information will help me give you more accurate advice.\n\n"
            "⚠️ *This is AI-generated health information for educational purposes only. "
            "It does not replace professional medical advice.*"
        )


def _mental_response(message: str, language: str) -> dict:
    """
    Generate a mental-health therapist response.
    Empathetic tone, crisis detection, escalation flags.
    """
    risk_flags = _detect_crisis(message)

    # Try ML-based emotion analysis
    try:
        from backend.app.ml_models.mental_engine import analyze_mental_state
        analysis = analyze_mental_state(message)
        emotion = analysis.get("emotion", "neutral")
        ml_confidence = analysis.get("confidence", 0.5)
    except Exception as e:
        logger.warning("mental_engine unavailable: %s", e)
        emotion = "unknown"
        ml_confidence = 0.5

    # Crisis response takes priority
    if risk_flags:
        response_text = (
            "🆘 **I hear you, and I want you to know that you matter.**\n\n"
            "What you're feeling right now is temporary, even though it may not feel that way. "
            "Please reach out to someone who can help:\n\n"
            "📞 **Crisis Helplines:**\n"
            "- 🇮🇳 India: iCall — 9152987821\n"
            "- 🇮🇳 Vandrevala Foundation — 1860-2662-345\n"
            "- 🇺🇸 USA: 988 Suicide & Crisis Lifeline — dial 988\n"
            "- 🌍 International: findahelpline.com\n\n"
            "You are not alone. Someone cares about you right now. 💙"
        )
        confidence = 0.98
    elif emotion in ["sadness", "depression"]:
        response_text = (
            "I can sense you're going through a difficult time, and I appreciate you "
            "sharing this with me. 💙\n\n"
            "It's completely okay to feel sad. Here are some things that might help:\n\n"
            "1. **Talk to someone** — a friend, family member, or counselor\n"
            "2. **Practice self-care** — eat well, sleep enough, move your body\n"
            "3. **Be gentle with yourself** — you don't have to have it all figured out\n"
            "4. **Journal your thoughts** — writing can help process emotions\n\n"
            "Would you like to tell me more about what's been on your mind?"
        )
        confidence = round(ml_confidence, 2)
    elif emotion in ["anger"]:
        response_text = (
            "I understand you're feeling frustrated or angry. Those are valid emotions. 🧡\n\n"
            "**Some techniques that may help:**\n\n"
            "1. **Deep breathing** — inhale for 4 counts, hold 4, exhale 4\n"
            "2. **Physical activity** — even a short walk can help\n"
            "3. **Step back** — give yourself space before reacting\n"
            "4. **Name your triggers** — understanding what upsets you gives you power\n\n"
            "Would you like to talk about what's causing these feelings?"
        )
        confidence = round(ml_confidence, 2)
    elif emotion in ["fear", "anxiety"]:
        response_text = (
            "I hear you. Anxiety and fear can feel overwhelming, but you're taking "
            "a brave step by talking about it. 💙\n\n"
            "**Grounding techniques that may help right now:**\n\n"
            "1. **5-4-3-2-1 method** — name 5 things you see, 4 you touch, 3 you hear, "
            "2 you smell, 1 you taste\n"
            "2. **Box breathing** — 4 counts in, 4 hold, 4 out, 4 hold\n"
            "3. **Progressive muscle relaxation** — tense and release each muscle group\n\n"
            "Would you like to explore what's triggering your anxiety?"
        )
        confidence = round(ml_confidence, 2)
    else:
        response_text = (
            "Thank you for reaching out. I'm here to listen and support you. 💙\n\n"
            "How are you feeling right now? Take your time — there's no rush.\n\n"
            "I can help with:\n"
            "- Understanding your emotions\n"
            "- Coping strategies for stress, anxiety, or sadness\n"
            "- Mindfulness and relaxation techniques\n"
            "- When to seek professional support\n\n"
            "Whatever you're going through, you don't have to face it alone."
        )
        confidence = 0.65

    return {
        "response": response_text,
        "confidence": confidence,
        "risk_flags": risk_flags,
    }


def process_chat(
    db: Session,
    user_id: int,
    message: str,
    mode: str,
    language: str = "en",
    session_id: str | None = None,
) -> dict:
    """
    Process a chat message in the specified mode and store history.

    Args:
        db: Database session
        user_id: Authenticated user ID
        message: User's message text
        mode: 'health' or 'mental'
        language: Response language code
        session_id: Optional session grouping ID

    Returns:
        Chat response dict with success, mode, response, confidence, risk_flags
    """
    if not session_id:
        session_id = str(uuid.uuid4())

    # Store user message
    user_entry = ChatHistory(
        user_id=user_id,
        role="user",
        content=message,
        session_id=session_id,
        metadata_={"mode": mode, "language": language},
    )
    db.add(user_entry)

    # Generate response based on mode
    if mode == "mental":
        result = _mental_response(message, language)
    else:
        result = _health_response(message, language)

    # Store assistant response
    assistant_entry = ChatHistory(
        user_id=user_id,
        role="assistant",
        content=result["response"],
        session_id=session_id,
        metadata_={
            "mode": mode,
            "confidence": result["confidence"],
            "risk_flags": result["risk_flags"],
        },
    )
    db.add(assistant_entry)
    db.commit()

    return {
        "mode": mode,
        "response": result["response"],
        "confidence": result["confidence"],
        "risk_flags": result["risk_flags"],
        "session_id": session_id,
    }
