"""
Subscription Plan Configuration and Feature Gating

Plans: Free, Pro, Medical+
Each plan unlocks specific features/modules.
"""

import logging
from typing import Dict, Any, List, Optional
from enum import Enum

logger = logging.getLogger(__name__)


class PlanTier(str, Enum):
    FREE = "free"
    PRO = "pro"
    MEDICAL_PLUS = "medical_plus"


# ─────────────────────────────────────────────────────────────────────────
# Plan Definitions
# ─────────────────────────────────────────────────────────────────────────

PLAN_CONFIG: Dict[str, Dict[str, Any]] = {
    "free": {
        "name": "Free",
        "display_name": "Free Plan",
        "price_monthly": 0,
        "price_yearly": 0,
        "features": [
            "basic_symptom_checker",
            "health_alerts",
            "basic_chat",
            "location_health",
            "knowledge_search",
        ],
        "limits": {
            "symptom_checks_per_day": 3,
            "chat_messages_per_day": 10,
            "knowledge_searches_per_day": 5,
        },
        "description": "Basic health guidance with AI symptom checker",
        "highlights": [
            "AI Symptom Checker (3/day)",
            "Health Alerts",
            "Basic Chat (10 msgs/day)",
            "Location Health Insights",
            "Medical Knowledge Search",
        ],
    },
    "pro": {
        "name": "Pro",
        "display_name": "Pro Plan",
        "price_monthly": 499,  # INR
        "price_yearly": 4999,
        "features": [
            "basic_symptom_checker",
            "advanced_symptom_checker",
            "health_alerts",
            "basic_chat",
            "advanced_chat",
            "image_analysis",
            "lab_reports",
            "nutrition_tracking",
            "medication_tracking",
            "medication_interaction",
            "location_health",
            "knowledge_search",
            "knowledge_explain",
            "health_summary",
            "drug_info",
        ],
        "limits": {
            "symptom_checks_per_day": 20,
            "chat_messages_per_day": 100,
            "image_analyses_per_day": 5,
            "lab_reports_per_day": 5,
            "knowledge_searches_per_day": 50,
        },
        "description": "Full diagnostic suite with image analysis and lab reports",
        "highlights": [
            "Everything in Free",
            "Image Analysis (X-ray, MRI, Skin)",
            "Lab Report Scanner (PDF/Image/OCR)",
            "Nutrition Tracking",
            "Medication Safety & Interactions",
            "Health Summary Reports",
            "Drug Information",
        ],
    },
    "medical_plus": {
        "name": "Medical+",
        "display_name": "Medical+ Plan",
        "price_monthly": 999,
        "price_yearly": 9999,
        "features": [
            "basic_symptom_checker",
            "advanced_symptom_checker",
            "clinical_diagnosis",
            "health_alerts",
            "basic_chat",
            "advanced_chat",
            "image_analysis",
            "lab_reports",
            "nutrition_tracking",
            "medication_tracking",
            "medication_interaction",
            "medication_adherence",
            "location_health",
            "environmental_health",
            "knowledge_search",
            "knowledge_explain",
            "knowledge_guidelines",
            "health_summary",
            "drug_info",
            "preventive_health",
            "health_twin",
            "health_score",
            "multimodal_diagnosis",
            "population_health",
            "cdss_differential",
            "xai_explanation",
            "risk_scoring",
        ],
        "limits": {
            "symptom_checks_per_day": -1,   # unlimited
            "chat_messages_per_day": -1,
            "image_analyses_per_day": -1,
            "lab_reports_per_day": -1,
            "knowledge_searches_per_day": -1,
        },
        "description": "Complete clinical-grade AI health operating system",
        "highlights": [
            "Everything in Pro",
            "Preventive Health Prediction",
            "AI Health Twin & Simulation",
            "AI Health Score (72/100 style)",
            "Clinical Decision Support (CDSS)",
            "Explainable AI Diagnosis",
            "Risk Scoring (HEART, Wells, FINDRISC)",
            "Multimodal Diagnosis",
            "Environmental Health Insights",
            "Medication Adherence Tracking",
            "Population Health Dashboard",
            "Unlimited Everything",
        ],
    },
}

# ─────────────────────────────────────────────────────────────────────────
# Feature → Required Plan Mapping
# ─────────────────────────────────────────────────────────────────────────

FEATURE_PLAN_MAP: Dict[str, str] = {}
for plan_key, plan in PLAN_CONFIG.items():
    for feature in plan["features"]:
        # Store the LOWEST plan that has this feature
        if feature not in FEATURE_PLAN_MAP:
            FEATURE_PLAN_MAP[feature] = plan_key


def get_plans() -> List[Dict[str, Any]]:
    """Get all available plans for display."""
    return [
        {
            "id": key,
            "name": plan["display_name"],
            "price_monthly": plan["price_monthly"],
            "price_yearly": plan["price_yearly"],
            "description": plan["description"],
            "highlights": plan["highlights"],
            "limits": plan["limits"],
        }
        for key, plan in PLAN_CONFIG.items()
    ]


def get_user_plan(plan_tier: Optional[str] = None) -> Dict[str, Any]:
    """Get plan details for a user's current tier."""
    tier = plan_tier or "free"
    return PLAN_CONFIG.get(tier, PLAN_CONFIG["free"])


def check_feature_access(user_plan: str, feature: str) -> Dict[str, Any]:
    """
    Check if a user's plan allows access to a feature.

    Returns:
        {
            "allowed": bool,
            "feature": str,
            "user_plan": str,
            "required_plan": str | None,
            "upgrade_message": str | None,
        }
    """
    plan = PLAN_CONFIG.get(user_plan, PLAN_CONFIG["free"])
    allowed = feature in plan["features"]

    if allowed:
        return {
            "allowed": True,
            "feature": feature,
            "user_plan": user_plan,
            "required_plan": None,
            "upgrade_message": None,
        }

    # Find the minimum plan needed
    required = FEATURE_PLAN_MAP.get(feature, "medical_plus")
    required_name = PLAN_CONFIG.get(required, {}).get("display_name", "Medical+")

    return {
        "allowed": False,
        "feature": feature,
        "user_plan": user_plan,
        "required_plan": required,
        "upgrade_message": f"This feature requires the {required_name}. Upgrade to unlock.",
    }


def check_rate_limit(user_plan: str, feature: str, current_usage: int) -> Dict[str, Any]:
    """
    Check if user has exceeded their plan's rate limit for a feature.
    """
    plan = PLAN_CONFIG.get(user_plan, PLAN_CONFIG["free"])
    limits = plan.get("limits", {})

    # Map feature to limit key
    limit_key_map = {
        "basic_symptom_checker": "symptom_checks_per_day",
        "advanced_symptom_checker": "symptom_checks_per_day",
        "clinical_diagnosis": "symptom_checks_per_day",
        "basic_chat": "chat_messages_per_day",
        "advanced_chat": "chat_messages_per_day",
        "image_analysis": "image_analyses_per_day",
        "lab_reports": "lab_reports_per_day",
        "knowledge_search": "knowledge_searches_per_day",
        "knowledge_explain": "knowledge_searches_per_day",
    }

    limit_key = limit_key_map.get(feature)
    if not limit_key:
        return {"allowed": True, "remaining": -1}

    max_usage = limits.get(limit_key, -1)
    if max_usage == -1:
        return {"allowed": True, "remaining": -1}  # Unlimited

    remaining = max(0, max_usage - current_usage)
    return {
        "allowed": current_usage < max_usage,
        "remaining": remaining,
        "limit": max_usage,
        "upgrade_message": f"Daily limit reached ({max_usage}). Upgrade your plan for more." if remaining == 0 else None,
    }
