"""
Clinical Decision Support System (CDSS) Engine

Provides:
- Differential diagnosis ranking using Bayesian-style prevalence weighting
- Clinical risk scoring models (HEART, Wells, Diabetes, Stroke)
- Evidence-based symptom-disease association matrix
"""

import logging
from typing import Dict, Any, List, Optional

logger = logging.getLogger(__name__)

# ─────────────────────────────────────────────────────────────────────────
# Disease-Symptom Prevalence Matrix
# Each disease maps to symptoms with prevalence weight (0-1).
# Higher weight = symptom is more strongly associated.
# ─────────────────────────────────────────────────────────────────────────

DISEASE_SYMPTOM_MATRIX: Dict[str, Dict[str, float]] = {
    "Myocardial Infarction": {
        "chest_pain": 0.92, "sweating": 0.78, "nausea": 0.65, "shortness_of_breath": 0.72,
        "arm_pain": 0.55, "jaw_pain": 0.35, "fatigue": 0.45, "dizziness": 0.40,
        "vomiting": 0.30, "anxiety": 0.35,
    },
    "Angina Pectoris": {
        "chest_pain": 0.95, "shortness_of_breath": 0.60, "sweating": 0.40,
        "fatigue": 0.50, "dizziness": 0.30, "nausea": 0.25, "arm_pain": 0.35,
    },
    "Gastroesophageal Reflux (GERD)": {
        "chest_pain": 0.55, "heartburn": 0.90, "nausea": 0.60, "acid_reflux": 0.88,
        "bloating": 0.45, "vomiting": 0.30, "stomach_pain": 0.50,
    },
    "Panic Attack": {
        "chest_pain": 0.50, "sweating": 0.70, "shortness_of_breath": 0.75,
        "dizziness": 0.65, "nausea": 0.40, "anxiety": 0.95, "heart_palpitations": 0.80,
        "numbness": 0.35, "trembling": 0.50,
    },
    "Pneumonia": {
        "cough": 0.90, "fever": 0.85, "shortness_of_breath": 0.75, "chest_pain": 0.55,
        "fatigue": 0.70, "chills": 0.60, "sweating": 0.50, "wheezing": 0.35,
    },
    "Pulmonary Embolism": {
        "shortness_of_breath": 0.85, "chest_pain": 0.70, "cough": 0.35,
        "leg_swelling": 0.45, "heart_palpitations": 0.40, "sweating": 0.35,
        "dizziness": 0.30, "fever": 0.20,
    },
    "Migraine": {
        "headache": 0.95, "nausea": 0.75, "vision_problems": 0.55,
        "dizziness": 0.45, "vomiting": 0.40, "fatigue": 0.35,
    },
    "Tension Headache": {
        "headache": 0.95, "neck_pain": 0.55, "fatigue": 0.45,
        "dizziness": 0.20, "insomnia": 0.30,
    },
    "Meningitis": {
        "headache": 0.90, "fever": 0.88, "neck_stiffness": 0.85,
        "nausea": 0.60, "vomiting": 0.55, "vision_problems": 0.30,
        "dizziness": 0.40, "fatigue": 0.50, "rash": 0.25,
    },
    "Influenza": {
        "fever": 0.90, "cough": 0.80, "fatigue": 0.85, "headache": 0.70,
        "chills": 0.75, "sore_throat": 0.55, "body_aches": 0.80, "nausea": 0.30,
    },
    "COVID-19": {
        "fever": 0.80, "cough": 0.75, "fatigue": 0.70, "shortness_of_breath": 0.55,
        "loss_of_smell": 0.65, "loss_of_taste": 0.60, "headache": 0.50,
        "sore_throat": 0.45, "body_aches": 0.40, "diarrhea": 0.25,
    },
    "Asthma Exacerbation": {
        "wheezing": 0.90, "shortness_of_breath": 0.88, "cough": 0.75,
        "chest_tightness": 0.70, "fatigue": 0.35,
    },
    "Urinary Tract Infection": {
        "frequent_urination": 0.85, "burning_urination": 0.88, "lower_back_pain": 0.40,
        "fever": 0.35, "stomach_pain": 0.30, "nausea": 0.25, "chills": 0.20,
    },
    "Gastroenteritis": {
        "diarrhea": 0.90, "nausea": 0.85, "vomiting": 0.80, "stomach_pain": 0.75,
        "fever": 0.50, "fatigue": 0.45, "chills": 0.30, "bloating": 0.35,
    },
    "Appendicitis": {
        "stomach_pain": 0.92, "nausea": 0.75, "vomiting": 0.60, "fever": 0.55,
        "loss_of_appetite": 0.70, "diarrhea": 0.20, "constipation": 0.25,
    },
    "Type 2 Diabetes": {
        "frequent_urination": 0.75, "fatigue": 0.70, "weight_loss": 0.55,
        "vision_problems": 0.45, "numbness": 0.40, "dry_skin": 0.30,
        "slow_healing": 0.50, "excessive_thirst": 0.80,
    },
    "Hypothyroidism": {
        "fatigue": 0.85, "weight_gain": 0.70, "dry_skin": 0.60,
        "constipation": 0.55, "hair_loss": 0.50, "depression": 0.45,
        "cold_sensitivity": 0.65, "muscle_weakness": 0.35,
    },
    "Hyperthyroidism": {
        "weight_loss": 0.75, "heart_palpitations": 0.70, "anxiety": 0.65,
        "trembling": 0.60, "sweating": 0.70, "fatigue": 0.45,
        "insomnia": 0.55, "diarrhea": 0.30,
    },
    "Iron Deficiency Anemia": {
        "fatigue": 0.90, "dizziness": 0.65, "shortness_of_breath": 0.50,
        "headache": 0.45, "cold_sensitivity": 0.35, "hair_loss": 0.30,
        "weakness": 0.70, "heart_palpitations": 0.40,
    },
    "Deep Vein Thrombosis": {
        "leg_swelling": 0.85, "leg_pain": 0.80, "leg_redness": 0.55,
        "warmth_in_leg": 0.50, "shortness_of_breath": 0.20,
    },
    "Rheumatoid Arthritis": {
        "joint_pain": 0.92, "joint_swelling": 0.85, "stiffness": 0.80,
        "fatigue": 0.60, "fever": 0.20, "weakness": 0.35,
    },
    "Depression": {
        "fatigue": 0.80, "insomnia": 0.70, "loss_of_appetite": 0.60,
        "weight_loss": 0.35, "weight_gain": 0.30, "anxiety": 0.55,
        "headache": 0.30, "body_aches": 0.25, "depression": 0.95,
    },
    "Generalized Anxiety Disorder": {
        "anxiety": 0.95, "insomnia": 0.70, "heart_palpitations": 0.55,
        "fatigue": 0.60, "headache": 0.40, "nausea": 0.30,
        "trembling": 0.35, "sweating": 0.40, "dizziness": 0.35,
    },
    "Hypertension Crisis": {
        "headache": 0.75, "dizziness": 0.70, "vision_problems": 0.55,
        "chest_pain": 0.50, "shortness_of_breath": 0.45, "nausea": 0.40,
        "nosebleed": 0.30,
    },
    "Allergic Reaction": {
        "rash": 0.80, "itching": 0.85, "hives": 0.75, "swelling": 0.60,
        "shortness_of_breath": 0.40, "nausea": 0.25, "dizziness": 0.20,
    },
    "Costochondritis": {
        "chest_pain": 0.90, "rib_pain": 0.75, "pain_with_breathing": 0.60,
        "chest_tightness": 0.40,
    },
    "Bacterial Sinusitis": {
        "facial_pain": 0.85, "nasal_congestion": 0.90, "headache": 0.70,
        "fever": 0.40, "cough": 0.35, "decreased_smell": 0.50,
    },
    "Peptic Ulcer Disease": {
        "stomach_pain": 0.88, "nausea": 0.60, "bloating": 0.55,
        "heartburn": 0.45, "vomiting": 0.30, "weight_loss": 0.20,
    },
    "Cholecystitis (Gallstones)": {
        "stomach_pain": 0.85, "nausea": 0.75, "vomiting": 0.65,
        "fever": 0.50, "back_pain": 0.40, "jaundice": 0.25,
    },
    "Hypoglycemia": {
        "dizziness": 0.85, "sweating": 0.80, "trembling": 0.75,
        "heart_palpitations": 0.70, "hunger": 0.65, "confusion": 0.60,
        "fatigue": 0.50, "blurred_vision": 0.45,
    },
    "Chronic Obstructive Pulmonary Disease (COPD)": {
        "shortness_of_breath": 0.92, "cough": 0.85, "wheezing": 0.75,
        "chest_tightness": 0.60, "fatigue": 0.55,
    },
    "Hyperglycemia": {
        "frequent_urination": 0.85, "excessive_thirst": 0.90, "blurred_vision": 0.70,
        "fatigue": 0.65, "headache": 0.40, "nausea": 0.35,
    },
    "Anaphylaxis": {
        "shortness_of_breath": 0.95, "swelling": 0.90, "rash": 0.85,
        "itching": 0.80, "dizziness": 0.75, "nausea": 0.45, "stomach_pain": 0.35,
    },
    "Fibromyalgia": {
        "body_aches": 0.95, "fatigue": 0.90, "insomnia": 0.80,
        "headache": 0.65, "anxiety": 0.70, "depression": 0.60,
    },
    "Gout": {
        "joint_pain": 0.95, "joint_swelling": 0.90, "joint_redness": 0.85,
        "fever": 0.30,
    },
    "Kidney Stones": {
        "stomach_pain": 0.90, "back_pain": 0.85, "frequent_urination": 0.60,
        "burning_urination": 0.55, "nausea": 0.65, "vomiting": 0.50,
    },
    "Psoriasis": {
        "rash": 0.95, "itching": 0.80, "dry_skin": 0.85, "joint_pain": 0.20,
    },
    "Atopy (Eczema)": {
        "itching": 0.95, "rash": 0.92, "dry_skin": 0.88,
    },
    "Anemia (General)": {
        "fatigue": 0.90, "weakness": 0.85, "shortness_of_breath": 0.60,
        "dizziness": 0.65, "headache": 0.40, "heart_palpitations": 0.45,
    },
    "Hyperkalemia": {
        "weakness": 0.80, "nausea": 0.50, "heart_palpitations": 0.75,
        "numbness": 0.40, "muscle_cramps": 0.45,
    },
    "Hypokalemia": {
        "weakness": 0.85, "muscle_cramps": 0.80, "fatigue": 0.70,
        "constipation": 0.45, "heart_palpitations": 0.60,
    },
    "Chronic Kidney Disease": {
        "fatigue": 0.80, "swelling": 0.75, "itching": 0.60,
        "frequent_urination": 0.55, "nausea": 0.45, "stomach_pain": 0.30,
    },
    "Hepatitis": {
        "fatigue": 0.85, "stomach_pain": 0.70, "nausea": 0.75,
        "jaundice": 0.80, "loss_of_appetite": 0.75, "fever": 0.40,
    },
    "Mononucleosis": {
        "fever": 0.90, "sore_throat": 0.95, "fatigue": 0.92,
        "headache": 0.65, "body_aches": 0.70, "rash": 0.20,
    },
    "Tonsillitis": {
        "sore_throat": 0.95, "fever": 0.85, "difficulty_swallowing": 0.90,
        "headache": 0.50,
    },
    "Bronchitis (Acute)": {
        "cough": 0.95, "shortness_of_breath": 0.55, "chest_pain": 0.40,
        "fatigue": 0.60, "fever": 0.35, "wheezing": 0.45,
    },
    "Otitis Media (Ear Infection)": {
        "ear_pain": 0.95, "fever": 0.75, "dizziness": 0.40, "decreased_hearing": 0.65,
    },
    "Vertigo (BPPV)": {
        "dizziness": 0.95, "nausea": 0.70, "vomiting": 0.40, "vision_problems": 0.35,
    },
    "Malaria": {
        "fever": 0.95, "chills": 0.90, "sweating": 0.85, "headache": 0.80,
        "nausea": 0.70, "vomiting": 0.65, "fatigue": 0.75, "body_aches": 0.80,
    },
    "Dengue Fever": {
        "fever": 0.95, "headache": 0.90, "joint_pain": 0.92, "body_aches": 0.88,
        "rash": 0.75, "nausea": 0.70, "vomiting": 0.60,
    },
}

# ─────────────────────────────────────────────────────────────────────────
# Age/Gender modifiers for disease prevalence
# ─────────────────────────────────────────────────────────────────────────

AGE_MODIFIERS = {
    "Myocardial Infarction": lambda age: 1.5 if age and age > 55 else (0.7 if age and age < 35 else 1.0),
    "Meningitis": lambda age: 1.4 if age and age < 25 else 1.0,
    "Appendicitis": lambda age: 1.3 if age and 10 <= age <= 30 else 0.8,
    "Hypothyroidism": lambda age: 1.3 if age and age > 50 else 1.0,
    "Deep Vein Thrombosis": lambda age: 1.5 if age and age > 60 else 1.0,
    "Hypertension Crisis": lambda age: 1.4 if age and age > 50 else 0.8,
    "Type 2 Diabetes": lambda age: 1.4 if age and age > 45 else 0.9,
}

GENDER_MODIFIERS = {
    "Myocardial Infarction": lambda g: 1.3 if g == "male" else 0.8,
    "Urinary Tract Infection": lambda g: 1.5 if g == "female" else 0.7,
    "Hypothyroidism": lambda g: 1.4 if g == "female" else 0.8,
    "Iron Deficiency Anemia": lambda g: 1.4 if g == "female" else 0.9,
    "Deep Vein Thrombosis": lambda g: 1.2 if g == "female" else 1.0,
}


# ─────────────────────────────────────────────────────────────────────────
# Differential Diagnosis Ranking
# ─────────────────────────────────────────────────────────────────────────

def rank_differential_diagnosis(
    symptoms: List[str],
    age: Optional[int] = None,
    gender: Optional[str] = None,
    existing_conditions: Optional[List[str]] = None,
    family_history: Optional[List[str]] = None,
) -> List[Dict[str, Any]]:
    """
    Rank possible diagnoses using prevalence-weighted Bayesian-style scoring.

    Returns list of dicts sorted by probability:
        [{
            "condition": str,
            "probability": float (0-100),
            "confidence": float (0-100),
            "risk_level": "low" | "medium" | "high",
            "matching_symptoms": list[str],
            "missing_key_symptoms": list[str],
        }]
    """
    if not symptoms:
        return []

    # Normalize symptoms
    norm_symptoms = set()
    for s in symptoms:
        norm = s.strip().lower().replace(" ", "_")
        norm_symptoms.add(norm)
        # Also add space-separated version
        norm_symptoms.add(s.strip().lower())

    scores = []

    for disease, symptom_weights in DISEASE_SYMPTOM_MATRIX.items():
        # Calculate match score
        total_weight = 0.0
        matched_weight = 0.0
        matching = []
        missing_key = []

        for symptom, weight in symptom_weights.items():
            total_weight += weight
            sym_readable = symptom.replace("_", " ")
            if symptom in norm_symptoms or sym_readable in norm_symptoms:
                matched_weight += weight
                matching.append(sym_readable)
            elif weight >= 0.7:
                # Key symptom missing
                missing_key.append(sym_readable)

        if matched_weight == 0:
            continue

        # Base probability from symptom matching
        base_prob = (matched_weight / total_weight) * 100

        # Coverage bonus — more symptoms matched = higher confidence
        coverage = len(matching) / max(len(symptom_weights), 1)
        coverage_bonus = coverage * 15

        # Apply age modifier
        age_mod = AGE_MODIFIERS.get(disease, lambda a: 1.0)(age)

        # Apply gender modifier
        gender_clean = (gender or "").lower().strip()
        gender_mod = GENDER_MODIFIERS.get(disease, lambda g: 1.0)(gender_clean)

        # Family history boost
        family_boost = 1.0
        if family_history:
            family_lower = [f.lower() for f in family_history]
            disease_lower = disease.lower()
            for fh in family_lower:
                if fh in disease_lower or disease_lower in fh:
                    family_boost = 1.2
                    break
            # Check for category matches
            if any("heart" in f or "cardiac" in f for f in family_lower) and "cardial" in disease_lower:
                family_boost = 1.2
            if any("diabetes" in f for f in family_lower) and "diabetes" in disease_lower:
                family_boost = 1.25

        # Existing conditions modifier
        condition_boost = 1.0
        if existing_conditions:
            conds_lower = [c.lower() for c in existing_conditions]
            if "hypertension" in conds_lower and disease in ("Myocardial Infarction", "Hypertension Crisis"):
                condition_boost = 1.3
            if "diabetes" in conds_lower and disease == "Myocardial Infarction":
                condition_boost *= 1.2

        # Final score
        adjusted = (base_prob + coverage_bonus) * age_mod * gender_mod * family_boost * condition_boost
        adjusted = min(95.0, adjusted)  # Cap at 95%

        # Confidence based on coverage and number of symptoms
        confidence = min(95.0, coverage * 100 * 0.6 + len(matching) * 8)

        # Risk level
        if adjusted > 50:
            risk = "high"
        elif adjusted > 25:
            risk = "medium"
        else:
            risk = "low"

        scores.append({
            "condition": disease,
            "probability": round(adjusted, 1),
            "confidence": round(confidence, 1),
            "risk_level": risk,
            "matching_symptoms": matching,
            "missing_key_symptoms": missing_key[:3],
        })

    # Sort by probability descending
    scores.sort(key=lambda x: x["probability"], reverse=True)

    # Normalize top results so they roughly sum to ~100
    top = scores[:6]
    if top:
        total = sum(s["probability"] for s in top)
        if total > 0:
            for s in top:
                s["probability"] = round((s["probability"] / total) * 100, 1)

    return top


# ─────────────────────────────────────────────────────────────────────────
# Risk Scoring Models
# ─────────────────────────────────────────────────────────────────────────

def calculate_heart_score(
    age: Optional[int] = None,
    risk_factors: Optional[List[str]] = None,
    symptom_history: str = "typical",
    troponin_elevated: bool = False,
) -> Dict[str, Any]:
    """
    HEART Score for chest pain evaluation.
    Components: History, ECG, Age, Risk factors, Troponin
    Score 0-10 → Low (0-3), Moderate (4-6), High (7-10)
    """
    score = 0
    breakdown = {}

    # History (0-2)
    history_map = {"nonspecific": 0, "moderately_suspicious": 1, "typical": 2}
    h = history_map.get(symptom_history.lower(), 1)
    score += h
    breakdown["history"] = {"score": h, "max": 2, "label": symptom_history}

    # ECG — simplified (assume normal unless indicated)
    ecg = 0  # 0=normal, 1=non-specific, 2=ST deviation
    score += ecg
    breakdown["ecg"] = {"score": ecg, "max": 2, "label": "Normal (assumed)"}

    # Age (0-2)
    if age and age >= 65:
        a = 2
    elif age and age >= 45:
        a = 1
    else:
        a = 0
    score += a
    breakdown["age"] = {"score": a, "max": 2, "label": f"{age or 'Unknown'} years"}

    # Risk factors (0-2)
    rf_count = 0
    rf_list = risk_factors or []
    risk_items = ["hypertension", "diabetes", "smoking", "obesity", "hyperlipidemia",
                  "family_history_cad", "high_cholesterol"]
    for rf in rf_list:
        if rf.lower().replace(" ", "_") in risk_items or rf.lower() in [r.replace("_", " ") for r in risk_items]:
            rf_count += 1
    r = min(2, 0 if rf_count == 0 else (1 if rf_count <= 2 else 2))
    score += r
    breakdown["risk_factors"] = {"score": r, "max": 2, "label": f"{rf_count} factors"}

    # Troponin (0-2)
    t = 2 if troponin_elevated else 0
    score += t
    breakdown["troponin"] = {"score": t, "max": 2, "label": "Elevated" if troponin_elevated else "Normal"}

    # Risk stratification
    if score <= 3:
        risk_level = "Low"
        recommendation = "1.7% risk of major cardiac event. Consider discharge with follow-up."
        action = "Outpatient follow-up recommended"
    elif score <= 6:
        risk_level = "Moderate"
        recommendation = "12-17% risk. Observation and further testing recommended."
        action = "Serial troponins, ECG monitoring, consider stress test"
    else:
        risk_level = "High"
        recommendation = "50-65% risk of major cardiac event. Immediate intervention needed."
        action = "Cardiology consultation, possible catheterization"

    return {
        "score_name": "HEART Score",
        "total_score": score,
        "max_score": 10,
        "risk_level": risk_level,
        "recommendation": recommendation,
        "action": action,
        "breakdown": breakdown,
        "applicable_for": "Chest pain evaluation",
    }


def calculate_wells_score(
    clinical_signs_dvt: bool = False,
    pe_most_likely: bool = False,
    heart_rate_above_100: bool = False,
    immobilization_surgery: bool = False,
    previous_dvt_pe: bool = False,
    hemoptysis: bool = False,
    active_cancer: bool = False,
) -> Dict[str, Any]:
    """
    Wells Score for Pulmonary Embolism probability.
    Score interpretation: <2 Low, 2-6 Moderate, >6 High probability.
    """
    score = 0
    breakdown = {}

    items = [
        ("Clinical signs of DVT", clinical_signs_dvt, 3.0),
        ("PE most likely diagnosis", pe_most_likely, 3.0),
        ("Heart rate > 100", heart_rate_above_100, 1.5),
        ("Immobilization/surgery (past 4 wks)", immobilization_surgery, 1.5),
        ("Previous DVT/PE", previous_dvt_pe, 1.5),
        ("Hemoptysis", hemoptysis, 1.0),
        ("Active cancer", active_cancer, 1.0),
    ]

    for label, present, points in items:
        val = points if present else 0
        score += val
        breakdown[label] = {"present": present, "points": val}

    if score < 2:
        risk_level, prob = "Low", "< 10%"
    elif score <= 6:
        risk_level, prob = "Moderate", "20-40%"
    else:
        risk_level, prob = "High", "> 40%"

    return {
        "score_name": "Wells Score (PE)",
        "total_score": round(score, 1),
        "max_score": 12.5,
        "risk_level": risk_level,
        "probability_range": prob,
        "recommendation": f"{risk_level} probability of PE. {'D-dimer recommended.' if risk_level == 'Low' else 'CT pulmonary angiography recommended.'}",
        "breakdown": breakdown,
        "applicable_for": "Pulmonary embolism evaluation",
    }


def calculate_diabetes_risk_score(
    age: Optional[int] = None,
    bmi: Optional[float] = None,
    waist_cm: Optional[float] = None,
    activity_level: str = "moderate",
    family_diabetes: bool = False,
    high_bp_history: bool = False,
    high_glucose_history: bool = False,
) -> Dict[str, Any]:
    """
    Finnish Diabetes Risk Score (FINDRISC) adaptation.
    Predicts 10-year risk of Type 2 Diabetes.
    """
    score = 0
    breakdown = {}

    # Age
    if age:
        if age >= 64:
            a = 4
        elif age >= 55:
            a = 3
        elif age >= 45:
            a = 2
        else:
            a = 0
    else:
        a = 1
    score += a
    breakdown["age"] = {"score": a, "value": age or "Unknown"}

    # BMI
    if bmi:
        if bmi >= 30:
            b = 3
        elif bmi >= 25:
            b = 1
        else:
            b = 0
    else:
        b = 1
    score += b
    breakdown["bmi"] = {"score": b, "value": round(bmi, 1) if bmi else "Unknown"}

    # Waist circumference (simplified)
    if waist_cm:
        if waist_cm > 102:
            w = 4
        elif waist_cm > 94:
            w = 3
        else:
            w = 0
    else:
        w = 1
    score += w
    breakdown["waist"] = {"score": w, "value": waist_cm or "Unknown"}

    # Physical activity
    activity_scores = {"sedentary": 2, "light": 1, "moderate": 0, "active": 0, "very_active": 0}
    pa = activity_scores.get(activity_level.lower(), 1)
    score += pa
    breakdown["activity"] = {"score": pa, "value": activity_level}

    # Family history
    fh = 5 if family_diabetes else 0
    score += fh
    breakdown["family_history"] = {"score": fh, "present": family_diabetes}

    # High BP history
    bp = 2 if high_bp_history else 0
    score += bp
    breakdown["high_bp"] = {"score": bp, "present": high_bp_history}

    # High glucose history
    gl = 5 if high_glucose_history else 0
    score += gl
    breakdown["high_glucose"] = {"score": gl, "present": high_glucose_history}

    # Risk stratification
    if score < 7:
        risk_level = "Low"
        risk_pct = "< 1%"
        rec = "Maintain healthy lifestyle. Routine screening every 3 years."
    elif score < 12:
        risk_level = "Slightly Elevated"
        risk_pct = "4%"
        rec = "Increase physical activity, improve diet. Screen every 2 years."
    elif score < 15:
        risk_level = "Moderate"
        risk_pct = "17%"
        rec = "Lifestyle modification needed. Annual glucose screening recommended."
    elif score < 20:
        risk_level = "High"
        risk_pct = "33%"
        rec = "Intensive lifestyle intervention. Consider metformin. Biannual screening."
    else:
        risk_level = "Very High"
        risk_pct = "50%"
        rec = "Immediate medical intervention recommended. Likely prediabetic or diabetic."

    return {
        "score_name": "Diabetes Risk Score (FINDRISC)",
        "total_score": score,
        "max_score": 26,
        "risk_level": risk_level,
        "ten_year_risk": risk_pct,
        "recommendation": rec,
        "breakdown": breakdown,
        "applicable_for": "Type 2 Diabetes risk prediction",
    }


def calculate_stroke_risk_abcd2(
    age: Optional[int] = None,
    blood_pressure_high: bool = False,
    clinical_features: str = "none",  # none | speech_only | unilateral_weakness
    duration_minutes: int = 0,
    diabetes: bool = False,
) -> Dict[str, Any]:
    """
    ABCD2 Score for TIA → Stroke risk prediction.
    Predicts 2-day, 7-day, and 90-day stroke risk after TIA.
    """
    score = 0
    breakdown = {}

    # Age
    a = 1 if age and age >= 60 else 0
    score += a
    breakdown["age_>=60"] = {"score": a, "value": age or "Unknown"}

    # Blood pressure
    bp = 1 if blood_pressure_high else 0
    score += bp
    breakdown["bp_>=140/90"] = {"score": bp, "present": blood_pressure_high}

    # Clinical features
    cf_map = {"unilateral_weakness": 2, "speech_only": 1, "none": 0}
    cf = cf_map.get(clinical_features.lower(), 0)
    score += cf
    breakdown["clinical_features"] = {"score": cf, "value": clinical_features}

    # Duration
    if duration_minutes >= 60:
        d = 2
    elif duration_minutes >= 10:
        d = 1
    else:
        d = 0
    score += d
    breakdown["duration"] = {"score": d, "value": f"{duration_minutes} min"}

    # Diabetes
    dm = 1 if diabetes else 0
    score += dm
    breakdown["diabetes"] = {"score": dm, "present": diabetes}

    # Risk
    if score <= 3:
        risk_level = "Low"
        two_day = "1.0%"
        seven_day = "1.2%"
    elif score <= 5:
        risk_level = "Moderate"
        two_day = "4.1%"
        seven_day = "5.9%"
    else:
        risk_level = "High"
        two_day = "8.1%"
        seven_day = "11.7%"

    return {
        "score_name": "ABCD2 Score (Stroke Risk after TIA)",
        "total_score": score,
        "max_score": 7,
        "risk_level": risk_level,
        "two_day_stroke_risk": two_day,
        "seven_day_stroke_risk": seven_day,
        "recommendation": f"{risk_level} risk. {'Hospital admission recommended.' if risk_level == 'High' else 'Outpatient evaluation within 24-48 hours.'}",
        "breakdown": breakdown,
        "applicable_for": "Stroke risk after transient ischemic attack",
    }


def get_risk_scores_for_symptoms(
    symptoms: List[str],
    age: Optional[int] = None,
    risk_factors: Optional[List[str]] = None,
    existing_conditions: Optional[List[str]] = None,
) -> List[Dict[str, Any]]:
    """
    Auto-select and compute appropriate clinical risk scores based on symptoms.
    """
    norm = set(s.strip().lower().replace(" ", "_") for s in symptoms)
    scores = []

    # HEART Score for chest pain
    if "chest_pain" in norm or "chest pain" in {s.lower() for s in symptoms}:
        scores.append(calculate_heart_score(
            age=age,
            risk_factors=risk_factors or [],
            symptom_history="typical" if len(norm) >= 3 else "moderately_suspicious",
            troponin_elevated=False,
        ))

    # Wells for SOB + leg symptoms
    if ("shortness_of_breath" in norm or "leg_swelling" in norm or
            "shortness of breath" in {s.lower() for s in symptoms}):
        scores.append(calculate_wells_score(
            heart_rate_above_100="heart_palpitations" in norm,
            clinical_signs_dvt="leg_swelling" in norm or "leg_pain" in norm,
        ))

    # Diabetes risk if metabolic symptoms
    metabolic = norm & {"frequent_urination", "weight_loss", "fatigue", "excessive_thirst", "vision_problems"}
    if len(metabolic) >= 2:
        conds = [c.lower() for c in (existing_conditions or [])]
        scores.append(calculate_diabetes_risk_score(
            age=age,
            family_diabetes="diabetes" in " ".join(risk_factors or []).lower(),
            high_bp_history="hypertension" in conds,
            high_glucose_history="diabetes" in conds or "prediabetes" in conds,
        ))

    # Stroke risk for neurological symptoms
    neuro = norm & {"dizziness", "vision_problems", "numbness", "headache", "speech_difficulty"}
    if len(neuro) >= 2:
        scores.append(calculate_stroke_risk_abcd2(
            age=age,
            blood_pressure_high="hypertension" in " ".join(existing_conditions or []).lower(),
            clinical_features="unilateral_weakness" if "numbness" in norm else (
                "speech_only" if "speech_difficulty" in norm else "none"
            ),
            diabetes="diabetes" in " ".join(existing_conditions or []).lower(),
        ))

    return scores
