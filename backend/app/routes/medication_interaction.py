from fastapi import APIRouter

from backend.app.services.medication_interaction import check_interactions, check_allergy_conflicts
from backend.app.schemas.medication_interaction import (
    MedicationCheckRequest,
    MedicationCheckResponse,
)

router = APIRouter(prefix="/medications", tags=["Medication Interactions"])


@router.post("/check-interactions", response_model=MedicationCheckResponse)
def check_medication_interactions(request: MedicationCheckRequest):
    """Check for drug-drug interactions and allergy conflicts."""
    interactions = check_interactions(request.medications)
    allergy_conflicts = check_allergy_conflicts(request.medications, request.allergies)

    return MedicationCheckResponse(
        interactions=interactions,
        allergy_conflicts=allergy_conflicts,
        total_warnings=len(interactions) + len(allergy_conflicts),
    )
