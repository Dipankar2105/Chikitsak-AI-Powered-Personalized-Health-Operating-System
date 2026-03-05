"""
Explainable AI (XAI) Engine

Every diagnosis includes:
- Symptom contribution analysis (how much each symptom contributed)
- Step-by-step clinical reasoning chain
- Confidence breakdown (ML vs CDSS vs combined)
- Medical references from WHO, CDC, and clinical guidelines
"""

import logging
from typing import Dict, Any, List, Optional

logger = logging.getLogger(__name__)


# ─────────────────────────────────────────────────────────────────────────
# Medical Reference Database
# Curated references per condition from WHO, CDC, MedlinePlus, guidelines
# ─────────────────────────────────────────────────────────────────────────

MEDICAL_REFERENCES: Dict[str, List[Dict[str, str]]] = {
    "Myocardial Infarction": [
        {"source": "WHO", "title": "Cardiovascular Diseases (CVDs)", "url": "https://www.who.int/news-room/fact-sheets/detail/cardiovascular-diseases-(cvds)", "key_point": "CVDs are the leading cause of death globally, taking 17.9M lives annually."},
        {"source": "AHA/ACC", "title": "2021 Chest Pain Guideline", "url": "https://www.ahajournals.org/doi/10.1161/CIR.0000000000001029", "key_point": "Acute chest pain + diaphoresis + nausea = high suspicion for ACS. ECG within 10 min."},
        {"source": "CDC", "title": "Heart Attack Signs and Symptoms", "url": "https://www.cdc.gov/heartdisease/heart_attack.htm", "key_point": "Major symptoms: chest pain/pressure, upper body pain, SOB, cold sweat, nausea."},
    ],
    "Angina Pectoris": [
        {"source": "NICE", "title": "Stable Angina: Management (CG126)", "url": "https://www.nice.org.uk/guidance/cg126", "key_point": "GTN sublingual for acute relief. Beta-blockers or CCBs for prevention."},
        {"source": "AHA", "title": "Angina (Chest Pain)", "url": "https://www.heart.org/en/health-topics/heart-attack/angina-chest-pain", "key_point": "Stable angina occurs with exertion, relieved by rest. Unstable angina is a medical emergency."},
    ],
    "GERD": [
        {"source": "ACG", "title": "ACG Clinical Guideline: GERD 2022", "url": "https://journals.lww.com/ajg/fulltext/2022/01000/acg_clinical_guideline_for_the_diagnosis_and.14.aspx", "key_point": "PPI therapy 8 weeks for erosive esophagitis. Lifestyle modifications as adjunct."},
        {"source": "MedlinePlus", "title": "Gastroesophageal Reflux Disease", "url": "https://medlineplus.gov/gerd.html", "key_point": "Avoid trigger foods, eat smaller meals, don't lie down after eating."},
    ],
    "Panic Attack": [
        {"source": "APA", "title": "Panic Disorder DSM-5 Criteria", "url": "https://www.psychiatry.org/patients-families/anxiety-disorders", "key_point": "4+ symptoms peaking within minutes: palpitations, sweating, trembling, SOB, chest pain."},
        {"source": "NICE", "title": "Generalised Anxiety Disorder and Panic Disorder", "url": "https://www.nice.org.uk/guidance/cg113", "key_point": "CBT is first-line treatment. SSRIs if CBT insufficient."},
    ],
    "Pneumonia": [
        {"source": "WHO", "title": "Pneumonia Fact Sheet", "url": "https://www.who.int/news-room/fact-sheets/detail/pneumonia", "key_point": "Leading infectious cause of death in children. Vaccines, nutrition, and clean air prevent most cases."},
        {"source": "ATS/IDSA", "title": "Community-Acquired Pneumonia Guidelines 2019", "url": "https://www.atsjournals.org/doi/10.1164/rccm.201908-1581ST", "key_point": "CURB-65 for severity. Amoxicillin first-line for outpatient CAP."},
        {"source": "CDC", "title": "Pneumonia Prevention and Treatment", "url": "https://www.cdc.gov/pneumonia/", "key_point": "Pneumococcal and flu vaccines reduce pneumonia risk significantly."},
    ],
    "Pulmonary Embolism": [
        {"source": "ESC", "title": "2019 ESC Guidelines on Pulmonary Embolism", "url": "https://academic.oup.com/eurheartj/article/41/4/543/5556136", "key_point": "Wells Score for pre-test probability. CTPA is gold standard for diagnosis."},
        {"source": "ACCP", "title": "Antithrombotic Therapy for VTE", "url": "https://journal.chestnet.org/article/S0012-3692(16)41365-9/fulltext", "key_point": "DOACs preferred over warfarin for most PE patients. Minimum 3 months anticoagulation."},
    ],
    "Migraine": [
        {"source": "WHO", "title": "Headache Disorders", "url": "https://www.who.int/news-room/fact-sheets/detail/headache-disorders", "key_point": "Migraine is 3rd most prevalent disease worldwide. Affects 1 in 7 people."},
        {"source": "AAN", "title": "Migraine Prevention Guidelines", "url": "https://www.aan.com/Guidelines/Home/GuidelineDetail/962", "key_point": "Triptans for acute treatment. Beta-blockers, topiramate, or CGRP inhibitors for prevention."},
    ],
    "Meningitis": [
        {"source": "WHO", "title": "Meningitis Fact Sheet", "url": "https://www.who.int/news-room/fact-sheets/detail/meningitis", "key_point": "Medical emergency. Classic triad: fever, neck stiffness, altered mental status."},
        {"source": "IDSA", "title": "Bacterial Meningitis Guidelines", "url": "https://academic.oup.com/cid/article/39/9/1267/407399", "key_point": "Empiric antibiotics within 1 hour. Dexamethasone before or with first antibiotic dose."},
    ],
    "Influenza": [
        {"source": "CDC", "title": "Influenza (Flu) Information", "url": "https://www.cdc.gov/flu/", "key_point": "Annual vaccination recommended. Oseltamivir within 48h of symptom onset."},
        {"source": "WHO", "title": "Influenza (Seasonal)", "url": "https://www.who.int/news-room/fact-sheets/detail/influenza-(seasonal)", "key_point": "3-5 million severe cases and 290,000-650,000 deaths annually worldwide."},
    ],
    "Type 2 Diabetes": [
        {"source": "WHO", "title": "Diabetes Fact Sheet", "url": "https://www.who.int/news-room/fact-sheets/detail/diabetes", "key_point": "422 million people have diabetes worldwide. Number has quadrupled since 1980."},
        {"source": "ADA", "title": "Standards of Care in Diabetes 2024", "url": "https://diabetesjournals.org/care/issue/47/Supplement_1", "key_point": "HbA1c target < 7% for most adults. Metformin remains first-line therapy."},
        {"source": "CDC", "title": "Type 2 Diabetes", "url": "https://www.cdc.gov/diabetes/basics/type2.html", "key_point": "Risk factors: overweight, age >45, family history, physical inactivity."},
    ],
    "Hypothyroidism": [
        {"source": "ATA", "title": "Guidelines for Hypothyroidism in Adults", "url": "https://www.liebertpub.com/doi/10.1089/thy.2014.0028", "key_point": "Levothyroxine is standard treatment. TSH target 0.5-2.5 mIU/L for most patients."},
        {"source": "MedlinePlus", "title": "Hypothyroidism", "url": "https://medlineplus.gov/hypothyroidism.html", "key_point": "Common in women over 60. Symptoms develop slowly over months to years."},
    ],
    "Depression": [
        {"source": "WHO", "title": "Depression Fact Sheet", "url": "https://www.who.int/news-room/fact-sheets/detail/depression", "key_point": "264 million affected globally. Leading cause of disability worldwide."},
        {"source": "APA", "title": "Practice Guideline for MDD", "url": "https://psychiatryonline.org/doi/book/10.1176/appi.books.9780890424462", "key_point": "Combination of psychotherapy and pharmacotherapy most effective for moderate-severe depression."},
        {"source": "NICE", "title": "Depression in Adults (NG222)", "url": "https://www.nice.org.uk/guidance/ng222", "key_point": "Stepped care model. CBT and SSRIs are first-line treatments."},
    ],
    "Hypertension Crisis": [
        {"source": "AHA/ACC", "title": "2017 Hypertension Guidelines", "url": "https://www.ahajournals.org/doi/10.1161/HYP.0000000000000065", "key_point": "Hypertensive emergency: SBP >180 or DBP >120 with target organ damage. IV therapy needed."},
        {"source": "WHO", "title": "Hypertension Fact Sheet", "url": "https://www.who.int/news-room/fact-sheets/detail/hypertension", "key_point": "Estimated 1.28 billion adults with hypertension. Only 1 in 5 has it controlled."},
    ],
}

# Default references for conditions not in the database
DEFAULT_REFERENCES = [
    {"source": "WHO", "title": "Health Topics", "url": "https://www.who.int/health-topics", "key_point": "Consult WHO health topics for evidence-based information."},
    {"source": "MedlinePlus", "title": "Medical Encyclopedia", "url": "https://medlineplus.gov/", "key_point": "Trusted health information from the National Library of Medicine."},
    {"source": "CDC", "title": "Diseases & Conditions", "url": "https://www.cdc.gov/diseasesconditions/", "key_point": "CDC provides science-based public health information."},
]


# ─────────────────────────────────────────────────────────────────────────
# Symptom Contribution Analysis
# ─────────────────────────────────────────────────────────────────────────

def calculate_symptom_contributions(
    symptoms: List[str],
    diagnosis: str,
    disease_symptom_matrix: Optional[Dict] = None,
) -> List[Dict[str, Any]]:
    """
    Calculate how much each symptom contributed to the diagnosis.

    Returns list sorted by contribution descending:
        [{
            "symptom": str,
            "contribution_pct": float,
            "weight": float (raw association weight),
            "role": "primary" | "supporting" | "minor",
        }]
    """
    from backend.app.services.cdss_engine import DISEASE_SYMPTOM_MATRIX

    matrix = disease_symptom_matrix or DISEASE_SYMPTOM_MATRIX

    # Find the disease in matrix (fuzzy match)
    disease_weights = {}
    diagnosis_lower = diagnosis.lower()
    for disease_name, weights in matrix.items():
        if disease_name.lower() in diagnosis_lower or diagnosis_lower in disease_name.lower():
            disease_weights = weights
            break

    if not disease_weights:
        # Build equal-weight contributions
        n = max(len(symptoms), 1)
        return [
            {"symptom": s, "contribution_pct": round(100 / n, 1), "weight": 0.5, "role": "supporting"}
            for s in symptoms
        ]

    # Calculate weighted contributions
    contributions = []
    total_matched_weight = 0.0

    for s in symptoms:
        norm = s.strip().lower().replace(" ", "_")
        norm_space = s.strip().lower()
        weight = disease_weights.get(norm, disease_weights.get(norm_space, 0.0))
        if weight > 0:
            total_matched_weight += weight
            contributions.append({"symptom": s, "weight": weight})
        else:
            contributions.append({"symptom": s, "weight": 0.05})  # Minimal contribution
            total_matched_weight += 0.05

    # Convert to percentages
    for c in contributions:
        if total_matched_weight > 0:
            c["contribution_pct"] = round((c["weight"] / total_matched_weight) * 100, 1)
        else:
            c["contribution_pct"] = round(100 / max(len(contributions), 1), 1)

        if c["weight"] >= 0.7:
            c["role"] = "primary"
        elif c["weight"] >= 0.3:
            c["role"] = "supporting"
        else:
            c["role"] = "minor"

    contributions.sort(key=lambda x: x["contribution_pct"], reverse=True)
    return contributions


# ─────────────────────────────────────────────────────────────────────────
# Clinical Reasoning Chain
# ─────────────────────────────────────────────────────────────────────────

REASONING_TEMPLATES = {
    "cardiac": "The combination of {primary} with {supporting} raises concern for a cardiac etiology. "
               "Cardiac events often present with chest discomfort accompanied by autonomic symptoms.",
    "respiratory": "The presentation of {primary} alongside {supporting} suggests a respiratory process. "
                   "The pattern of symptoms is consistent with airway or pulmonary involvement.",
    "gastrointestinal": "The symptom pattern of {primary} combined with {supporting} is suggestive of a "
                        "gastrointestinal origin. Timing relative to meals and positional changes may help differentiate.",
    "neurological": "The presence of {primary} with {supporting} warrants neurological evaluation. "
                    "The pattern suggests potential central or peripheral nervous system involvement.",
    "infectious": "The constellation of {primary} and {supporting} is consistent with an infectious process. "
                  "The acuity of onset and exposure history are important differentiating factors.",
    "metabolic": "The symptoms of {primary} combined with {supporting} may indicate a metabolic or endocrine disorder. "
                 "Laboratory evaluation is recommended to confirm.",
    "psychiatric": "The reported symptoms of {primary} with {supporting} may reflect an underlying psychiatric condition. "
                   "A comprehensive mental health assessment can help clarify the diagnosis.",
    "musculoskeletal": "The presentation of {primary} with {supporting} suggests a musculoskeletal origin. "
                       "Physical examination and imaging may be helpful.",
    "default": "Based on the reported symptoms ({primary}, {supporting}), clinical evaluation is recommended. "
               "The symptom pattern warrants further investigation to establish a definitive diagnosis.",
}

DISEASE_CATEGORY = {
    "Myocardial Infarction": "cardiac", "Angina Pectoris": "cardiac", "Costochondritis": "musculoskeletal",
    "Pneumonia": "respiratory", "Pulmonary Embolism": "respiratory", "Asthma Exacerbation": "respiratory",
    "GERD": "gastrointestinal", "Gastroenteritis": "gastrointestinal", "Appendicitis": "gastrointestinal",
    "Migraine": "neurological", "Tension Headache": "neurological", "Meningitis": "neurological",
    "Hypertension Crisis": "cardiac",
    "Influenza": "infectious", "COVID-19": "infectious", "Urinary Tract Infection": "infectious",
    "Type 2 Diabetes": "metabolic", "Hypothyroidism": "metabolic", "Hyperthyroidism": "metabolic",
    "Iron Deficiency Anemia": "metabolic",
    "Depression": "psychiatric", "Generalized Anxiety Disorder": "psychiatric", "Panic Attack": "psychiatric",
    "Deep Vein Thrombosis": "cardiac",
    "Rheumatoid Arthritis": "musculoskeletal",
    "Allergic Reaction": "default",
}


def generate_reasoning_chain(
    symptoms: List[str],
    diagnosis: str,
    contributions: List[Dict[str, Any]],
    differential: List[Dict[str, Any]],
) -> Dict[str, Any]:
    """
    Generate step-by-step clinical reasoning for the diagnosis.

    Returns:
        {
            "reasoning_steps": list[str],
            "clinical_narrative": str,
            "supporting_evidence": list[str],
            "contradicting_evidence": list[str],
            "differential_rationale": str,
        }
    """
    primary = [c["symptom"] for c in contributions if c["role"] == "primary"]
    supporting = [c["symptom"] for c in contributions if c["role"] == "supporting"]
    minor = [c["symptom"] for c in contributions if c["role"] == "minor"]

    primary_str = ", ".join(primary) if primary else "reported symptoms"
    supporting_str = ", ".join(supporting) if supporting else "associated findings"

    # Get category-specific reasoning
    category = DISEASE_CATEGORY.get(diagnosis, "default")
    template = REASONING_TEMPLATES.get(category, REASONING_TEMPLATES["default"])
    narrative = template.format(primary=primary_str, supporting=supporting_str)

    # Build reasoning steps
    steps = []
    steps.append(f"Step 1 — Symptom Assessment: Patient reports {len(symptoms)} symptom(s): {', '.join(symptoms[:5])}.")

    if primary:
        steps.append(f"Step 2 — Primary Indicators: {', '.join(primary)} are strongly associated with {diagnosis} "
                     f"(contribution: {sum(c['contribution_pct'] for c in contributions if c['role'] == 'primary'):.0f}%).")

    if supporting:
        steps.append(f"Step 3 — Supporting Evidence: {', '.join(supporting)} provide additional diagnostic support.")

    # Differential exclusion reasoning
    if len(differential) > 1:
        runner_up = differential[1] if differential[0]["condition"] == diagnosis else differential[0]
        steps.append(
            f"Step 4 — Differential Exclusion: {runner_up['condition']} was considered "
            f"({runner_up['probability']:.1f}% probability) but ranks lower because "
            f"key distinguishing symptoms {'are' if runner_up.get('missing_key_symptoms') else 'were not'} "
            f"{'absent' if runner_up.get('missing_key_symptoms') else 'less specific'}."
        )

    steps.append(f"Step 5 — Conclusion: {diagnosis} is the most probable diagnosis based on symptom pattern and prevalence data.")

    # Supporting vs contradicting evidence
    supporting_evidence = [f"{s} is a known indicator of {diagnosis}" for s in primary[:3]]
    if supporting:
        supporting_evidence.append(f"Presence of {', '.join(supporting[:2])} strengthens the diagnosis")

    contradicting = []
    if minor:
        contradicting.append(f"{', '.join(minor[:2])} have weak association with {diagnosis}")
    if len(differential) > 1:
        alt = differential[1]["condition"] if differential[0]["condition"] == diagnosis else differential[0]["condition"]
        contradicting.append(f"Some symptoms also overlap with {alt}")

    # Differential rationale
    diff_rationale = ""
    if len(differential) >= 2:
        top = differential[0]
        second = differential[1]
        diff_rationale = (
            f"{top['condition']} ({top['probability']:.1f}%) ranks above "
            f"{second['condition']} ({second['probability']:.1f}%) because it has stronger "
            f"symptom-disease association for the reported symptom combination. "
            f"{top['condition']} matches {len(top.get('matching_symptoms', []))} symptoms "
            f"vs {len(second.get('matching_symptoms', []))} for {second['condition']}."
        )

    return {
        "reasoning_steps": steps,
        "clinical_narrative": narrative,
        "supporting_evidence": supporting_evidence,
        "contradicting_evidence": contradicting,
        "differential_rationale": diff_rationale,
    }


def generate_confidence_breakdown(
    ml_confidence: float,
    cdss_probability: float,
    symptom_count: int,
) -> Dict[str, Any]:
    """
    Break down the overall confidence into components.
    """
    # Coverage factor: more symptoms = higher confidence
    coverage_factor = min(1.0, symptom_count / 5) * 100

    # Combined confidence (weighted average)
    combined = (ml_confidence * 0.4 + cdss_probability * 0.4 + coverage_factor * 0.2)

    return {
        "ml_model_confidence": round(ml_confidence, 1),
        "cdss_prevalence_confidence": round(cdss_probability, 1),
        "symptom_coverage_factor": round(coverage_factor, 1),
        "combined_confidence": round(combined, 1),
        "interpretation": (
            "High confidence" if combined > 70 else
            "Moderate confidence — additional evaluation recommended" if combined > 40 else
            "Low confidence — further diagnostic testing needed"
        ),
    }


def get_medical_references(condition: str) -> List[Dict[str, str]]:
    """
    Get medical references for a given condition.
    """
    # Exact match
    if condition in MEDICAL_REFERENCES:
        return MEDICAL_REFERENCES[condition]

    # Fuzzy match
    condition_lower = condition.lower()
    for key, refs in MEDICAL_REFERENCES.items():
        if key.lower() in condition_lower or condition_lower in key.lower():
            return refs

    # Check for partial matches
    for key, refs in MEDICAL_REFERENCES.items():
        key_words = set(key.lower().split())
        cond_words = set(condition_lower.split())
        if key_words & cond_words:
            return refs

    return DEFAULT_REFERENCES


def explain_diagnosis(
    symptoms: List[str],
    diagnosis: str,
    ml_confidence: float,
    differential: List[Dict[str, Any]],
) -> Dict[str, Any]:
    """
    Full explainable AI output for a diagnosis.

    Returns:
        {
            "symptom_contributions": list,
            "reasoning": dict (steps + narrative),
            "confidence_breakdown": dict,
            "medical_references": list,
        }
    """
    # Symptom contributions
    contributions = calculate_symptom_contributions(symptoms, diagnosis)

    # CDSS probability for the top diagnosis
    cdss_prob = 0.0
    for d in differential:
        if d.get("condition", "").lower() == diagnosis.lower():
            cdss_prob = d.get("probability", 50.0)
            break
    if cdss_prob == 0.0 and differential:
        cdss_prob = differential[0].get("probability", 50.0)

    # Reasoning chain
    reasoning = generate_reasoning_chain(symptoms, diagnosis, contributions, differential)

    # Confidence breakdown
    confidence = generate_confidence_breakdown(
        ml_confidence=ml_confidence * 100 if ml_confidence <= 1 else ml_confidence,
        cdss_probability=cdss_prob,
        symptom_count=len(symptoms),
    )

    # Medical references
    references = get_medical_references(diagnosis)

    return {
        "symptom_contributions": contributions,
        "reasoning": reasoning,
        "confidence_breakdown": confidence,
        "medical_references": references,
    }
