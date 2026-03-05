import os

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../../"))
MODEL_PATH = os.path.join(BASE_DIR, "backend", "app", "ml_models", "mental_model.pkl")

_vectorizer = None
_model = None

# ─────────────────────────────────────────────────────────────────────
# Therapeutic Response Templates
# ─────────────────────────────────────────────────────────────────────

CBT_SUGGESTIONS = {
    "sadness": [
        "Try the '3 Good Things' exercise — write down 3 positive things that happened today, no matter how small.",
        "Practice behavioral activation: do one small activity you used to enjoy, even for 5 minutes.",
        "Challenge negative thoughts: ask yourself 'What evidence supports this thought? What evidence contradicts it?'",
    ],
    "depression": [
        "Start with micro-goals: instead of 'clean the house,' try 'put one item away.'",
        "Use a thought record: write the negative thought, the emotion it causes, and one balanced alternative thought.",
        "Schedule one pleasant activity today — a short walk, listening to a favorite song, or calling a friend.",
    ],
    "anger": [
        "Try the STOP technique: Stop, Take a breath, Observe your feelings, Proceed with awareness.",
        "Use the '10-second rule' — count to 10 slowly before responding when you feel anger rising.",
        "Practice perspective-taking: imagine the situation from the other person's point of view.",
    ],
    "fear": [
        "Try grounding: name 5 things you see, 4 you hear, 3 you touch, 2 you smell, 1 you taste.",
        "Practice gradual exposure: face what you fear in small, manageable steps.",
        "Challenge catastrophic thinking: ask 'What is the most likely outcome?' vs 'What am I afraid will happen?'",
    ],
    "anxiety": [
        "Try box breathing: inhale 4 seconds, hold 4, exhale 4, hold 4. Repeat 4 times.",
        "Write down your worries and rate each on a scale of 1-10. Often, writing them makes them feel smaller.",
        "Practice the 'worry window': set aside 15 minutes a day to worry, and postpone worries outside that time.",
    ],
    "joy": [
        "Practice savoring: slow down and fully experience this positive moment.",
        "Share your joy with someone — positive emotions grow when shared.",
        "Write down what contributed to this feeling so you can recreate it.",
    ],
    "surprise": [
        "Take a moment to process the unexpected event before reacting.",
        "Practice mindful observation: notice your body's response to surprise.",
        "Journal about the experience to integrate it into your understanding.",
    ],
    "love": [
        "Express gratitude to the people who matter to you today.",
        "Practice loving-kindness meditation: send good wishes to yourself and others.",
        "Strengthen connections through active listening and quality time.",
    ],
}

COPING_STRATEGIES = {
    "sadness": [
        "💧 Stay hydrated and eat regular meals — physical needs affect mood.",
        "🚶 Take a 10-minute walk outside — movement and sunlight can help.",
        "📞 Reach out to one person you trust, even just to say hello.",
        "🎵 Listen to music that lifts your mood or lets you process emotions.",
    ],
    "depression": [
        "🛏️ Maintain a regular sleep schedule, even on difficult days.",
        "📝 Keep a 'done list' instead of a to-do list to see what you've accomplished.",
        "🌿 Spend 10 minutes in nature or near a window with natural light.",
        "🤝 Consider reaching out to a mental health professional — it's a sign of strength.",
    ],
    "anger": [
        "🏃 Channel energy into physical activity — walk, run, or do push-ups.",
        "🧊 Hold something cold (ice cube, cold water) to trigger the dive reflex and calm your nervous system.",
        "✍️ Write an unsent letter expressing your feelings, then tear it up.",
        "🧘 Try progressive muscle relaxation: tense and release each muscle group.",
    ],
    "fear": [
        "🫁 Slow your breathing — long exhales activate your calming nervous system.",
        "🤗 Find a safe space and remind yourself: 'I am safe right now.'",
        "📱 Call or text someone who makes you feel secure.",
        "🧸 Use a comfort object or sensory grounding technique.",
    ],
    "anxiety": [
        "🫁 Practice diaphragmatic breathing: breathe into your belly, not your chest.",
        "🧊 Splash cold water on your face to activate the vagus nerve.",
        "📋 Make a 'what I can control' vs 'what I can't control' list.",
        "🌙 Limit caffeine and screen time, especially in the evening.",
    ],
    "joy": [
        "📸 Capture this moment — take a photo or write about it.",
        "🎉 Celebrate small wins and positive moments.",
        "💝 Practice gratitude journaling to maintain positive momentum.",
    ],
    "surprise": [
        "⏸️ Take a pause to process before making decisions.",
        "📝 Journal about the experience to gain clarity.",
    ],
    "love": [
        "💌 Express appreciation to those you care about.",
        "🧘 Practice self-compassion and self-care.",
    ],
}

EMPATHETIC_RESPONSES = {
    "sadness": "I can sense you're feeling sad right now. That's a valid and important emotion. You don't have to face this alone.",
    "depression": "I hear that you're going through a really tough time. Your feelings matter, and it takes courage to express them.",
    "anger": "I understand you're feeling angry. Anger is a natural response, and it's okay to feel this way. Let's work through it together.",
    "fear": "I sense you're feeling afraid. Fear is your body's way of protecting you. Let's find ways to feel safer.",
    "anxiety": "I notice you're experiencing anxiety. This is incredibly common, and there are effective strategies to manage it.",
    "joy": "It's wonderful that you're feeling positive! Let's nurture and build on this feeling.",
    "surprise": "It sounds like something unexpected happened. Let's take a moment to process.",
    "love": "It's beautiful that you're experiencing feelings of connection and love. That's a powerful emotion.",
}


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
    """Analyze mental state from text. Returns emotion, confidence, severity."""
    if not _load_model():
        return {
            "emotion": "Unknown (Model missing)",
            "confidence": 0.0,
            "severity_level": "Low",
        }

    vec = _vectorizer.transform([text])
    prediction = _model.predict(vec)[0]
    confidence = _model.predict_proba(vec).max()

    # Severity mapping
    if prediction in ["sadness", "depression", "fear"]:
        severity = "High"
    elif prediction in ["anger", "anxiety"]:
        severity = "Moderate"
    else:
        severity = "Low"

    return {
        "emotion": prediction,
        "confidence": float(confidence),
        "severity_level": severity,
    }


def get_therapeutic_response(emotion, severity="Moderate"):
    """
    Generate a therapeutic response with CBT suggestions and coping strategies.

    Returns:
        {
            "empathetic_response": str,
            "cbt_suggestions": list[str],
            "coping_strategies": list[str],
            "conversation_prompts": list[str],
            "severity": str,
            "professional_referral": bool,
        }
    """
    emotion_lower = emotion.lower().strip()

    # Get templates or defaults
    empathetic = EMPATHETIC_RESPONSES.get(
        emotion_lower,
        "Thank you for sharing how you're feeling. Your emotions are valid, and I'm here to help."
    )

    cbt = CBT_SUGGESTIONS.get(emotion_lower, [
        "Practice mindfulness: focus on your breathing for 2 minutes.",
        "Write down your thoughts and feelings without judgment.",
        "Identify one small positive action you can take right now.",
    ])

    coping = COPING_STRATEGIES.get(emotion_lower, [
        "🫁 Practice deep breathing for 2 minutes.",
        "🚶 Take a short walk or stretch.",
        "📞 Talk to someone you trust.",
    ])

    # Conversation prompts to continue the dialogue
    conversation_prompts = [
        "Would you like to try one of these exercises together?",
        "Can you tell me more about what triggered this feeling?",
        "How long have you been feeling this way?",
        "What usually helps you feel better when you're experiencing this?",
    ]

    # Professional referral for severe states
    professional_referral = severity.lower() in ("high", "severe")

    return {
        "empathetic_response": empathetic,
        "cbt_suggestions": cbt[:3],
        "coping_strategies": coping[:4],
        "conversation_prompts": conversation_prompts[:3],
        "severity": severity,
        "professional_referral": professional_referral,
    }
