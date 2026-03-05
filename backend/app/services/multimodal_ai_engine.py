"""
Multimodal Medical AI Engine

Combines multiple data sources for integrated diagnosis:
- Text symptoms
- Image analysis results
- Lab report findings
- Wearable device data
- Environmental data

Produces a unified diagnostic assessment with cross-source correlations.
"""

import logging
from typing import Dict, Any, List, Optional

logger = logging.getLogger(__name__)


def integrate_multimodal_data(
    symptoms: Optional[List[str]] = None,
    image_findings: Optional[Dict[str, Any]] = None,
    lab_results: Optional[Dict[str, Any]] = None,
    wearable_data: Optional[Dict[str, Any]] = None,
    environmental_data: Optional[Dict[str, Any]] = None,
    patient_profile: Optional[Dict[str, Any]] = None,
) -> Dict[str, Any]:
    """
    Integrate data from multiple medical sources into a unified assessment.

    Each input source contributes evidence toward a combined diagnosis.
    Sources that corroborate each other increase confidence.
    """
    sources_used = []
    evidence = []
    risk_factors = []
    confidence_adjustments = []

    # ── 1. Text Symptoms ──────────────────────────────────────────────
    if symptoms and len(symptoms) > 0:
        sources_used.append("symptoms")
        symptom_evidence = {
            "source": "Patient-reported symptoms",
            "data_type": "text",
            "findings": symptoms,
            "count": len(symptoms),
            "reliability": 0.7,  # Self-reported
        }
        evidence.append(symptom_evidence)

    # ── 2. Image Analysis ─────────────────────────────────────────────
    if image_findings:
        sources_used.append("imaging")
        img_type = image_findings.get("type", "unknown")
        img_finding = image_findings.get("finding", "normal")
        img_confidence = image_findings.get("confidence", 0.5)

        image_evidence = {
            "source": f"Medical imaging ({img_type})",
            "data_type": "image",
            "findings": [img_finding],
            "confidence": img_confidence,
            "reliability": 0.85,  # Imaging is generally reliable
        }
        evidence.append(image_evidence)

        # Cross-reference with symptoms
        if symptoms:
            correlations = _find_image_symptom_correlations(symptoms, img_finding, img_type)
            if correlations:
                confidence_adjustments.append({
                    "reason": f"Imaging confirms symptom presentation",
                    "adjustment": +0.15,
                    "details": correlations,
                })

    # ── 3. Lab Results ────────────────────────────────────────────────
    if lab_results:
        sources_used.append("lab_report")
        abnormals = lab_results.get("abnormal_values", [])
        lab_evidence = {
            "source": "Laboratory results",
            "data_type": "lab",
            "findings": abnormals or ["All values normal"],
            "reliability": 0.95,  # Lab tests are highly reliable
        }
        evidence.append(lab_evidence)

        if abnormals and symptoms:
            lab_correlations = _find_lab_symptom_correlations(symptoms, abnormals)
            if lab_correlations:
                confidence_adjustments.append({
                    "reason": "Lab results corroborate symptoms",
                    "adjustment": +0.20,
                    "details": lab_correlations,
                })

    # ── 4. Wearable Data ──────────────────────────────────────────────
    if wearable_data:
        sources_used.append("wearable")
        alerts = []

        hr = wearable_data.get("heart_rate")
        if hr:
            if hr > 100:
                alerts.append(f"Elevated heart rate: {hr} bpm (tachycardia)")
                risk_factors.append("Tachycardia detected by wearable")
            elif hr < 50:
                alerts.append(f"Low heart rate: {hr} bpm (bradycardia)")
                risk_factors.append("Bradycardia detected by wearable")

        spo2 = wearable_data.get("spo2")
        if spo2 and spo2 < 95:
            alerts.append(f"Low oxygen saturation: {spo2}% (normal >95%)")
            risk_factors.append("Hypoxemia detected")
            if spo2 < 90:
                alerts.append("⚠️ Critical SpO2 — seek immediate medical attention")

        bp_sys = wearable_data.get("bp_systolic")
        bp_dia = wearable_data.get("bp_diastolic")
        if bp_sys and bp_dia:
            if bp_sys > 140 or bp_dia > 90:
                alerts.append(f"Elevated BP: {bp_sys}/{bp_dia} mmHg")
                risk_factors.append("Hypertension detected")
            elif bp_sys < 90:
                alerts.append(f"Low BP: {bp_sys}/{bp_dia} mmHg — possible hypotension")

        steps = wearable_data.get("steps_today")
        if steps is not None:
            if steps < 2000:
                alerts.append(f"Very low activity: {steps} steps today")

        sleep_hrs = wearable_data.get("sleep_hours")
        if sleep_hrs is not None and sleep_hrs < 5:
            alerts.append(f"Insufficient sleep: {sleep_hrs}h (recommended 7-9h)")

        wearable_evidence = {
            "source": "Wearable device",
            "data_type": "wearable",
            "findings": alerts or ["All vitals within normal range"],
            "reliability": 0.75,  # Consumer wearables have moderate reliability
        }
        evidence.append(wearable_evidence)

    # ── 5. Environmental Data ─────────────────────────────────────────
    if environmental_data:
        sources_used.append("environment")
        env_risks = []

        aqi = environmental_data.get("aqi")
        if aqi and aqi > 150:
            env_risks.append(f"Poor air quality (AQI {aqi}) — respiratory risk")
            risk_factors.append("Environmental: poor air quality")

        temp = environmental_data.get("temperature_c")
        if temp and temp > 40:
            env_risks.append(f"Extreme heat ({temp}°C) — heat stroke risk")
            risk_factors.append("Environmental: extreme heat")

        water = environmental_data.get("water_quality")
        if water == "poor":
            env_risks.append("Poor water quality — waterborne disease risk")
            risk_factors.append("Environmental: poor water quality")

        env_evidence = {
            "source": "Environmental assessment",
            "data_type": "environment",
            "findings": env_risks or ["No significant environmental risks"],
            "reliability": 0.60,
        }
        evidence.append(env_evidence)

    # ── Integration & Confidence ──────────────────────────────────────
    n_sources = len(sources_used)
    base_confidence = min(0.5 + (n_sources * 0.1), 0.85)

    for adj in confidence_adjustments:
        base_confidence = min(0.95, base_confidence + adj["adjustment"])

    # Weighted reliability from all sources
    if evidence:
        weighted_reliability = sum(e.get("reliability", 0.5) for e in evidence) / len(evidence)
        final_confidence = round(base_confidence * weighted_reliability / 0.75, 2)
        final_confidence = min(0.95, final_confidence)
    else:
        final_confidence = 0.3

    return {
        "sources_used": sources_used,
        "source_count": n_sources,
        "evidence": evidence,
        "risk_factors": risk_factors,
        "confidence": final_confidence,
        "confidence_adjustments": confidence_adjustments,
        "integration_summary": _generate_integration_summary(sources_used, evidence, risk_factors),
        "recommendation": _generate_recommendation(n_sources, final_confidence, risk_factors),
    }


def _find_image_symptom_correlations(
    symptoms: List[str], finding: str, img_type: str,
) -> List[str]:
    """Find correlations between image findings and symptoms."""
    correlations = []
    finding_lower = finding.lower()

    if "pneumonia" in finding_lower and any(s in ("cough", "fever", "chest_pain", "shortness_of_breath") for s in symptoms):
        correlations.append("Chest imaging findings consistent with reported respiratory symptoms")
    if "fracture" in finding_lower and any(s in ("pain", "swelling", "injury") for s in symptoms):
        correlations.append("Imaging confirms musculoskeletal injury consistent with reported pain")
    if "tumor" in finding_lower or "mass" in finding_lower:
        correlations.append("Imaging finding requires specialist evaluation")
    if "cardiomegaly" in finding_lower and any(s in ("shortness_of_breath", "fatigue", "edema") for s in symptoms):
        correlations.append("Cardiac imaging consistent with reported cardiac symptoms")

    return correlations


def _find_lab_symptom_correlations(
    symptoms: List[str], abnormals: List[str],
) -> List[str]:
    """Find correlations between lab results and symptoms."""
    correlations = []
    abnormals_lower = " ".join(str(a).lower() for a in abnormals)

    if "glucose" in abnormals_lower and any(s in ("thirst", "frequent_urination", "fatigue") for s in symptoms):
        correlations.append("Elevated glucose consistent with reported diabetic symptoms")
    if "hemoglobin" in abnormals_lower and "fatigue" in symptoms:
        correlations.append("Low hemoglobin explains reported fatigue — possible anemia")
    if "wbc" in abnormals_lower and "fever" in symptoms:
        correlations.append("Elevated WBC confirms infectious/inflammatory process with fever")
    if "tsh" in abnormals_lower and any(s in ("fatigue", "weight_gain", "cold_intolerance") for s in symptoms):
        correlations.append("Thyroid function abnormality correlates with reported symptoms")
    if "creatinine" in abnormals_lower and "edema" in symptoms:
        correlations.append("Elevated creatinine with edema suggests renal evaluation needed")

    return correlations


def _generate_integration_summary(
    sources: List[str], evidence: List[Dict], risk_factors: List[str],
) -> str:
    """Generate a narrative summary of multimodal integration."""
    if not sources:
        return "No data sources provided for integration."

    parts = [f"Assessment based on {len(sources)} data source(s): {', '.join(sources)}."]

    total_findings = sum(len(e.get("findings", [])) for e in evidence)
    parts.append(f"Total findings analyzed: {total_findings}.")

    if risk_factors:
        parts.append(f"Risk factors identified: {len(risk_factors)}.")

    return " ".join(parts)


def _generate_recommendation(
    n_sources: int, confidence: float, risk_factors: List[str],
) -> str:
    """Generate clinical recommendation based on integration quality."""
    if n_sources >= 3 and confidence >= 0.7:
        return "Multiple data sources provide strong evidence. Follow recommended treatment plan."
    elif n_sources >= 2 and confidence >= 0.5:
        return "Moderate evidence from available sources. Consider additional testing to confirm."
    elif risk_factors:
        return "Risk factors detected. Consult healthcare professional for comprehensive evaluation."
    else:
        return "Limited data available. Provide more information for a more accurate assessment."
