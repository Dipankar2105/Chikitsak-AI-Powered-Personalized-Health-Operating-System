from pydantic import BaseModel
from typing import Optional


class SymptomTrend(BaseModel):
    symptom: str
    count: int


class SymptomTrends(BaseModel):
    top_symptoms: list[SymptomTrend]
    recent_predicted_diseases: list[str]
    total_logs_30d: int


class NutritionAvg(BaseModel):
    period_days: int
    total_entries: int
    avg_daily_calories: float
    avg_daily_protein: float
    avg_daily_carbs: float
    avg_daily_fats: float


class LabAbnormal(BaseModel):
    report: str
    abnormal_values: Optional[str] = None


class ProfileSnapshot(BaseModel):
    name: str
    age: Optional[int] = None
    gender: Optional[str] = None
    existing_conditions: Optional[str] = None
    allergies: Optional[str] = None


class HealthSummaryResponse(BaseModel):
    user_id: int
    profile: ProfileSnapshot
    symptom_trends: SymptomTrends
    nutrition_7d_avg: NutritionAvg
    active_medications: list[str]
    lab_abnormals: list[LabAbnormal]
    recurring_conditions: list[str]
    weekly_summary_text: str
    risk_flags: list[str]
