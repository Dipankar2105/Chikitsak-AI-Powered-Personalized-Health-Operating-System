"""
AI Response Translation Service

Translates AI-generated responses to the user's preferred language.
Supports English (en) and Hindi (hi).
"""

import logging
from typing import Dict, Any, Optional

logger = logging.getLogger(__name__)

# ─────────────────────────────────────────────────────────────────────────
# Common medical/AI term translations (English → Hindi)
# ─────────────────────────────────────────────────────────────────────────

HINDI_TRANSLATIONS: Dict[str, str] = {
    # Triage levels
    "Self-care": "स्व-देखभाल",
    "Routine": "सामान्य",
    "Urgent": "तत्काल",
    "Emergency": "आपातकालीन",

    # Risk levels
    "Low": "कम",
    "Moderate": "मध्यम",
    "High": "उच्च",
    "Very High": "बहुत उच्च",

    # Common medical terms
    "chest pain": "सीने में दर्द",
    "headache": "सिरदर्द",
    "fever": "बुखार",
    "cough": "खांसी",
    "nausea": "मतली",
    "vomiting": "उल्टी",
    "fatigue": "थकान",
    "dizziness": "चक्कर आना",
    "shortness of breath": "सांस की तकलीफ",
    "sweating": "पसीना आना",
    "body aches": "शरीर में दर्द",
    "sore throat": "गले में दर्द",
    "stomach pain": "पेट दर्द",
    "back pain": "पीठ दर्द",
    "joint pain": "जोड़ों में दर्द",
    "insomnia": "अनिद्रा",
    "anxiety": "चिंता",
    "depression": "अवसाद",
    "diabetes": "मधुमेह",
    "hypertension": "उच्च रक्तचाप",
    "heart disease": "हृदय रोग",
    "pneumonia": "निमोनिया",
    "asthma": "दमा",

    # Diagnosis-related
    "Myocardial Infarction": "दिल का दौरा (हार्ट अटैक)",
    "Angina Pectoris": "एनजाइना (सीने की तकलीफ)",
    "Gastroesophageal Reflux (GERD)": "एसिड रिफ्लक्स (GERD)",
    "Panic Attack": "पैनिक अटैक (घबराहट का दौरा)",
    "Pneumonia": "निमोनिया",
    "Migraine": "माइग्रेन (आधा सिरदर्द)",
    "Tension Headache": "तनाव सिरदर्द",
    "Influenza": "इन्फ्लूएंजा (फ्लू)",
    "Type 2 Diabetes": "टाइप 2 मधुमेह",
    "Hypothyroidism": "हाइपोथायरायडिज्म (कम थायराइड)",
    "Depression": "अवसाद (डिप्रेशन)",
    "Hypertension Crisis": "उच्च रक्तचाप संकट",

    # Recommendations
    "Consult a doctor": "डॉक्टर से परामर्श करें",
    "Seek immediate medical attention": "तुरंत चिकित्सा सहायता लें",
    "Monitor symptoms": "लक्षणों पर नज़र रखें",
    "Rest and hydrate": "आराम करें और पानी पिएं",
    "Take prescribed medication": "निर्धारित दवा लें",
    "Follow up with specialist": "विशेषज्ञ से मिलें",

    # Plan names
    "Free Plan": "मुफ्त योजना",
    "Pro Plan": "प्रो योजना",
    "Medical+ Plan": "मेडिकल+ योजना",

    # UI phrases
    "Analysis complete": "विश्लेषण पूर्ण",
    "Risk Score": "जोखिम स्कोर",
    "Health Score": "स्वास्थ्य स्कोर",
    "Symptom Contributions": "लक्षणों का योगदान",
    "Differential Diagnosis": "विभेदक निदान",
    "Medical References": "चिकित्सा संदर्भ",
    "Recommendations": "सिफारिशें",
    "Contributing Factors": "योगदान करने वाले कारक",
    "Modifiable Factors": "परिवर्तनीय कारक",
}

# Template sentences for Hindi AI responses
HINDI_TEMPLATES = {
    "diagnosis_intro": "आपके लक्षणों के आधार पर, सबसे संभावित स्थिति {diagnosis} हो सकती है।",
    "confidence": "AI का विश्वास स्तर: {confidence}%",
    "triage": "देखभाल का स्तर: {level}",
    "risk_score": "जोखिम मूल्यांकन: {score_name} → {risk_level}",
    "recommendation": "सिफारिश: {rec}",
    "follow_up": "अनुवर्ती प्रश्न: {question}",
    "health_score": "आपका स्वास्थ्य स्कोर: {score}/100 ({grade})",
    "risk_prediction": "{condition} का जोखिम: {level} ({percentage}%)",
    "disclaimer": "⚕️ यह AI-आधारित मूल्यांकन है। कृपया पेशेवर चिकित्सा सलाह के लिए डॉक्टर से मिलें।",
}


def translate_term(term: str, language: str = "en") -> str:
    """Translate a single term to the target language."""
    if language == "en" or not language:
        return term
    if language == "hi":
        return HINDI_TRANSLATIONS.get(term, term)
    return term


def translate_ai_response(
    response: Dict[str, Any],
    language: str = "en",
) -> Dict[str, Any]:
    """
    Translate an AI analysis response to the user's preferred language.
    Modifies the response in-place and adds translated fields.
    """
    if language == "en" or not language or language not in ("hi",):
        return response

    translated = {**response}

    # Translate triage level
    if "triage_level" in translated:
        translated["triage_level_translated"] = translate_term(translated["triage_level"], language)

    # Translate disease prediction
    if "disease_prediction" in translated:
        translated["disease_prediction_translated"] = translate_term(translated["disease_prediction"], language)

    # Translate message
    if "message" in translated and translated.get("disease_prediction"):
        diag_hindi = translate_term(translated["disease_prediction"], language)
        translated["message_translated"] = HINDI_TEMPLATES["diagnosis_intro"].format(diagnosis=diag_hindi)

    # Translate risk levels in differential diagnosis
    if "differential_diagnosis" in translated:
        for dd in translated.get("differential_diagnosis", []):
            dd["condition_translated"] = translate_term(dd.get("condition", ""), language)
            dd["risk_level_translated"] = translate_term(dd.get("risk_level", ""), language)

    # Translate risk scores
    if "risk_scores" in translated:
        for rs in translated.get("risk_scores", []):
            rs["risk_level_translated"] = translate_term(rs.get("risk_level", ""), language)

    # Translate recommendations
    if "recommendations" in translated:
        translated["recommendations_translated"] = [
            translate_term(r, language) for r in translated.get("recommendations", [])
        ]

    # Add disclaimer
    translated["disclaimer_translated"] = HINDI_TEMPLATES["disclaimer"]

    return translated


def get_translated_template(key: str, language: str = "en", **kwargs) -> str:
    """Get a pre-formatted translated template string."""
    if language == "en" or not language:
        return ""
    if language == "hi" and key in HINDI_TEMPLATES:
        return HINDI_TEMPLATES[key].format(**kwargs)
    return ""
