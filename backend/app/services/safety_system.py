"""
Safety Override System — Hard-coded emergency detection and response

Detects critical medical conditions and overrides normal processing.
Ensures user safety with immediate emergency guidance and triage.
"""

import logging
from typing import Optional, Dict, Any, List, Tuple
import re

logger = logging.getLogger(__name__)


class EmergencyLevel(str):
    """Emergency severity levels."""
    NORMAL = "normal"
    URGENT = "urgent"
    EMERGENCY = "emergency"
    CRITICAL = "critical"


# Emergency detection patterns
EMERGENCY_PATTERNS = {
    # CRITICAL - Call emergency services immediately
    "cardiac": {
        "keywords": ["chest pain", "heart attack", "myocardial infarction", "mi", "cardiac arrest"],
        "level": "CRITICAL",
        "action": "CALL_EMERGENCY",
        "message": "CARDIAC EMERGENCY DETECTED. CALL EMERGENCY SERVICES IMMEDIATELY.",
    },
    "respiratory": {
        "keywords": ["can't breathe", "breathing difficulty", "severe shortness", "asthma attack", "choking"],
        "level": "CRITICAL",
        "action": "CALL_EMERGENCY",
        "message": "RESPIRATORY EMERGENCY DETECTED. CALL EMERGENCY SERVICES IMMEDIATELY.",
    },
    "neurological": {
        "keywords": ["stroke", "facial drooping", "arm weakness", "speech difficulty", "loss of consciousness", "seizure"],
        "level": "CRITICAL",
        "action": "CALL_EMERGENCY",
        "message": "NEUROLOGICAL EMERGENCY DETECTED. CALL EMERGENCY SERVICES IMMEDIATELY.",
    },
    "trauma": {
        "keywords": ["severe bleeding", "severe burn", "severe injury", "unconscious", "unresponsive"],
        "level": "CRITICAL",
        "action": "CALL_EMERGENCY",
        "message": "SEVERE TRAUMA DETECTED. CALL EMERGENCY SERVICES IMMEDIATELY.",
    },
    "anaphylaxis": {
        "keywords": ["anaphylaxis", "anaphylactic", "throat closing", "severe allergy", "epi pen"],
        "level": "CRITICAL",
        "action": "CALL_EMERGENCY",
        "message": "ANAPHYLACTIC REACTION DETECTED. USE EPIPEN IF AVAILABLE. CALL EMERGENCY SERVICES IMMEDIATELY.",
    },
    "sepsis": {
        "keywords": ["high fever", "shaking", "very high temperature", "135+", "139", "sepsis", "septic"],
        "level": "CRITICAL",
        "action": "CALL_EMERGENCY",
        "message": "CRITICAL FEVER PATTERN DETECTED. SEEK EMERGENCY CARE IMMEDIATELY.",
    },
    "poisoning": {
        "keywords": ["poison", "overdose", "toxic", "ingested", "swallowed"],
        "level": "CRITICAL",
        "action": "CALL_EMERGENCY",
        "message": "POISONING/OVERDOSE SUSPECTED. CALL POISON CONTROL OR EMERGENCY SERVICES IMMEDIATELY.",
    },
    
    # URGENT - Seek care today
    "acute_severe": {
        "keywords": ["severe pain", "severe headache", "severe abdominal", "sudden severe"],
        "level": "URGENT",
        "action": "SEEK_URGENT_CARE",
        "message": "URGENT CONDITION DETECTED. SEEK MEDICAL CARE TODAY.",
    },
    "fever_high": {
        "keywords": ["fever 102", "fever 103", "fever 104", "high fever", "temperature 102", "temperature 103"],
        "level": "URGENT",
        "action": "SEEK_URGENT_CARE",
        "message": "HIGH FEVER DETECTED. SEEK MEDICAL ATTENTION IF IT PERSISTS.",
    },
    "trauma_moderate": {
        "keywords": ["moderate bleeding", "deep cut", "possible fracture", "bad fall"],
        "level": "URGENT",
        "action": "SEEK_URGENT_CARE",
        "message": "MODERATE INJURY DETECTED. SEEK MEDICAL CARE.",
    },
    
    # MENTAL HEALTH CRISIS
    "suicidal_ideation": {
        "keywords": ["suicide", "suicidal", "kill myself", "end my life", "want to die", "overdose myself"],
        "level": "CRITICAL",
        "action": "MENTAL_HEALTH_CRISIS",
        "message": "SUICIDE RISK DETECTED. PLEASE REACH OUT TO A CRISIS HELPLINE IMMEDIATELY.",
    },
    "self_harm": {
        "keywords": ["self-harm", "hurt myself", "cut myself", "harm myself", "slash", "burn myself"],
        "level": "CRITICAL",
        "action": "MENTAL_HEALTH_CRISIS",
        "message": "SELF-HARM CRISIS DETECTED. PLEASE REACH OUT TO A CRISIS HELPLINE IMMEDIATELY.",
    },
    "severe_depression": {
        "keywords": ["severe depression", "severe anxiety", "breakdown", "can't function", "can't cope"],
        "level": "URGENT",
        "action": "SEEK_MENTAL_HEALTH_CARE",
        "message": "SEVERE MENTAL HEALTH CRISIS DETECTED. PLEASE CONTACT A MENTAL HEALTH PROFESSIONAL.",
    },
}

# RED FLAGS that elevate triage level
RED_FLAGS = {
    "infant_fever": {
        "keywords": ["baby fever", "infant fever", "newborn fever", "fever 3 month"],
        "level": "CRITICAL",
        "reason": "Fever in infants < 3 months is always critical",
    },
    "severe_dehydration": {
        "keywords": ["no urine", "haven't peed", "dry mouth", "dizziness", "confusion", "lethargy"],
        "level": "CRITICAL",
        "reason": "Signs of severe dehydration",
    },
    "persistent_vomiting": {
        "keywords": ["can't keep anything down", "vomiting everything", "can't stop vomiting"],
        "level": "URGENT",
        "reason": "Inability to keep down fluids or medication",
    },
}

# Crisis hotline information by region
CRISIS_HOTLINES = {
    "US": {
        "988_suicide_lifeline": "988 (call or text)",
        "crisis_text_line": "Text HOME to 741741",
        "nami_helpline": "1-800-950-NAMI (6264)",
    },
    "UK": {
        "samaritans": "116 123",
        "crisis_text_line": "Text SHOUT to 85258",
    },
    "INDIA": {
        "aasra": "9820466726",
        "iCall": "9152987821",
        "vandrevala_foundation": "9999 666 555",
    },
    "GLOBAL": {
        "befrienders": "https://www.befrienders.org/",
    },
}


def detect_emergency(text: str, age: Optional[int] = None, gender: Optional[str] = None) -> Dict[str, Any]:
    """
    Detect emergency conditions from user input.
    
    Args:
        text: User's message/symptoms
        age: Patient age (if known)
        gender: Patient gender
        
    Returns:
        {
            "is_emergency": bool,
            "level": "NORMAL" | "URGENT" | "CRITICAL",
            "type": str,  # e.g., "cardiac", "suicidal_ideation"
            "message": str,  # User-facing emergency message
            "action": str,  # Backend action to take
            "red_flags": List[str],  # Detected red flags
            "hotlines": Dict,  # Relevant crisis hotlines
        }
    """
    
    text_lower = text.lower()
    text_normalized = re.sub(r'[^\w\s]', '', text_lower)
    
    detected_emergencies = []
    detected_red_flags = []
    
    # Check for emergency patterns
    for emergency_type, pattern in EMERGENCY_PATTERNS.items():
        for keyword in pattern["keywords"]:
            if keyword in text_normalized:
                logger.warning("EMERGENCY DETECTED: %s (keyword: %s)", emergency_type, keyword)
                detected_emergencies.append({
                    "type": emergency_type,
                    "level": pattern["level"],
                    "message": pattern["message"],
                    "action": pattern["action"],
                    "keyword_match": keyword,
                })
                break
    
    # Check for red flags
    for flag_type, pattern in RED_FLAGS.items():
        for keyword in pattern["keywords"]:
            if keyword in text_normalized:
                logger.warning("RED FLAG: %s (keyword: %s)", flag_type, keyword)
                detected_red_flags.append({
                    "type": flag_type,
                    "reason": pattern["reason"],
                    "keyword_match": keyword,
                })
    
    # Age-specific checks
    if age is not None and age < 3:
        # Infant fever is always critical
        if any(keyword in text_normalized for keyword in ["fever", "high temperature"]):
            logger.warning("CRITICAL: Fever in infant < 3 months")
            detected_emergencies.append({
                "type": "infant_fever",
                "level": "CRITICAL",
                "message": "FEVER IN INFANTS UNDER 3 MONTHS IS A MEDICAL EMERGENCY. SEEK IMMEDIATE CARE.",
                "action": "CALL_EMERGENCY",
                "keyword_match": "infant_fever_rule",
            })
    
    # Determine highest emergency level
    if detected_emergencies:
        # Sort by emergency level (CRITICAL > URGENT > NORMAL)
        priority_order = {"CRITICAL": 0, "URGENT": 1, "NORMAL": 2}
        highest_emergency = min(detected_emergencies, key=lambda x: priority_order.get(x["level"], 3))
        
        return {
            "is_emergency": True,
            "level": highest_emergency["level"],
            "type": highest_emergency["type"],
            "message": highest_emergency["message"],
            "action": highest_emergency["action"],
            "red_flags": detected_red_flags,
            "hotlines": _get_relevant_hotlines(highest_emergency["type"]),
            "all_detections": detected_emergencies,
        }
    
    # No emergency but has red flags
    if detected_red_flags:
        return {
            "is_emergency": False,
            "level": "URGENT",
            "type": None,
            "message": f"Red flags detected: {', '.join([f['type'] for f in detected_red_flags])}",
            "action": "ELEVATED_TRIAGE",
            "red_flags": detected_red_flags,
            "hotlines": {},
            "all_detections": [],
        }
    
    # No emergency
    return {
        "is_emergency": False,
        "level": "NORMAL",
        "type": None,
        "message": None,
        "action": None,
        "red_flags": [],
        "hotlines": {},
        "all_detections": [],
    }


def _get_relevant_hotlines(emergency_type: str) -> Dict[str, Any]:
    """Get relevant crisis hotlines based on emergency type."""
    if "suicidal" in emergency_type or "self_harm" in emergency_type:
        return {
            "crisis_resources": CRISIS_HOTLINES,
            "types": ["suicide_prevention", "mental_health"],
        }
    
    return {
        "crisis_resources": {"US": CRISIS_HOTLINES["US"]},
        "types": ["emergency_services"],
    }


def format_emergency_response(emergency_detection: Dict[str, Any]) -> str:
    """Format emergency detection into user-facing message."""
    if not emergency_detection["is_emergency"]:
        return ""
    
    message = f"\n🚨 {emergency_detection['message']}\n"
    
    if emergency_detection["action"] == "CALL_EMERGENCY":
        message += "\nCall Local Emergency Services:\n"
        message += "US: 911\nUK: 999\nEU: 112\nIndia: 102/105\n"
    
    elif emergency_detection["action"] == "MENTAL_HEALTH_CRISIS":
        message += "\nMental Health Crisis Resources:\n"
        hotlines = emergency_detection.get("hotlines", {}).get("crisis_resources", {})
        for region, numbers in hotlines.items():
            message += f"\n{region}:\n"
            for service, number in numbers.items():
                message += f"  {service}: {number}\n"
    
    message += "\nDO NOT DELAY. SEEK IMMEDIATE HELP.\n"
    return message


def should_override_ai_response(emergency_detection: Dict[str, Any]) -> bool:
    """Determine if AI response should be overridden by emergency protocol."""
    return emergency_detection["is_emergency"] or emergency_detection["level"] == "URGENT"
