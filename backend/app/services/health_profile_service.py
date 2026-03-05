"""
Health Profile Initialization Service

Automatically creates and initializes health profiles for new users.
Sets up default health data based on user demographics and preferences.
"""

import logging
from typing import Optional, Dict, Any
from datetime import datetime, timezone
from sqlalchemy.orm import Session

from backend.app.models.user import User
from backend.app.models.medical_profile import MedicalProfile

logger = logging.getLogger(__name__)


def initialize_health_profile(
    db: Session,
    user: User,
    age: Optional[int] = None,
    gender: Optional[str] = None,
    height_cm: Optional[float] = None,
    weight_kg: Optional[float] = None,
    activity_level: str = "sedentary",
) -> MedicalProfile:
    """
    Initialize health profile for new user.
    
    Args:
        db: Database session
        user: User object
        age: User age
        gender: User gender
        height_cm: Height in centimeters
        weight_kg: Weight in kilograms
        activity_level: One of: sedentary, light, moderate, active, very_active
        
    Returns:
        Created MedicalProfile object
    """
    
    # Check if profile already exists
    existing = db.query(MedicalProfile).filter(MedicalProfile.user_id == user.id).first()
    if existing:
        logger.info("Health profile already exists for user %d", user.id)
        return existing
    
    # Create new profile
    profile = MedicalProfile(
        user_id=user.id,
        height_cm=height_cm,
        weight_kg=weight_kg,
        activity_level=activity_level or "sedentary",
        chronic_conditions=[],
        current_medications=[],
        family_history=[],
        surgical_history=[],
        notes="Profile initialized automatically",
        updated_at=datetime.now(timezone.utc),
    )
    
    db.add(profile)
    db.commit()
    db.refresh(profile)
    
    logger.info("Health profile created for user %d (age=%s, gender=%s)", user.id, age, gender)
    return profile


def get_or_create_health_profile(
    db: Session,
    user_id: int,
    **kwargs
) -> MedicalProfile:
    """
    Get existing health profile or create new one.
    """
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise ValueError(f"User {user_id} not found")
    
    profile = db.query(MedicalProfile).filter(MedicalProfile.user_id == user_id).first()
    
    if not profile:
        profile = initialize_health_profile(db, user, **kwargs)
    
    return profile


def calculate_bmi(height_cm: float, weight_kg: float) -> Dict[str, Any]:
    """Calculate BMI and BMI category."""
    if not height_cm or height_cm <= 0 or not weight_kg or weight_kg <= 0:
        return {"bmi": None, "category": "unknown"}
    
    height_m = height_cm / 100
    bmi = weight_kg / (height_m ** 2)
    
    if bmi < 18.5:
        category = "underweight"
    elif 18.5 <= bmi < 25:
        category = "normal"
    elif 25 <= bmi < 30:
        category = "overweight"
    else:
        category = "obese"
    
    return {
        "bmi": round(bmi, 1),
        "category": category,
    }


def get_daily_calorie_needs(
    age: Optional[int],
    gender: Optional[str],
    height_cm: Optional[float],
    weight_kg: Optional[float],
    activity_level: str = "sedentary",
) -> Dict[str, Any]:
    """
    Calculate daily calorie needs using Mifflin-St Jeor equation.
    
    Returns:
        {
            "bmr": float,  # Basal Metabolic Rate
            "tdee": float,  # Total Daily Energy Expenditure
            "recommended_intake": float,
        }
    """
    
    if not age or not weight_kg or not height_cm:
        return {
            "bmr": None,
            "tdee": None,
            "recommended_intake": 2000,  # Default
            "note": "Insufficient data for calculation",
        }
    
    # Mifflin-St Jeor equation
    if gender and gender.lower() in ["m", "male"]:
        bmr = 10 * weight_kg + 6.25 * height_cm - 5 * age + 5
    else:
        bmr = 10 * weight_kg + 6.25 * height_cm - 5 * age - 161
    
    # Activity multipliers
    activity_multipliers = {
        "sedentary": 1.2,
        "light": 1.375,
        "moderate": 1.55,
        "active": 1.725,
        "very_active": 1.9,
    }
    
    multiplier = activity_multipliers.get(activity_level, 1.2)
    tdee = bmr * multiplier
    
    return {
        "bmr": round(bmr, 1),
        "tdee": round(tdee, 1),
        "recommended_intake": round(tdee, 0),
        "activity_level": activity_level,
    }


def get_health_recommendations(profile: MedicalProfile, age: Optional[int] = None) -> Dict[str, Any]:
    """Generate personalized health recommendations based on profile."""
    recommendations = {
        "nutrition": [],
        "fitness": [],
        "screening": [],
        "mental_health": [],
    }
    
    # Nutrition recommendations
    if profile.weight_kg and profile.height_cm:
        bmi_data = calculate_bmi(profile.height_cm, profile.weight_kg)
        if bmi_data["category"] == "overweight":
            recommendations["nutrition"].append("Consider reducing calorie intake by 300-500 kcal/day")
        elif bmi_data["category"] == "underweight":
            recommendations["nutrition"].append("Increase nutrition intake with healthy, calorie-dense foods")
        elif bmi_data["category"] == "obese":
            recommendations["nutrition"].append("Consult with a nutritionist for weight management plan")
    
    # Activity recommendations
    if profile.activity_level == "sedentary":
        recommendations["fitness"].append("Aim for at least 150 minutes of moderate activity per week")
    elif profile.activity_level in ["light", "moderate"]:
        recommendations["fitness"].append("Maintain current activity; consider adding strength training")
    
    # Age-based screening recommendations
    if age:
        if age >= 40:
            recommendations["screening"].append("Annual cholesterol screening recommended")
        if age >= 50:
            recommendations["screening"].append("Cancer screening (breast, colon) recommended")
        if age >= 60:
            recommendations["screening"].append("Annual blood pressure and diabetes screening")
    
    # Condition-based recommendations
    if profile.chronic_conditions:
        if any("diabetes" in cond.lower() for cond in profile.chronic_conditions):
            recommendations["nutrition"].append("Monitor carbohydrate intake; HbA1c target < 7%")
        if any("hypertension" in cond.lower() for cond in profile.chronic_conditions):
            recommendations["nutrition"].append("Limit sodium to < 2300mg/day")
    
    # Mental health
    recommendations["mental_health"].append("Practice stress management and mindfulness regularly")
    recommendations["mental_health"].append("Ensure 7-9 hours of quality sleep per night")
    
    return recommendations


def update_health_profile(
    db: Session,
    user_id: int,
    **updates
) -> MedicalProfile:
    """Update health profile with new data."""
    profile = db.query(MedicalProfile).filter(MedicalProfile.user_id == user_id).first()
    
    if not profile:
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            raise ValueError(f"User {user_id} not found")
        profile = initialize_health_profile(db, user, **updates)
        return profile
    
    # Update allowed fields
    allowed_fields = [
        "blood_group",
        "height_cm",
        "weight_kg",
        "activity_level",
        "chronic_conditions",
        "current_medications",
        "family_history",
        "surgical_history",
        "notes",
    ]
    
    for key, value in updates.items():
        if key in allowed_fields and value is not None:
            setattr(profile, key, value)
    
    profile.updated_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(profile)
    
    logger.info("Health profile updated for user %d", user_id)
    return profile
