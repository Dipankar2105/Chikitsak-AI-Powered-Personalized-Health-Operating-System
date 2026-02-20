from pydantic import BaseModel
from typing import Optional


class SymptomFrequencyItem(BaseModel):
    symptom: str
    count: int


class NutritionSummaryResponse(BaseModel):
    period_days: int
    total_entries: int
    avg_daily_calories: float
    avg_daily_protein: float
    avg_daily_carbs: float
    avg_daily_fats: float


class TimelineEvent(BaseModel):
    type: str
    description: str
    detail: Optional[str] = None
    timestamp: Optional[str] = None
