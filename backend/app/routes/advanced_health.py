"""
Environmental Health, Rural Healthcare, Multimodal AI, and Population Health Routes.
"""

from fastapi import APIRouter, Depends
from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from sqlalchemy.orm import Session

from backend.app.database import get_db
from backend.app.models.user import User
from backend.app.services.auth_service import get_current_user
from backend.app.services.environmental_health_engine import assess_environmental_health
from backend.app.services.rural_health_engine import offline_triage, get_vhw_quick_reference
from backend.app.services.multimodal_ai_engine import integrate_multimodal_data
from backend.app.services.population_health_engine import (
    get_disease_trends, detect_outbreak, get_risk_zones, get_population_health_summary,
)
from backend.app.logging_config import get_logger

logger = get_logger("routes.advanced_health")
router = APIRouter(tags=["Advanced Health"])


# ─── Environmental Health ──────────────────────────────────────────────

class EnvHealthRequest(BaseModel):
    city: Optional[str] = None
    country: Optional[str] = None
    aqi_override: Optional[int] = None
    temp_override: Optional[float] = None
    humidity_override: Optional[float] = None


@router.post("/environmental-health/assess", tags=["Environmental Health"])
def assess_environment(
    req: EnvHealthRequest,
    current_user: User = Depends(get_current_user),
):
    """Assess environmental health risks for a location."""
    result = assess_environmental_health(
        city=req.city or current_user.city,
        country=req.country or current_user.country,
        aqi_override=req.aqi_override,
        temp_override=req.temp_override,
        humidity_override=req.humidity_override,
        existing_conditions=current_user.existing_conditions or [],
    )
    return result


# ─── Rural Healthcare ─────────────────────────────────────────────────

class RuralTriageRequest(BaseModel):
    symptoms: List[str] = Field(..., min_items=1)
    pregnant: bool = False


@router.post("/rural/triage", tags=["Rural Healthcare"])
def rural_triage(
    req: RuralTriageRequest,
    current_user: User = Depends(get_current_user),
):
    """Offline-capable rule-based triage for rural settings."""
    result = offline_triage(
        symptoms=req.symptoms,
        age=current_user.age,
        gender=current_user.gender,
        pregnant=req.pregnant,
    )
    return result


@router.get("/rural/vhw-reference", tags=["Rural Healthcare"])
def vhw_reference():
    """Quick reference card for Village Health Workers (public endpoint)."""
    return get_vhw_quick_reference()


# ─── Multimodal AI ────────────────────────────────────────────────────

class MultimodalRequest(BaseModel):
    symptoms: Optional[List[str]] = None
    image_findings: Optional[Dict[str, Any]] = None
    lab_results: Optional[Dict[str, Any]] = None
    wearable_data: Optional[Dict[str, Any]] = None
    environmental_data: Optional[Dict[str, Any]] = None


@router.post("/multimodal/diagnose", tags=["Multimodal AI"])
def multimodal_diagnosis(
    req: MultimodalRequest,
    current_user: User = Depends(get_current_user),
):
    """Integrated diagnosis combining multiple data sources."""
    result = integrate_multimodal_data(
        symptoms=req.symptoms,
        image_findings=req.image_findings,
        lab_results=req.lab_results,
        wearable_data=req.wearable_data,
        environmental_data=req.environmental_data,
        patient_profile={
            "age": current_user.age,
            "gender": current_user.gender,
            "conditions": current_user.existing_conditions or [],
        },
    )
    return result


# ─── Population Health Dashboard ──────────────────────────────────────

class OutbreakRequest(BaseModel):
    recent_reports: List[Dict[str, Any]] = Field(..., description="List of {symptoms:[], timestamp:str, location:str}")
    location: Optional[str] = None
    time_window_days: int = Field(7, ge=1, le=30)


@router.get("/population/trends", tags=["Population Health"])
def disease_trends(
    location: Optional[str] = None,
    current_user: User = Depends(get_current_user),
):
    """Get current disease trends nationally or for a specific location."""
    return get_disease_trends(location or current_user.city)


@router.post("/population/outbreak-detection", tags=["Population Health"])
def outbreak_detection(
    req: OutbreakRequest,
    current_user: User = Depends(get_current_user),
):
    """Detect potential outbreaks from symptom report clustering."""
    return detect_outbreak(
        recent_symptom_reports=req.recent_reports,
        location=req.location or current_user.city,
        time_window_days=req.time_window_days,
    )


@router.get("/population/risk-zones", tags=["Population Health"])
def risk_zones(
    disease: Optional[str] = None,
    current_user: User = Depends(get_current_user),
):
    """Get geographic risk zones for diseases."""
    return get_risk_zones(disease)


@router.get("/population/summary", tags=["Population Health"])
def population_summary(
    location: Optional[str] = None,
    current_user: User = Depends(get_current_user),
):
    """Comprehensive population health summary."""
    return get_population_health_summary(location or current_user.city)
