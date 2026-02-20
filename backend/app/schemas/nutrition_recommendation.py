from pydantic import BaseModel


class NutrientAnalysis(BaseModel):
    nutrient: str
    target: float
    current: float
    difference: float
    status: str


class DailyTargets(BaseModel):
    calories: float
    protein: float
    carbs: float
    fats: float


class CurrentAvg(BaseModel):
    period_days: int
    total_entries: int
    avg_daily_calories: float
    avg_daily_protein: float
    avg_daily_carbs: float
    avg_daily_fats: float


class NutritionRecommendationResponse(BaseModel):
    user_id: int
    daily_targets: DailyTargets
    current_7d_avg: CurrentAvg
    analysis: list[NutrientAnalysis]
    suggestions: list[str]
    foods_to_avoid: list[str]
