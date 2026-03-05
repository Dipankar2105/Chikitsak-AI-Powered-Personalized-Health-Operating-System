"""
Personal Health Twin Engine

Creates a digital health model of the user and simulates
lifestyle changes to project risk reductions.
"""

import logging
from typing import Dict, Any, List, Optional
from backend.app.services.preventive_engine import predict_all_risks, _calculate_bmi

logger = logging.getLogger(__name__)


# ─────────────────────────────────────────────────────────────────────────
# Impact coefficients: how much each lifestyle change reduces risk
# Values are multiplicative factors (0.8 = 20% risk reduction)
# ─────────────────────────────────────────────────────────────────────────

LIFESTYLE_IMPACT = {
    "weight_loss_5kg": {
        "Type 2 Diabetes": 0.72,       # 28% reduction — DPP trial
        "Hypertension": 0.80,          # 20% reduction
        "Heart Disease (10-year CVD risk)": 0.85,
        "Sleep Disorder (OSA)": 0.70,  # 30% reduction — major impact
        "Depression": 0.90,
    },
    "weight_loss_10kg": {
        "Type 2 Diabetes": 0.55,
        "Hypertension": 0.65,
        "Heart Disease (10-year CVD risk)": 0.75,
        "Sleep Disorder (OSA)": 0.50,
        "Depression": 0.85,
    },
    "increase_activity": {
        "Type 2 Diabetes": 0.75,       # 25% reduction — 150 min/wk
        "Hypertension": 0.80,
        "Heart Disease (10-year CVD risk)": 0.78,
        "Depression": 0.70,            # 30% reduction — strong evidence
        "Sleep Disorder (OSA)": 0.85,
    },
    "quit_smoking": {
        "Heart Disease (10-year CVD risk)": 0.50,  # 50% reduction within 1 year
        "Hypertension": 0.75,
        "Type 2 Diabetes": 0.85,
        "Depression": 0.90,
        "Sleep Disorder (OSA)": 0.90,
    },
    "improve_diet": {
        "Type 2 Diabetes": 0.80,
        "Hypertension": 0.78,          # DASH diet
        "Heart Disease (10-year CVD risk)": 0.82,
        "Depression": 0.85,            # Mediterranean diet evidence
        "Sleep Disorder (OSA)": 0.90,
    },
    "improve_sleep": {
        "Depression": 0.65,            # 35% reduction — CBT-I evidence
        "Heart Disease (10-year CVD risk)": 0.90,
        "Type 2 Diabetes": 0.88,
        "Hypertension": 0.88,
        "Sleep Disorder (OSA)": 0.75,
    },
    "reduce_alcohol": {
        "Hypertension": 0.80,
        "Heart Disease (10-year CVD risk)": 0.88,
        "Depression": 0.82,
        "Sleep Disorder (OSA)": 0.85,
        "Type 2 Diabetes": 0.92,
    },
    "stress_management": {
        "Depression": 0.65,
        "Hypertension": 0.85,
        "Heart Disease (10-year CVD risk)": 0.88,
        "Type 2 Diabetes": 0.90,
        "Sleep Disorder (OSA)": 0.88,
    },
}

CHANGE_DESCRIPTIONS = {
    "weight_loss_5kg": "Lose 5 kg of body weight",
    "weight_loss_10kg": "Lose 10 kg of body weight",
    "increase_activity": "Increase to 150+ min/week moderate exercise",
    "quit_smoking": "Quit smoking completely",
    "improve_diet": "Switch to DASH or Mediterranean diet",
    "improve_sleep": "Achieve 7-9 hours quality sleep nightly",
    "reduce_alcohol": "Reduce alcohol to ≤1 drink/day",
    "stress_management": "Daily stress management (meditation, CBT)",
}


def build_health_twin(
    age: Optional[int] = None,
    gender: Optional[str] = None,
    height_cm: Optional[float] = None,
    weight_kg: Optional[float] = None,
    bmi: Optional[float] = None,
    activity_level: str = "moderate",
    existing_conditions: Optional[List[str]] = None,
    family_history: Optional[List[str]] = None,
    sleep_quality: str = "fair",
    smoking: bool = False,
    alcohol_heavy: bool = False,
    diet_quality: str = "average",  # poor | average | good
) -> Dict[str, Any]:
    """
    Build a digital health twin from user data.

    Returns:
        {
            "profile": dict,
            "health_score": int (0-100),
            "risk_assessment": dict (from preventive engine),
            "improvement_roadmap": list,
        }
    """
    if not bmi and height_cm and weight_kg:
        bmi = _calculate_bmi(height_cm, weight_kg)

    # Build profile
    profile = {
        "age": age,
        "gender": gender,
        "height_cm": height_cm,
        "weight_kg": weight_kg,
        "bmi": round(bmi, 1) if bmi else None,
        "bmi_category": _bmi_category(bmi),
        "activity_level": activity_level,
        "smoking": smoking,
        "alcohol_heavy": alcohol_heavy,
        "diet_quality": diet_quality,
        "sleep_quality": sleep_quality,
        "existing_conditions": existing_conditions or [],
        "family_history": family_history or [],
    }

    # Run risk assessment
    risk_assessment = predict_all_risks(
        age=age, gender=gender, bmi=bmi,
        activity_level=activity_level,
        existing_conditions=existing_conditions,
        family_history=family_history,
        sleep_quality=sleep_quality,
        smoking=smoking,
        alcohol_heavy=alcohol_heavy,
    )

    # Calculate health score (0-100)
    health_score = _calculate_health_score(profile, risk_assessment)

    # Generate improvement roadmap
    roadmap = _generate_improvement_roadmap(profile, risk_assessment)

    return {
        "profile": profile,
        "health_score": health_score,
        "health_grade": _health_grade(health_score),
        "risk_assessment": risk_assessment,
        "improvement_roadmap": roadmap,
    }


def simulate_lifestyle_change(
    twin: Dict[str, Any],
    changes: List[str],
) -> Dict[str, Any]:
    """
    Simulate proposed lifestyle changes and project risk reductions.

    Args:
        twin: Health twin from build_health_twin()
        changes: List of change keys (e.g., ["weight_loss_5kg", "increase_activity"])

    Returns:
        {
            "current_risks": dict,
            "projected_risks": dict,
            "risk_reductions": list[dict],
            "new_health_score": int,
            "score_improvement": int,
            "timeline": str,
        }
    """
    current = twin.get("risk_assessment", {})
    current_predictions = current.get("predictions", [])
    current_score = twin.get("health_score", 50)

    projected = []
    reductions = []

    for pred in current_predictions:
        condition = pred["condition"]
        current_pct = pred["risk_percentage"]

        # Apply all changes multiplicatively
        multiplier = 1.0
        applied_changes = []
        for change in changes:
            impact = LIFESTYLE_IMPACT.get(change, {})
            if condition in impact:
                multiplier *= impact[condition]
                applied_changes.append(CHANGE_DESCRIPTIONS.get(change, change))

        new_pct = max(1, round(current_pct * multiplier))
        reduction = current_pct - new_pct

        # Recalculate risk level
        if new_pct <= 5:
            new_level = "Low"
        elif new_pct <= 20:
            new_level = "Moderate"
        elif new_pct <= 40:
            new_level = "High"
        else:
            new_level = "Very High"

        projected.append({
            **pred,
            "risk_percentage": new_pct,
            "risk_level": new_level,
        })

        if reduction > 0:
            reductions.append({
                "condition": condition,
                "current_risk": f"{current_pct}%",
                "projected_risk": f"{new_pct}%",
                "reduction": f"{reduction}%",
                "reduction_pct": round((reduction / max(current_pct, 1)) * 100),
                "contributing_changes": applied_changes,
            })

    # New health score
    avg_new_risk = sum(p["risk_percentage"] for p in projected) / max(len(projected), 1)
    score_boost = sum(r["reduction_pct"] for r in reductions) / max(len(reductions), 1) * 0.3 if reductions else 0
    new_score = min(100, int(current_score + score_boost))

    # Timeline estimate
    if any(c in changes for c in ["quit_smoking", "reduce_alcohol"]):
        timeline = "2-4 weeks for initial benefits, 6-12 months for full risk reduction"
    elif any(c in changes for c in ["weight_loss_10kg"]):
        timeline = "6-12 months with consistent effort"
    elif any(c in changes for c in ["weight_loss_5kg", "increase_activity"]):
        timeline = "3-6 months with consistent effort"
    else:
        timeline = "4-8 weeks for initial benefits"

    return {
        "changes_applied": [CHANGE_DESCRIPTIONS.get(c, c) for c in changes],
        "current_risks": {p["condition"]: f"{p['risk_percentage']}% ({p['risk_level']})" for p in current_predictions},
        "projected_risks": {p["condition"]: f"{p['risk_percentage']}% ({p['risk_level']})" for p in projected},
        "risk_reductions": reductions,
        "current_health_score": current_score,
        "new_health_score": new_score,
        "score_improvement": new_score - current_score,
        "timeline": timeline,
        "evidence_note": "Risk reductions are based on published clinical trial data (DPP, DASH, Framingham).",
    }


def _bmi_category(bmi: Optional[float]) -> str:
    if not bmi:
        return "Unknown"
    if bmi < 18.5:
        return "Underweight"
    if bmi < 25:
        return "Normal"
    if bmi < 30:
        return "Overweight"
    if bmi < 35:
        return "Obese (Class I)"
    if bmi < 40:
        return "Obese (Class II)"
    return "Obese (Class III)"


def _calculate_health_score(profile: Dict, risks: Dict) -> int:
    """Composite health score (0-100)."""
    score = 75  # Start at average

    # BMI factor
    bmi = profile.get("bmi")
    if bmi:
        if 18.5 <= bmi < 25:
            score += 10
        elif 25 <= bmi < 30:
            score -= 5
        elif bmi >= 30:
            score -= 15

    # Activity level
    al = profile.get("activity_level", "").lower()
    if al in ("active", "very_active"):
        score += 10
    elif al == "moderate":
        score += 5
    elif al == "sedentary":
        score -= 10

    # Smoking
    if profile.get("smoking"):
        score -= 15

    # Alcohol
    if profile.get("alcohol_heavy"):
        score -= 8

    # Sleep
    sq = profile.get("sleep_quality", "").lower()
    if sq == "good":
        score += 5
    elif sq == "poor":
        score -= 10

    # Diet
    dq = profile.get("diet_quality", "").lower()
    if dq == "good":
        score += 5
    elif dq == "poor":
        score -= 8

    # Risk penalty
    high_risk = len(risks.get("high_risk_conditions", []))
    score -= high_risk * 5

    return max(10, min(100, score))


def _health_grade(score: int) -> str:
    if score >= 85:
        return "A — Excellent"
    if score >= 70:
        return "B — Good"
    if score >= 55:
        return "C — Fair"
    if score >= 40:
        return "D — Below Average"
    return "F — Needs Attention"


def _generate_improvement_roadmap(profile: Dict, risks: Dict) -> List[Dict[str, Any]]:
    """Prioritized list of lifestyle changes ordered by impact."""
    roadmap = []

    # Identify which changes apply
    bmi = profile.get("bmi")
    if bmi and bmi >= 25:
        target = "weight_loss_10kg" if bmi >= 30 else "weight_loss_5kg"
        roadmap.append({
            "priority": 1,
            "change": CHANGE_DESCRIPTIONS[target],
            "key": target,
            "impact": "High",
            "conditions_improved": ["Diabetes", "Hypertension", "Heart Disease", "Sleep"],
            "evidence": "DPP trial: 7% weight loss reduced diabetes risk by 58%",
        })

    if profile.get("smoking"):
        roadmap.append({
            "priority": 1,
            "change": CHANGE_DESCRIPTIONS["quit_smoking"],
            "key": "quit_smoking",
            "impact": "Very High",
            "conditions_improved": ["Heart Disease", "Hypertension"],
            "evidence": "CVD risk drops 50% within 1 year of cessation",
        })

    if profile.get("activity_level", "").lower() in ("sedentary", "light"):
        roadmap.append({
            "priority": 2,
            "change": CHANGE_DESCRIPTIONS["increase_activity"],
            "key": "increase_activity",
            "impact": "High",
            "conditions_improved": ["All conditions"],
            "evidence": "150 min/week moderate exercise reduces CVD risk by 22% (meta-analysis)",
        })

    if profile.get("sleep_quality", "").lower() in ("poor", "fair"):
        roadmap.append({
            "priority": 2,
            "change": CHANGE_DESCRIPTIONS["improve_sleep"],
            "key": "improve_sleep",
            "impact": "Moderate",
            "conditions_improved": ["Depression", "Heart Disease", "Diabetes"],
            "evidence": "CBT-I reduces depression risk by 35% (Irwin et al., JAMA Psychiatry)",
        })

    if profile.get("diet_quality", "").lower() in ("poor", "average"):
        roadmap.append({
            "priority": 3,
            "change": CHANGE_DESCRIPTIONS["improve_diet"],
            "key": "improve_diet",
            "impact": "Moderate",
            "conditions_improved": ["Diabetes", "Hypertension", "Heart Disease"],
            "evidence": "DASH diet reduces SBP by 8-14 mmHg (DASH trial)",
        })

    if profile.get("alcohol_heavy"):
        roadmap.append({
            "priority": 2,
            "change": CHANGE_DESCRIPTIONS["reduce_alcohol"],
            "key": "reduce_alcohol",
            "impact": "Moderate",
            "conditions_improved": ["Hypertension", "Depression", "Sleep"],
            "evidence": "Reducing heavy drinking lowers SBP by 2-4 mmHg",
        })

    # Always include stress management
    roadmap.append({
        "priority": 3,
        "change": CHANGE_DESCRIPTIONS["stress_management"],
        "key": "stress_management",
        "impact": "Moderate",
        "conditions_improved": ["Depression", "Hypertension", "Heart Disease"],
        "evidence": "Mindfulness-based stress reduction lowers BP and cortisol (Goyal et al., JAMA Internal Medicine)",
    })

    roadmap.sort(key=lambda x: x["priority"])
    return roadmap
