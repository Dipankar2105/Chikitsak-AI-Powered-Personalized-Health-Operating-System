"""
Rural Healthcare Mode Engine

Provides:
- Offline-capable symptom triage (no ML/LLM dependency)
- Low-bandwidth optimized responses (minimal data)
- Village health worker (VHW) interface data
- Emergency escalation protocols for rural settings
"""

import logging
from typing import Dict, Any, List, Optional

logger = logging.getLogger(__name__)

# ─────────────────────────────────────────────────────────────────────────
# Offline Symptom Triage — Rule-based, no ML/network required
# ─────────────────────────────────────────────────────────────────────────

EMERGENCY_SYMPTOMS = {
    "chest_pain", "difficulty_breathing", "severe_bleeding", "unconscious",
    "seizure", "stroke_symptoms", "severe_burns", "poisoning",
    "snakebite", "severe_allergic_reaction", "high_fever_child",
    "pregnancy_bleeding", "severe_head_injury",
}

URGENT_SYMPTOMS = {
    "high_fever", "persistent_vomiting", "severe_diarrhea",
    "severe_abdominal_pain", "broken_bone", "deep_wound",
    "severe_headache", "vision_changes", "blood_in_stool",
    "blood_in_urine", "confusion", "dehydration_severe",
}

TRIAGE_RULES: List[Dict[str, Any]] = [
    # ── Emergency (Red) ────────────────────────────────────────────
    {
        "symptoms": ["chest_pain", "sweating", "arm_pain"],
        "min_match": 2,
        "condition": "Possible Heart Attack",
        "triage": "Emergency",
        "action": "Call ambulance (108) immediately. Give aspirin if available. Keep patient seated upright.",
        "vhw_action": "Call 108. Give 1 aspirin (325mg). Keep patient sitting. Monitor breathing.",
    },
    {
        "symptoms": ["difficulty_breathing", "wheezing", "cyanosis"],
        "min_match": 1,
        "condition": "Respiratory Emergency",
        "triage": "Emergency",
        "action": "Call ambulance. Sit patient upright. Give bronchodilator inhaler if available.",
        "vhw_action": "Call 108. Sit patient up. If asthma inhaler available, use it. Monitor closely.",
    },
    {
        "symptoms": ["severe_bleeding", "deep_wound"],
        "min_match": 1,
        "condition": "Severe Bleeding",
        "triage": "Emergency",
        "action": "Apply direct pressure with clean cloth. Elevate injury. Call ambulance.",
        "vhw_action": "Press clean cloth firmly on wound. Elevate if limb. Call 108. Do not remove cloth.",
    },
    {
        "symptoms": ["unconscious", "not_responding"],
        "min_match": 1,
        "condition": "Unconsciousness",
        "triage": "Emergency",
        "action": "Check breathing. Recovery position. Call ambulance immediately.",
        "vhw_action": "Check if breathing. Turn on side (recovery position). Call 108. Do NOT give water/food.",
    },
    {
        "symptoms": ["snakebite"],
        "min_match": 1,
        "condition": "Snakebite",
        "triage": "Emergency",
        "action": "Keep calm and still. Immobilize bitten limb. Rush to nearest hospital with anti-venom.",
        "vhw_action": "Keep patient STILL. Immobilize limb. Do NOT cut/suck wound. Rush to PHC/hospital.",
    },
    {
        "symptoms": ["seizure", "convulsion"],
        "min_match": 1,
        "condition": "Seizure",
        "triage": "Emergency",
        "action": "Clear area. Do not restrain. Turn on side. Time the seizure. Call if >5 minutes.",
        "vhw_action": "Clear area around patient. Turn on side. Do NOT put anything in mouth. Call 108 if >5 min.",
    },

    # ── Urgent (Orange) ────────────────────────────────────────────
    {
        "symptoms": ["high_fever", "headache", "body_aches"],
        "min_match": 2,
        "condition": "Possible Dengue/Malaria",
        "triage": "Urgent",
        "action": "Visit PHC within 24 hours. Paracetamol for fever. Oral rehydration. Blood test needed.",
        "vhw_action": "Give paracetamol (500mg). Give ORS. Take to PHC for blood test. No aspirin/ibuprofen.",
    },
    {
        "symptoms": ["severe_diarrhea", "vomiting", "dehydration"],
        "min_match": 2,
        "condition": "Dehydration / Gastroenteritis",
        "triage": "Urgent",
        "action": "Start ORS immediately. Small frequent sips. Visit PHC if not improving in 6 hours.",
        "vhw_action": "Give ORS (1 packet in 1 litre water). Small sips every 5 min. If child, take to PHC immediately.",
    },
    {
        "symptoms": ["severe_abdominal_pain", "vomiting"],
        "min_match": 2,
        "condition": "Acute Abdomen",
        "triage": "Urgent",
        "action": "Do not eat/drink. Visit hospital. May need surgery.",
        "vhw_action": "Nothing by mouth. Take to hospital. This may need surgery.",
    },
    {
        "symptoms": ["pregnancy_bleeding", "abdominal_pain"],
        "min_match": 1,
        "condition": "Pregnancy Complication",
        "triage": "Urgent",
        "action": "Lie down. Do not give any medication. Rush to hospital.",
        "vhw_action": "Keep lying down. Call 108 or take to hospital immediately. Keep warm.",
    },

    # ── Routine (Yellow) ───────────────────────────────────────────
    {
        "symptoms": ["mild_fever", "cold", "cough"],
        "min_match": 2,
        "condition": "Common Cold / Viral Infection",
        "triage": "Self-care",
        "action": "Rest, fluids, paracetamol if fever. Visit PHC if not better in 3 days.",
        "vhw_action": "Paracetamol for fever. Warm water with honey for cough. Rest. Visit PHC if no improvement in 3 days.",
    },
    {
        "symptoms": ["skin_rash", "itching"],
        "min_match": 1,
        "condition": "Skin Condition",
        "triage": "Routine",
        "action": "Keep clean and dry. Calamine lotion. Visit PHC if spreading or infected.",
        "vhw_action": "Clean with soap and water. Apply calamine if available. Visit PHC if spreading.",
    },
    {
        "symptoms": ["mild_headache"],
        "min_match": 1,
        "condition": "Headache",
        "triage": "Self-care",
        "action": "Rest in dark room. Paracetamol. Hydrate. Visit PHC if persistent >3 days.",
        "vhw_action": "Paracetamol 500mg. Rest. Drink water. If not better in 3 days, visit PHC.",
    },
]


def offline_triage(
    symptoms: List[str],
    age: Optional[int] = None,
    gender: Optional[str] = None,
    pregnant: bool = False,
) -> Dict[str, Any]:
    """
    Rule-based offline triage — works without ML models or internet.
    Designed for village health workers and rural settings.
    """
    symptoms_lower = {s.lower().strip().replace(" ", "_") for s in symptoms}

    # 1. Check for emergency symptoms
    emergency_matches = symptoms_lower & EMERGENCY_SYMPTOMS
    if emergency_matches:
        return {
            "triage_level": "Emergency",
            "color": "red",
            "message": "🚨 EMERGENCY — Call 108 immediately",
            "matched_symptoms": list(emergency_matches),
            "action": "Call ambulance (108). Do not delay. This needs immediate hospital care.",
            "vhw_action": "Call 108 NOW. Keep patient safe and comfortable until ambulance arrives.",
        }

    # 2. Check for urgent symptoms
    urgent_matches = symptoms_lower & URGENT_SYMPTOMS
    if urgent_matches:
        # Also check triage rules for specific guidance
        best_match = _find_best_rule_match(symptoms_lower)
        if best_match:
            return {
                "triage_level": "Urgent",
                "color": "orange",
                "message": f"⚠️ URGENT — Visit PHC within 24 hours",
                "condition": best_match["condition"],
                "matched_symptoms": list(urgent_matches),
                "action": best_match["action"],
                "vhw_action": best_match["vhw_action"],
            }
        return {
            "triage_level": "Urgent",
            "color": "orange",
            "message": "⚠️ Visit Primary Health Centre within 24 hours",
            "matched_symptoms": list(urgent_matches),
            "action": "Visit the nearest PHC for evaluation. Take paracetamol and ORS if needed.",
            "vhw_action": "Take patient to PHC for evaluation within 24 hours.",
        }

    # 3. Match against triage rules
    best_match = _find_best_rule_match(symptoms_lower)
    if best_match:
        return {
            "triage_level": best_match["triage"],
            "color": "green" if best_match["triage"] == "Self-care" else "yellow",
            "message": f"Possible: {best_match['condition']}",
            "condition": best_match["condition"],
            "action": best_match["action"],
            "vhw_action": best_match["vhw_action"],
        }

    # 4. Default — self-care with monitoring
    return {
        "triage_level": "Self-care",
        "color": "green",
        "message": "Monitor symptoms. Visit PHC if they worsen or persist beyond 3 days.",
        "action": "Rest, stay hydrated, take paracetamol if needed. Visit PHC if symptoms persist.",
        "vhw_action": "Advise rest and fluids. Follow up in 2 days. Visit PHC if worsening.",
    }


def _find_best_rule_match(symptoms_lower: set) -> Optional[Dict]:
    """Find the best matching triage rule."""
    best = None
    best_score = 0

    for rule in TRIAGE_RULES:
        rule_symptoms = set(rule["symptoms"])
        matches = symptoms_lower & rule_symptoms
        if len(matches) >= rule["min_match"] and len(matches) > best_score:
            best = rule
            best_score = len(matches)

    return best


def get_vhw_quick_reference() -> Dict[str, Any]:
    """
    Quick reference card for Village Health Workers.
    Essential information for offline use.
    """
    return {
        "emergency_numbers": {
            "ambulance": "108",
            "emergency": "112",
            "women_helpline": "181",
            "child_helpline": "1098",
            "poison_control": "1800-11-6117",
        },
        "ors_preparation": {
            "method": "Mix 1 ORS packet in 1 litre clean/boiled water",
            "homemade": "6 level teaspoons sugar + ½ level teaspoon salt in 1 litre clean water",
            "dosage_child": "50-100ml after each loose stool",
            "dosage_adult": "200-400ml after each loose stool",
        },
        "fever_management": {
            "paracetamol_adult": "500mg every 4-6 hours (max 4g/day)",
            "paracetamol_child": "10-15mg per kg body weight every 4-6 hours",
            "tepid_sponging": "Use lukewarm (NOT cold) water on forehead, armpits, groin",
            "danger_signs": "Fever >104°F (40°C), seizures, rash, inability to drink",
        },
        "wound_care": {
            "clean": "Wash with clean water and soap",
            "do_not": "Do NOT apply mud, oil, toothpaste, or turmeric on wounds",
            "bandage": "Cover with clean cloth. Change daily.",
            "tetanus": "Ask about tetanus vaccination at PHC",
        },
        "red_flags_children": [
            "Not feeding/drinking",
            "Persistent vomiting",
            "Convulsions/seizures",
            "Unconscious or very drowsy",
            "Severe malnutrition",
            "Fever in infant <2 months",
        ],
    }
