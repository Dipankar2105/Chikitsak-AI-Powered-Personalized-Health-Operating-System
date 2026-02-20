from pydantic import BaseModel, Field


class HealthScoreRequest(BaseModel):
    age: int = Field(..., gt=0, le=120)
    gender: str = Field(..., pattern="^(male|female|other)$")
    weight_kg: float = Field(..., gt=0)
    height_cm: float = Field(..., gt=0)
    activity_level: str = Field(..., pattern="^(sedentary|light|moderate|active|very_active)$")
    sleep_hours: float = Field(..., ge=0, le=24)
    stress_level: int = Field(..., ge=1, le=10)


class HealthScoreResponse(BaseModel):
    bmi: str | None
    daily_calories: int
    health_score: int
    health_status: str
