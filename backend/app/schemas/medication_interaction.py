from pydantic import BaseModel
from typing import Optional


class MedicationCheckRequest(BaseModel):
    medications: list[str]
    allergies: Optional[str] = None


class InteractionWarning(BaseModel):
    drug_a: str
    drug_b: str
    severity: str
    description: str


class AllergyConflict(BaseModel):
    medication: str
    allergy: str
    warning: str


class MedicationCheckResponse(BaseModel):
    interactions: list[InteractionWarning]
    allergy_conflicts: list[AllergyConflict]
    total_warnings: int
