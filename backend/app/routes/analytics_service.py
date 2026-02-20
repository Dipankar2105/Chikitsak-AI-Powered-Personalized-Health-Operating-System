from fastapi import APIRouter
from backend.app.services.analytics_service import (
    calculate_bmi,
    calculate_daily_calorie_needs,
    generate_health_score,
)
from backend.app.schemas.analytics_service import HealthScoreRequest, HealthScoreResponse

router = APIRouter(prefix="/analytics", tags=["Health Analytics"])


@router.post("/health-score", response_model=HealthScoreResponse)
def get_health_score(data: HealthScoreRequest):
    """
    Calculate BMI, daily calorie needs, and generate an overall health score
    based on user's vital statistics and lifestyle data.
    """
    bmi = calculate_bmi(data.weight_kg, data.height_cm)
    
    calories = calculate_daily_calorie_needs(
        data.age,
        data.gender,
        data.weight_kg,
        data.height_cm,
        data.activity_level,
    )
    
    score = generate_health_score(
        data.age,
        data.weight_kg,
        data.height_cm,
        data.activity_level,
        data.sleep_hours,
        data.stress_level,
    )

    # Determine status label
    if score >= 85:
        status = "Excellent"
    elif score >= 70:
        status = "Good"
    elif score >= 50:
        status = "Fair"
    else:
        status = "Needs Improvement"

    return HealthScoreResponse(
        bmi=bmi,
        daily_calories=calories,
        health_score=score,
        health_status=status,
    )
