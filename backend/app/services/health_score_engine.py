"""
AI Health Score Engine

Composite health score (0-100) with breakdown across:
- Nutrition (0-20)
- Sleep (0-20)
- Activity (0-20)
- Mental Health (0-20)
- Medical Risk (0-20)
"""

import logging
from typing import Dict, Any, List, Optional

logger = logging.getLogger(__name__)


def calculate_health_score(
    age: Optional[int] = None,
    gender: Optional[str] = None,
    bmi: Optional[float] = None,
    activity_level: str = "moderate",
    sleep_hours: float = 7.0,
    sleep_quality: str = "fair",
    diet_quality: str = "average",
    fruits_vegs_servings: int = 3,
    water_glasses: int = 6,
    stress_level: str = "moderate",
    mood: str = "neutral",
    social_connection: str = "moderate",
    smoking: bool = False,
    alcohol_heavy: bool = False,
    existing_conditions: Optional[List[str]] = None,
    recent_checkup: bool = False,
    medications_adherent: bool = True,
) -> Dict[str, Any]:
    """
    Calculate composite health score with dimensional breakdown.

    Returns:
        {
            "total_score": int (0-100),
            "grade": str,
            "breakdown": {
                "nutrition": {"score": int, "max": 20, "factors": list},
                "sleep": {"score": int, "max": 20, "factors": list},
                "activity": {"score": int, "max": 20, "factors": list},
                "mental_health": {"score": int, "max": 20, "factors": list},
                "medical_risk": {"score": int, "max": 20, "factors": list},
            },
            "top_improvements": list[str],
        }
    """

    # ── Nutrition Score (0-20) ─────────────────────────────────────────
    nutrition = 10  # baseline
    nut_factors = []

    if diet_quality == "good":
        nutrition += 6; nut_factors.append("Good diet quality (+6)")
    elif diet_quality == "poor":
        nutrition -= 5; nut_factors.append("Poor diet quality (-5)")
    else:
        nut_factors.append("Average diet (baseline)")

    if fruits_vegs_servings >= 5:
        nutrition += 4; nut_factors.append(f"{fruits_vegs_servings} servings fruits/veg (+4)")
    elif fruits_vegs_servings >= 3:
        nutrition += 2; nut_factors.append(f"{fruits_vegs_servings} servings fruits/veg (+2)")
    else:
        nutrition -= 2; nut_factors.append(f"Low fruit/veg intake (-2)")

    if water_glasses >= 8:
        nutrition += 2; nut_factors.append(f"{water_glasses} glasses water (+2)")
    elif water_glasses < 4:
        nutrition -= 2; nut_factors.append("Low water intake (-2)")

    if bmi and bmi >= 30:
        nutrition -= 3; nut_factors.append(f"BMI {bmi} — obesity risk (-3)")
    elif bmi and bmi >= 25:
        nutrition -= 1; nut_factors.append(f"BMI {bmi} — overweight (-1)")

    nutrition = max(0, min(20, nutrition))

    # ── Sleep Score (0-20) ─────────────────────────────────────────────
    sleep = 10
    sleep_factors = []

    if 7 <= sleep_hours <= 9:
        sleep += 6; sleep_factors.append(f"{sleep_hours}h sleep — optimal (+6)")
    elif 6 <= sleep_hours < 7:
        sleep += 2; sleep_factors.append(f"{sleep_hours}h sleep — adequate (+2)")
    elif sleep_hours < 6:
        sleep -= 5; sleep_factors.append(f"{sleep_hours}h sleep — insufficient (-5)")
    else:
        sleep -= 2; sleep_factors.append(f"{sleep_hours}h sleep — excessive (-2)")

    if sleep_quality == "good":
        sleep += 4; sleep_factors.append("Good sleep quality (+4)")
    elif sleep_quality == "poor":
        sleep -= 4; sleep_factors.append("Poor sleep quality (-4)")

    sleep = max(0, min(20, sleep))

    # ── Activity Score (0-20) ──────────────────────────────────────────
    activity = 10
    act_factors = []
    al = activity_level.lower()

    if al in ("active", "very_active"):
        activity += 8; act_factors.append(f"Activity: {al} (+8)")
    elif al == "moderate":
        activity += 4; act_factors.append("Moderate activity (+4)")
    elif al == "light":
        act_factors.append("Light activity (baseline)")
    else:
        activity -= 5; act_factors.append("Sedentary lifestyle (-5)")

    if smoking:
        activity -= 4; act_factors.append("Smoking (-4)")

    activity = max(0, min(20, activity))

    # ── Mental Health Score (0-20) ─────────────────────────────────────
    mental = 10
    mental_factors = []

    stress_map = {"low": 4, "moderate": 0, "high": -4, "very_high": -6}
    s = stress_map.get(stress_level.lower(), 0)
    mental += s
    mental_factors.append(f"Stress: {stress_level} ({'+' if s >= 0 else ''}{s})")

    mood_map = {"positive": 4, "neutral": 2, "negative": -3, "very_negative": -6}
    m = mood_map.get(mood.lower(), 0)
    mental += m
    mental_factors.append(f"Mood: {mood} ({'+' if m >= 0 else ''}{m})")

    social_map = {"strong": 3, "moderate": 1, "weak": -2, "isolated": -4}
    sc = social_map.get(social_connection.lower(), 0)
    mental += sc
    mental_factors.append(f"Social connection: {social_connection} ({'+' if sc >= 0 else ''}{sc})")

    if alcohol_heavy:
        mental -= 3; mental_factors.append("Heavy alcohol use (-3)")

    mental = max(0, min(20, mental))

    # ── Medical Risk Score (0-20) ──────────────────────────────────────
    medical = 16  # Start high, deduct for risks
    med_factors = []

    conds = existing_conditions or []
    if len(conds) == 0:
        med_factors.append("No chronic conditions (+0)")
    elif len(conds) == 1:
        medical -= 3; med_factors.append(f"1 chronic condition: {conds[0]} (-3)")
    elif len(conds) == 2:
        medical -= 5; med_factors.append(f"2 chronic conditions (-5)")
    else:
        medical -= 8; med_factors.append(f"{len(conds)} chronic conditions (-8)")

    if recent_checkup:
        medical += 2; med_factors.append("Recent health checkup (+2)")
    else:
        medical -= 2; med_factors.append("No recent checkup (-2)")

    if medications_adherent and len(conds) > 0:
        medical += 2; med_factors.append("Medication adherent (+2)")
    elif not medications_adherent and len(conds) > 0:
        medical -= 3; med_factors.append("Medication non-adherent (-3)")

    if age and age > 60:
        medical -= 2; med_factors.append(f"Age {age} — increased risk (-2)")

    medical = max(0, min(20, medical))

    # ── Total Score ────────────────────────────────────────────────────
    total = nutrition + sleep + activity + mental + medical

    # Grade
    if total >= 85:
        grade = "A — Excellent"
    elif total >= 70:
        grade = "B — Good"
    elif total >= 55:
        grade = "C — Fair"
    elif total >= 40:
        grade = "D — Below Average"
    else:
        grade = "F — Needs Attention"

    breakdown = {
        "nutrition": {"score": nutrition, "max": 20, "factors": nut_factors},
        "sleep": {"score": sleep, "max": 20, "factors": sleep_factors},
        "activity": {"score": activity, "max": 20, "factors": act_factors},
        "mental_health": {"score": mental, "max": 20, "factors": mental_factors},
        "medical_risk": {"score": medical, "max": 20, "factors": med_factors},
    }

    # Top improvements
    improvements = []
    dims = sorted(breakdown.items(), key=lambda x: x[1]["score"])
    for name, data in dims[:3]:
        if data["score"] < 14:
            improvements.append(f"Improve {name.replace('_', ' ')}: currently {data['score']}/20")

    return {
        "total_score": total,
        "grade": grade,
        "breakdown": breakdown,
        "top_improvements": improvements,
    }
