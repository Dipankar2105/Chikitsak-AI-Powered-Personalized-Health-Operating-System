"""
Medication Adherence Service

Provides:
- Medication schedule management
- Missed dose detection and alerts
- Drug interaction checking
- Adherence score tracking
"""

import logging
from typing import Dict, Any, List, Optional
from datetime import datetime, timedelta

logger = logging.getLogger(__name__)

# ─────────────────────────────────────────────────────────────────────────
# Drug Interaction Database (curated subset)
# ─────────────────────────────────────────────────────────────────────────

DRUG_INTERACTIONS: Dict[str, Dict[str, Dict[str, str]]] = {
    "warfarin": {
        "aspirin": {"severity": "high", "effect": "Increased bleeding risk. Use together only under close medical supervision."},
        "ibuprofen": {"severity": "high", "effect": "NSAIDs increase bleeding risk with warfarin. Avoid combination."},
        "metformin": {"severity": "low", "effect": "Minimal interaction. Monitor INR."},
        "amoxicillin": {"severity": "moderate", "effect": "Antibiotics may alter warfarin metabolism. Monitor INR closely."},
    },
    "metformin": {
        "alcohol": {"severity": "high", "effect": "Alcohol increases lactic acidosis risk with metformin. Limit alcohol."},
        "lisinopril": {"severity": "low", "effect": "Generally safe combination, commonly co-prescribed."},
        "ibuprofen": {"severity": "moderate", "effect": "NSAIDs may reduce kidney function, affecting metformin clearance."},
    },
    "lisinopril": {
        "potassium": {"severity": "moderate", "effect": "ACE inhibitors raise potassium. Avoid potassium supplements."},
        "spironolactone": {"severity": "high", "effect": "Both raise potassium. Risk of hyperkalemia. Monitor closely."},
        "ibuprofen": {"severity": "moderate", "effect": "NSAIDs reduce ACE inhibitor effectiveness and worsen kidney function."},
    },
    "atorvastatin": {
        "grapefruit": {"severity": "moderate", "effect": "Grapefruit inhibits statin metabolism, increasing side effect risk."},
        "amiodarone": {"severity": "high", "effect": "Increased risk of rhabdomyolysis. Reduce statin dose."},
        "erythromycin": {"severity": "high", "effect": "CYP3A4 inhibitor increases statin levels. Risk of myopathy."},
    },
    "amlodipine": {
        "simvastatin": {"severity": "moderate", "effect": "Amlodipine increases simvastatin levels. Limit simvastatin to 20mg."},
        "lisinopril": {"severity": "low", "effect": "Commonly co-prescribed for hypertension. Safe combination."},
    },
    "omeprazole": {
        "clopidogrel": {"severity": "high", "effect": "Omeprazole reduces clopidogrel effectiveness. Use pantoprazole instead."},
        "metformin": {"severity": "low", "effect": "May decrease vitamin B12 absorption long-term."},
        "iron": {"severity": "moderate", "effect": "PPIs reduce iron absorption. Take iron 2hrs before PPI."},
    },
    "sertraline": {
        "tramadol": {"severity": "high", "effect": "Serotonin syndrome risk. Avoid combination."},
        "ibuprofen": {"severity": "moderate", "effect": "SSRIs + NSAIDs increase GI bleeding risk."},
        "warfarin": {"severity": "moderate", "effect": "SSRIs may increase warfarin effect. Monitor INR."},
    },
}


def check_drug_interactions(medications: List[str]) -> List[Dict[str, Any]]:
    """
    Check for interactions between a list of medications.

    Returns list of detected interactions with severity and advice.
    """
    interactions = []
    meds_lower = [m.strip().lower() for m in medications]

    for i, med1 in enumerate(meds_lower):
        for j, med2 in enumerate(meds_lower):
            if i >= j:
                continue
            # Check both directions
            interaction = None
            if med1 in DRUG_INTERACTIONS and med2 in DRUG_INTERACTIONS[med1]:
                interaction = DRUG_INTERACTIONS[med1][med2]
                drug_a, drug_b = medications[i], medications[j]
            elif med2 in DRUG_INTERACTIONS and med1 in DRUG_INTERACTIONS[med2]:
                interaction = DRUG_INTERACTIONS[med2][med1]
                drug_a, drug_b = medications[j], medications[i]

            if interaction:
                interactions.append({
                    "drug_a": drug_a,
                    "drug_b": drug_b,
                    "severity": interaction["severity"],
                    "effect": interaction["effect"],
                    "action": (
                        "Avoid this combination" if interaction["severity"] == "high" else
                        "Use with caution, monitor closely" if interaction["severity"] == "moderate" else
                        "Generally safe, routine monitoring"
                    ),
                })

    return interactions


def create_medication_schedule(
    medications: List[Dict[str, Any]],
) -> Dict[str, Any]:
    """
    Create a daily medication schedule with reminders.

    Input format: [{"name": "Metformin", "dose": "500mg", "frequency": "twice_daily", "time_preference": "morning"}]
    """
    schedule = {"morning": [], "afternoon": [], "evening": [], "bedtime": []}

    freq_map = {
        "once_daily": ["morning"],
        "twice_daily": ["morning", "evening"],
        "thrice_daily": ["morning", "afternoon", "evening"],
        "four_times_daily": ["morning", "afternoon", "evening", "bedtime"],
        "at_bedtime": ["bedtime"],
        "with_meals": ["morning", "afternoon", "evening"],
    }

    for med in medications:
        name = med.get("name", "Unknown")
        dose = med.get("dose", "")
        freq = med.get("frequency", "once_daily")
        pref = med.get("time_preference")

        times = freq_map.get(freq, ["morning"])
        if pref and pref in schedule:
            times = [pref]

        for time_slot in times:
            schedule[time_slot].append({
                "medication": name,
                "dose": dose,
                "instructions": med.get("instructions", "Take as directed"),
            })

    # Remove empty slots
    schedule = {k: v for k, v in schedule.items() if v}

    return {
        "schedule": schedule,
        "total_daily_medications": sum(len(v) for v in schedule.values()),
        "reminder_times": {
            "morning": "08:00 AM",
            "afternoon": "01:00 PM",
            "evening": "06:00 PM",
            "bedtime": "10:00 PM",
        },
    }


def calculate_adherence_score(
    total_doses_scheduled: int,
    doses_taken: int,
    doses_on_time: int,
) -> Dict[str, Any]:
    """Calculate medication adherence score."""
    if total_doses_scheduled == 0:
        return {"adherence_score": 100, "status": "No medications scheduled", "rating": "N/A"}

    adherence_pct = round((doses_taken / total_doses_scheduled) * 100, 1)
    on_time_pct = round((doses_on_time / max(doses_taken, 1)) * 100, 1)

    # Weighted score: 70% taking + 30% timing
    score = round(adherence_pct * 0.7 + on_time_pct * 0.3, 1)

    if score >= 90:
        rating = "Excellent"
        status = "Great adherence! Keep it up."
    elif score >= 75:
        rating = "Good"
        status = "Good adherence. Try to improve timing consistency."
    elif score >= 50:
        rating = "Fair"
        status = "Several missed doses detected. Consider setting reminders."
    else:
        rating = "Poor"
        status = "Many missed doses. Speak with your doctor about adherence strategies."

    return {
        "adherence_score": score,
        "doses_taken_pct": adherence_pct,
        "on_time_pct": on_time_pct,
        "rating": rating,
        "status": status,
        "missed_doses": total_doses_scheduled - doses_taken,
    }


def get_missed_dose_advice(medication: str, hours_late: float) -> Dict[str, str]:
    """Advice for a missed dose based on how late it is."""
    if hours_late < 2:
        return {
            "action": "Take it now",
            "advice": f"Take your {medication} now. It's only {hours_late:.0f} hour(s) late.",
            "severity": "low",
        }
    elif hours_late < 6:
        return {
            "action": "Take it now, but adjust next dose",
            "advice": f"Take your {medication} now and adjust the next dose timing to maintain spacing.",
            "severity": "moderate",
        }
    elif hours_late < 12:
        return {
            "action": "Skip and resume schedule",
            "advice": f"Skip this dose of {medication} and take the next one at the regular time. Do NOT double up.",
            "severity": "moderate",
        }
    else:
        return {
            "action": "Resume at next scheduled time",
            "advice": f"Resume {medication} at your next scheduled time. Never take a double dose.",
            "severity": "high",
        }
