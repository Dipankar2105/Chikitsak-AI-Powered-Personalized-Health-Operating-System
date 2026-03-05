"""
Population Health Dashboard Engine

Provides:
- Disease trend tracking
- Outbreak detection based on symptom clustering
- Risk zone mapping
- Population-level health analytics
"""

import logging
from typing import Dict, Any, List, Optional
from datetime import datetime, timedelta
from collections import Counter

logger = logging.getLogger(__name__)

# ─────────────────────────────────────────────────────────────────────────
# Simulated Epidemiological Data (India-focused)
# In production, this would come from IDSP/IHIP/WHO feeds
# ─────────────────────────────────────────────────────────────────────────

DISEASE_TRENDS: Dict[str, Dict[str, Any]] = {
    "dengue": {
        "current_status": "active",
        "trend": "increasing",
        "weekly_cases_national": 12500,
        "high_risk_zones": ["Mumbai", "Delhi", "Chennai", "Kolkata", "Hyderabad"],
        "season": "monsoon",
        "peak_months": [7, 8, 9, 10],
        "r0": 1.8,
        "prevention": "Mosquito control, no standing water, use repellent, wear long sleeves",
        "symptoms": ["high_fever", "severe_headache", "joint_pain", "rash", "nausea"],
    },
    "malaria": {
        "current_status": "endemic",
        "trend": "stable",
        "weekly_cases_national": 8000,
        "high_risk_zones": ["Odisha", "Chhattisgarh", "Jharkhand", "Meghalaya", "Mizoram"],
        "season": "monsoon",
        "peak_months": [7, 8, 9],
        "r0": 1.5,
        "prevention": "Bed nets, indoor residual spraying, antimalarial prophylaxis in endemic areas",
        "symptoms": ["high_fever", "chills", "sweating", "headache", "body_aches"],
    },
    "covid_19": {
        "current_status": "low",
        "trend": "stable",
        "weekly_cases_national": 500,
        "high_risk_zones": ["Metro cities during waves"],
        "season": "year-round",
        "peak_months": [],
        "r0": 1.2,
        "prevention": "Vaccination, masking in crowded spaces, hand hygiene",
        "symptoms": ["fever", "cough", "fatigue", "body_aches", "loss_of_taste_smell"],
    },
    "influenza": {
        "current_status": "seasonal",
        "trend": "increasing",
        "weekly_cases_national": 5000,
        "high_risk_zones": ["Northern India in winter", "Nationwide during outbreaks"],
        "season": "winter",
        "peak_months": [11, 12, 1, 2],
        "r0": 1.3,
        "prevention": "Annual flu vaccination, hand hygiene, avoid crowded places when symptomatic",
        "symptoms": ["fever", "cough", "body_aches", "fatigue", "sore_throat"],
    },
    "typhoid": {
        "current_status": "endemic",
        "trend": "stable",
        "weekly_cases_national": 3000,
        "high_risk_zones": ["Areas with poor sanitation", "Eastern UP", "Bihar", "West Bengal"],
        "season": "monsoon",
        "peak_months": [6, 7, 8, 9],
        "r0": 1.1,
        "prevention": "Safe drinking water, hand washing, typhoid vaccination",
        "symptoms": ["sustained_fever", "abdominal_pain", "headache", "fatigue", "constipation"],
    },
    "tuberculosis": {
        "current_status": "endemic",
        "trend": "decreasing",
        "weekly_cases_national": 45000,
        "high_risk_zones": ["UP", "Bihar", "Maharashtra", "Rajasthan", "MP"],
        "season": "year-round",
        "peak_months": [],
        "r0": 1.0,
        "prevention": "BCG vaccination, DOTS treatment program, screening of contacts",
        "symptoms": ["chronic_cough", "fever", "night_sweats", "weight_loss", "hemoptysis"],
    },
    "chikungunya": {
        "current_status": "seasonal",
        "trend": "stable",
        "weekly_cases_national": 2000,
        "high_risk_zones": ["Delhi", "Karnataka", "Maharashtra", "Andhra Pradesh"],
        "season": "monsoon",
        "peak_months": [8, 9, 10],
        "r0": 1.4,
        "prevention": "Mosquito control, eliminate breeding sites, use repellent",
        "symptoms": ["high_fever", "severe_joint_pain", "rash", "headache", "muscle_pain"],
    },
}


def get_disease_trends(
    location: Optional[str] = None,
) -> Dict[str, Any]:
    """Get current disease trends, optionally filtered by location."""
    month = datetime.now().month
    trends = []

    for disease, data in DISEASE_TRENDS.items():
        # Check if currently in peak season
        in_season = month in data["peak_months"] if data["peak_months"] else True

        # Location relevance
        location_relevant = True
        if location:
            location_relevant = any(
                location.lower() in zone.lower()
                for zone in data["high_risk_zones"]
            )

        trends.append({
            "disease": disease.replace("_", " ").title(),
            "status": data["current_status"],
            "trend": data["trend"],
            "in_peak_season": in_season,
            "weekly_cases": data["weekly_cases_national"],
            "location_relevant": location_relevant,
            "prevention": data["prevention"],
            "r0": data["r0"],
        })

    # Sort: active/increasing first, then by case count
    trends.sort(key=lambda x: (
        0 if x["trend"] == "increasing" else 1,
        0 if x["status"] == "active" else 1,
        -x["weekly_cases"],
    ))

    return {
        "timestamp": datetime.now().isoformat(),
        "location": location or "National (India)",
        "trends": trends,
        "alerts": [
            t for t in trends
            if t["trend"] == "increasing" or (t["in_peak_season"] and t["location_relevant"])
        ],
    }


def detect_outbreak(
    recent_symptom_reports: List[Dict[str, Any]],
    location: Optional[str] = None,
    time_window_days: int = 7,
) -> Dict[str, Any]:
    """
    Detect potential outbreaks from symptom report clustering.

    Input: list of {"symptoms": [...], "timestamp": "...", "location": "..."}
    """
    if not recent_symptom_reports:
        return {"outbreak_detected": False, "message": "No recent reports to analyze."}

    # Count symptom occurrences
    symptom_counts = Counter()
    for report in recent_symptom_reports:
        for s in report.get("symptoms", []):
            symptom_counts[s.lower()] += 1

    # Check against known disease symptom patterns
    outbreak_signals = []

    for disease, data in DISEASE_TRENDS.items():
        disease_symptoms = set(data["symptoms"])
        matching_symptoms = {s for s in symptom_counts if s in disease_symptoms}

        if len(matching_symptoms) >= 3:
            # Calculate signal strength
            total_mentions = sum(symptom_counts[s] for s in matching_symptoms)
            signal_strength = min(1.0, total_mentions / (len(recent_symptom_reports) * 2))

            if signal_strength > 0.3:
                outbreak_signals.append({
                    "disease": disease.replace("_", " ").title(),
                    "signal_strength": round(signal_strength, 2),
                    "matching_symptoms": list(matching_symptoms),
                    "total_mentions": total_mentions,
                    "status": "high_alert" if signal_strength > 0.6 else "monitoring",
                    "recommended_action": (
                        "Investigate immediately. Alert public health authorities."
                        if signal_strength > 0.6 else
                        "Continue monitoring. Increase surveillance for these symptoms."
                    ),
                })

    outbreak_signals.sort(key=lambda x: -x["signal_strength"])

    return {
        "outbreak_detected": len(outbreak_signals) > 0,
        "total_reports_analyzed": len(recent_symptom_reports),
        "time_window_days": time_window_days,
        "location": location or "Unknown",
        "signals": outbreak_signals,
        "top_symptoms": symptom_counts.most_common(10),
    }


def get_risk_zones(
    disease: Optional[str] = None,
) -> Dict[str, Any]:
    """Get geographic risk zones for diseases."""
    if disease:
        disease_key = disease.lower().replace(" ", "_")
        data = DISEASE_TRENDS.get(disease_key)
        if data:
            return {
                "disease": disease,
                "risk_zones": data["high_risk_zones"],
                "season": data["season"],
                "prevention": data["prevention"],
            }
        return {"disease": disease, "risk_zones": [], "message": "Disease not found in tracking database."}

    # Return all risk zones
    zones = {}
    for disease_key, data in DISEASE_TRENDS.items():
        for zone in data["high_risk_zones"]:
            if zone not in zones:
                zones[zone] = []
            zones[zone].append(disease_key.replace("_", " ").title())

    return {
        "risk_zones": [
            {"location": loc, "diseases": diseases}
            for loc, diseases in sorted(zones.items())
        ],
        "total_zones": len(zones),
    }


def get_population_health_summary(
    location: Optional[str] = None,
) -> Dict[str, Any]:
    """Comprehensive population health summary for a location."""
    trends = get_disease_trends(location)
    risk_zones = get_risk_zones()

    active_diseases = [t for t in trends["trends"] if t["status"] in ("active", "endemic")]
    increasing = [t for t in trends["trends"] if t["trend"] == "increasing"]

    return {
        "location": location or "National (India)",
        "summary": {
            "total_diseases_tracked": len(DISEASE_TRENDS),
            "active_diseases": len(active_diseases),
            "increasing_trends": len(increasing),
            "total_weekly_cases": sum(t["weekly_cases"] for t in trends["trends"]),
        },
        "top_concerns": [
            {"disease": t["disease"], "trend": t["trend"], "cases": t["weekly_cases"]}
            for t in increasing[:3]
        ],
        "disease_trends": trends["trends"],
        "alerts": trends["alerts"],
        "risk_zones": risk_zones,
    }
