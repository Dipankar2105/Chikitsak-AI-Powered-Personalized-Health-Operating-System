"""
Preventive Health Prediction Engine

Predicts risk for 5 conditions using validated clinical algorithms:
- Type 2 Diabetes (FINDRISC adaptation)
- Hypertension (Framingham-derived)
- Heart Disease (Simplified Framingham 10-year CVD risk)
- Depression (PHQ-2/PHQ-9 proxy)
- Sleep Disorders (STOP-BANG proxy)
"""

import logging
from typing import Dict, Any, List, Optional

logger = logging.getLogger(__name__)


def _calculate_bmi(height_cm: Optional[float], weight_kg: Optional[float]) -> Optional[float]:
    if height_cm and weight_kg and height_cm > 0:
        return round(weight_kg / ((height_cm / 100) ** 2), 1)
    return None


def predict_diabetes_risk(
    age: Optional[int] = None,
    bmi: Optional[float] = None,
    activity_level: str = "moderate",
    family_history_diabetes: bool = False,
    high_bp: bool = False,
    high_glucose_history: bool = False,
    waist_cm: Optional[float] = None,
) -> Dict[str, Any]:
    """Finnish Diabetes Risk Score (FINDRISC) adaptation."""
    score = 0
    factors = []
    modifiable = []

    # Age
    if age and age >= 64:
        score += 4; factors.append(f"Age {age} (≥64)")
    elif age and age >= 55:
        score += 3; factors.append(f"Age {age} (55-64)")
    elif age and age >= 45:
        score += 2; factors.append(f"Age {age} (45-54)")

    # BMI
    if bmi and bmi >= 30:
        score += 3; factors.append(f"BMI {bmi} (obese)")
        modifiable.append("Reduce BMI below 25 through diet and exercise")
    elif bmi and bmi >= 25:
        score += 1; factors.append(f"BMI {bmi} (overweight)")
        modifiable.append("Target BMI 18.5-24.9 with gradual weight loss")

    # Waist
    if waist_cm and waist_cm > 102:
        score += 4; factors.append("Waist >102cm")
        modifiable.append("Reduce waist circumference through core exercises and diet")
    elif waist_cm and waist_cm > 94:
        score += 3; factors.append("Waist 94-102cm")

    # Activity
    if activity_level.lower() in ("sedentary", "light"):
        score += 2; factors.append(f"Low activity ({activity_level})")
        modifiable.append("Increase to 150+ min/week of moderate exercise")

    # Family history
    if family_history_diabetes:
        score += 5; factors.append("Family history of diabetes")

    # High BP
    if high_bp:
        score += 2; factors.append("History of high blood pressure")
        modifiable.append("Monitor and manage blood pressure")

    # High glucose
    if high_glucose_history:
        score += 5; factors.append("Previous high blood glucose")
        modifiable.append("Regular glucose monitoring and dietary management")

    # Risk level
    if score < 7:
        risk_level, pct = "Low", 1
        recs = ["Maintain current healthy lifestyle", "Routine screening every 3 years"]
    elif score < 12:
        risk_level, pct = "Slightly Elevated", 4
        recs = ["Increase physical activity", "Improve diet quality", "Screen every 2 years"]
    elif score < 15:
        risk_level, pct = "Moderate", 17
        recs = ["Lifestyle modification program", "Annual fasting glucose + HbA1c", "Consult endocrinologist"]
    elif score < 20:
        risk_level, pct = "High", 33
        recs = ["Intensive lifestyle intervention", "Consider metformin", "Biannual monitoring"]
    else:
        risk_level, pct = "Very High", 50
        recs = ["Immediate medical evaluation", "Comprehensive metabolic panel", "Specialist referral"]

    return {
        "condition": "Type 2 Diabetes",
        "risk_level": risk_level,
        "risk_percentage": pct,
        "score": score,
        "max_score": 26,
        "contributing_factors": factors,
        "modifiable_factors": modifiable,
        "recommendations": recs,
        "source": "Finnish Diabetes Risk Score (FINDRISC)",
    }


def predict_hypertension_risk(
    age: Optional[int] = None,
    bmi: Optional[float] = None,
    smoking: bool = False,
    family_history_htn: bool = False,
    high_sodium_diet: bool = False,
    activity_level: str = "moderate",
    alcohol_heavy: bool = False,
    existing_diabetes: bool = False,
) -> Dict[str, Any]:
    """Framingham-derived hypertension risk model."""
    score = 0
    factors = []
    modifiable = []

    if age and age >= 65:
        score += 4; factors.append(f"Age {age} (≥65)")
    elif age and age >= 55:
        score += 3; factors.append(f"Age {age} (55-64)")
    elif age and age >= 45:
        score += 2; factors.append(f"Age {age} (45-54)")

    if bmi and bmi >= 30:
        score += 3; factors.append(f"BMI {bmi} (obese)")
        modifiable.append("Weight management — target BMI <25")
    elif bmi and bmi >= 25:
        score += 2; factors.append(f"BMI {bmi} (overweight)")
        modifiable.append("Gradual weight reduction")

    if smoking:
        score += 3; factors.append("Active smoker")
        modifiable.append("Smoking cessation reduces BP within 2-4 weeks")

    if family_history_htn:
        score += 3; factors.append("Family history of hypertension")

    if high_sodium_diet:
        score += 2; factors.append("High sodium diet")
        modifiable.append("Reduce sodium to <2300mg/day (DASH diet)")

    if activity_level.lower() in ("sedentary",):
        score += 2; factors.append("Sedentary lifestyle")
        modifiable.append("30 min aerobic exercise 5 days/week")

    if alcohol_heavy:
        score += 2; factors.append("Heavy alcohol consumption")
        modifiable.append("Limit alcohol: ≤2 drinks/day men, ≤1 drink/day women")

    if existing_diabetes:
        score += 2; factors.append("Existing diabetes")

    if score < 5:
        risk_level, pct = "Low", 5
    elif score < 10:
        risk_level, pct = "Moderate", 20
    elif score < 15:
        risk_level, pct = "High", 40
    else:
        risk_level, pct = "Very High", 65

    recs = ["Regular BP monitoring (home + clinic)"]
    if modifiable:
        recs.append("Focus on modifiable risk factors listed above")
    if risk_level in ("High", "Very High"):
        recs.append("Consult physician for potential pharmacotherapy")
        recs.append("DASH diet + exercise program")

    return {
        "condition": "Hypertension",
        "risk_level": risk_level,
        "risk_percentage": pct,
        "score": score,
        "max_score": 21,
        "contributing_factors": factors,
        "modifiable_factors": modifiable,
        "recommendations": recs,
        "source": "Framingham-derived Hypertension Risk",
    }


def predict_heart_disease_risk(
    age: Optional[int] = None,
    gender: Optional[str] = None,
    bmi: Optional[float] = None,
    smoking: bool = False,
    diabetes: bool = False,
    high_bp: bool = False,
    family_history_cvd: bool = False,
    high_cholesterol: bool = False,
    activity_level: str = "moderate",
) -> Dict[str, Any]:
    """Simplified Framingham 10-year CVD risk estimation."""
    score = 0
    factors = []
    modifiable = []

    # Age + Gender
    g = (gender or "").lower()
    if age:
        if g == "male":
            if age >= 65: score += 5
            elif age >= 55: score += 4
            elif age >= 45: score += 3
            elif age >= 35: score += 1
            factors.append(f"Male, age {age}")
        else:
            if age >= 65: score += 4
            elif age >= 55: score += 3
            elif age >= 45: score += 2
            factors.append(f"Female, age {age}")

    if smoking:
        score += 4; factors.append("Smoker")
        modifiable.append("Smoking cessation — reduces CVD risk by 50% within 1 year")

    if diabetes:
        score += 3; factors.append("Diabetes")
        modifiable.append("Glycemic control — target HbA1c <7%")

    if high_bp:
        score += 3; factors.append("Hypertension")
        modifiable.append("BP management — target <130/80")

    if high_cholesterol:
        score += 3; factors.append("High cholesterol")
        modifiable.append("Statin therapy, dietary changes — target LDL <100")

    if family_history_cvd:
        score += 3; factors.append("Family history of CVD")

    if bmi and bmi >= 30:
        score += 2; factors.append(f"BMI {bmi}")
        modifiable.append("Weight management")

    if activity_level.lower() == "sedentary":
        score += 2; factors.append("Sedentary")
        modifiable.append("150 min/week moderate-intensity exercise")

    if score < 5:
        risk_level, pct = "Low", 5
    elif score < 10:
        risk_level, pct = "Moderate", 15
    elif score < 15:
        risk_level, pct = "High", 30
    else:
        risk_level, pct = "Very High", 50

    return {
        "condition": "Heart Disease (10-year CVD risk)",
        "risk_level": risk_level,
        "risk_percentage": pct,
        "score": score,
        "max_score": 25,
        "contributing_factors": factors,
        "modifiable_factors": modifiable,
        "recommendations": [
            "Annual lipid panel and cardiac evaluation",
            "Mediterranean or DASH diet",
        ] + (["Cardiology referral recommended"] if risk_level in ("High", "Very High") else []),
        "source": "Simplified Framingham CVD Risk",
    }


def predict_depression_risk(
    sleep_quality: str = "fair",  # poor | fair | good
    activity_level: str = "moderate",
    social_isolation: bool = False,
    chronic_pain: bool = False,
    family_history_depression: bool = False,
    recent_life_stress: bool = False,
    existing_conditions: Optional[List[str]] = None,
) -> Dict[str, Any]:
    """PHQ-2/PHQ-9 proxy scoring for depression risk."""
    score = 0
    factors = []
    modifiable = []

    if sleep_quality == "poor":
        score += 3; factors.append("Poor sleep quality")
        modifiable.append("Sleep hygiene: consistent schedule, dark/cool room, limit screens")
    elif sleep_quality == "fair":
        score += 1; factors.append("Fair sleep quality")

    if activity_level.lower() in ("sedentary",):
        score += 2; factors.append("Sedentary lifestyle")
        modifiable.append("Exercise 30 min/day — releases endorphins and improves mood")

    if social_isolation:
        score += 3; factors.append("Social isolation")
        modifiable.append("Regular social interaction — join groups, schedule calls with friends/family")

    if chronic_pain:
        score += 2; factors.append("Chronic pain condition")
        modifiable.append("Pain management program — may reduce depression risk")

    if family_history_depression:
        score += 2; factors.append("Family history of depression")

    if recent_life_stress:
        score += 3; factors.append("Recent major life stress")
        modifiable.append("Stress management: mindfulness, CBT, professional support")

    # Comorbidity check
    conds = [c.lower() for c in (existing_conditions or [])]
    if any(c in conds for c in ["diabetes", "heart disease", "cancer", "chronic pain"]):
        score += 2; factors.append("Chronic medical condition (comorbidity)")

    if score < 4:
        risk_level, pct = "Low", 5
    elif score < 8:
        risk_level, pct = "Moderate", 20
    elif score < 12:
        risk_level, pct = "High", 40
    else:
        risk_level, pct = "Very High", 60

    return {
        "condition": "Depression",
        "risk_level": risk_level,
        "risk_percentage": pct,
        "score": score,
        "max_score": 17,
        "contributing_factors": factors,
        "modifiable_factors": modifiable,
        "recommendations": [
            "Regular mental health check-ins",
            "Maintain social connections and daily routines",
        ] + (["Consider professional mental health evaluation"] if risk_level in ("High", "Very High") else []),
        "source": "PHQ-2/PHQ-9 Proxy Depression Risk Assessment",
    }


def predict_sleep_disorder_risk(
    bmi: Optional[float] = None,
    age: Optional[int] = None,
    gender: Optional[str] = None,
    snoring: bool = False,
    daytime_tiredness: bool = False,
    observed_apnea: bool = False,
    high_bp: bool = False,
    neck_circumference_large: bool = False,
) -> Dict[str, Any]:
    """STOP-BANG proxy for sleep disorder risk."""
    score = 0
    factors = []
    modifiable = []

    if snoring:
        score += 1; factors.append("Snoring")

    if daytime_tiredness:
        score += 1; factors.append("Daytime tiredness / fatigue")

    if observed_apnea:
        score += 1; factors.append("Observed breathing stops during sleep")

    if high_bp:
        score += 1; factors.append("High blood pressure")
        modifiable.append("Blood pressure management")

    if bmi and bmi >= 35:
        score += 1; factors.append(f"BMI {bmi} (severely obese)")
        modifiable.append("Weight reduction — even 10% loss significantly improves OSA")
    elif bmi and bmi >= 30:
        score += 1; factors.append(f"BMI {bmi} (obese)")
        modifiable.append("Weight management targeting BMI <30")

    if age and age >= 50:
        score += 1; factors.append(f"Age {age} (≥50)")

    if neck_circumference_large:
        score += 1; factors.append("Large neck circumference (>40cm)")

    g = (gender or "").lower()
    if g == "male":
        score += 1; factors.append("Male gender (higher OSA prevalence)")

    if score < 3:
        risk_level, pct = "Low", 10
    elif score < 5:
        risk_level, pct = "Moderate", 30
    else:
        risk_level, pct = "High", 60

    return {
        "condition": "Sleep Disorder (OSA)",
        "risk_level": risk_level,
        "risk_percentage": pct,
        "score": score,
        "max_score": 8,
        "contributing_factors": factors,
        "modifiable_factors": modifiable,
        "recommendations": [
            "Maintain consistent sleep schedule (7-9 hours)",
            "Sleep position: side-sleeping reduces snoring",
        ] + (["Consider sleep study (polysomnography)"] if risk_level in ("Moderate", "High") else [])
          + (["CPAP therapy evaluation"] if risk_level == "High" else []),
        "source": "STOP-BANG Sleep Apnea Risk Assessment",
    }


def predict_all_risks(
    age: Optional[int] = None,
    gender: Optional[str] = None,
    bmi: Optional[float] = None,
    height_cm: Optional[float] = None,
    weight_kg: Optional[float] = None,
    activity_level: str = "moderate",
    existing_conditions: Optional[List[str]] = None,
    family_history: Optional[List[str]] = None,
    sleep_quality: str = "fair",
    smoking: bool = False,
    alcohol_heavy: bool = False,
) -> Dict[str, Any]:
    """
    Run all 5 risk prediction models and return a comprehensive assessment.
    """
    if not bmi and height_cm and weight_kg:
        bmi = _calculate_bmi(height_cm, weight_kg)

    conds = [c.lower() for c in (existing_conditions or [])]
    fam = [f.lower() for f in (family_history or [])]

    risks = [
        predict_diabetes_risk(
            age=age, bmi=bmi, activity_level=activity_level,
            family_history_diabetes=any("diabetes" in f for f in fam),
            high_bp="hypertension" in conds,
            high_glucose_history="prediabetes" in conds or "high glucose" in conds,
        ),
        predict_hypertension_risk(
            age=age, bmi=bmi, smoking=smoking,
            family_history_htn=any("hypertension" in f or "high blood pressure" in f for f in fam),
            activity_level=activity_level, alcohol_heavy=alcohol_heavy,
            existing_diabetes="diabetes" in conds,
        ),
        predict_heart_disease_risk(
            age=age, gender=gender, bmi=bmi, smoking=smoking,
            diabetes="diabetes" in conds, high_bp="hypertension" in conds,
            family_history_cvd=any("heart" in f or "cardiac" in f or "cvd" in f for f in fam),
            high_cholesterol="cholesterol" in conds or "hyperlipidemia" in conds,
            activity_level=activity_level,
        ),
        predict_depression_risk(
            sleep_quality=sleep_quality, activity_level=activity_level,
            family_history_depression=any("depression" in f or "mental" in f for f in fam),
            existing_conditions=existing_conditions,
        ),
        predict_sleep_disorder_risk(
            bmi=bmi, age=age, gender=gender,
            high_bp="hypertension" in conds,
            daytime_tiredness="fatigue" in conds or "tiredness" in conds,
        ),
    ]

    # Overall health risk
    avg_pct = sum(r["risk_percentage"] for r in risks) / len(risks)
    high_risk_count = sum(1 for r in risks if r["risk_level"] in ("High", "Very High"))

    return {
        "predictions": risks,
        "overall_risk_level": "High" if high_risk_count >= 2 else ("Moderate" if avg_pct > 15 else "Low"),
        "high_risk_conditions": [r["condition"] for r in risks if r["risk_level"] in ("High", "Very High")],
        "top_recommendations": _get_top_recommendations(risks),
    }


def _get_top_recommendations(risks: List[Dict]) -> List[str]:
    """Extract top unique recommendations across all risk models."""
    all_mods = []
    for r in risks:
        if r["risk_level"] in ("Moderate", "High", "Very High"):
            all_mods.extend(r["modifiable_factors"])
    # Deduplicate while preserving order
    seen = set()
    unique = []
    for m in all_mods:
        if m not in seen:
            seen.add(m)
            unique.append(m)
    return unique[:8]
