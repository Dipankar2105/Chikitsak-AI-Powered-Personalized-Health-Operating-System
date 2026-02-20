from fastapi import APIRouter
from pydantic import BaseModel
from typing import List

from backend.app.ml_models.drug_engine import check_drug_interactions

router = APIRouter(prefix="/drug", tags=["Medication Interactions"])


class DrugRequest(BaseModel):
    medications: List[str]


@router.post("/check")
def check_interactions(request: DrugRequest):
    return check_drug_interactions(request.medications)