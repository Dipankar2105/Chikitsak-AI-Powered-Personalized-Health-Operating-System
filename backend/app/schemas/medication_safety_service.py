from pydantic import BaseModel


class MedicationSafetyRequest(BaseModel):
    user_id: int
    medications: list[str]


class InteractionWarning(BaseModel):
    type: str
    detail: str


class AllergyWarning(BaseModel):
    medication: str
    matched_allergy: str
    severity: str
    message: str


class ConditionConflict(BaseModel):
    medication: str
    condition: str
    reason: str


class MedicationSafetyResponse(BaseModel):
    risk_level: str
    interaction_warnings: list[InteractionWarning]
    allergy_warnings: list[AllergyWarning]
    condition_conflicts: list[ConditionConflict]
    recommendation: str
