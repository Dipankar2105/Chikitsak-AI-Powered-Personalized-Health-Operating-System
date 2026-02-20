from pydantic import BaseModel


class RecurringCondition(BaseModel):
    condition: str
    occurrences: int


class NutritionPattern(BaseModel):
    avg_calories: float
    avg_protein: float
    avg_carbs: float
    avg_fats: float
    flags: list[str]


class TopMedication(BaseModel):
    medication: str
    count: int


class MedicationPattern(BaseModel):
    total_entries: int
    top_medications: list[TopMedication]


class HealthIntelligenceResponse(BaseModel):
    risk_score: int
    recurring_conditions: list[RecurringCondition]
    nutrition_pattern: NutritionPattern
    medication_pattern: MedicationPattern
    summary_text: str
