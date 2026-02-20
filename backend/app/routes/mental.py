from fastapi import APIRouter
from pydantic import BaseModel

from backend.app.ml_models.mental_engine import analyze_mental_state

router = APIRouter(prefix="/mental", tags=["Mental Health"])

class MentalRequest(BaseModel):
    text: str

@router.post("/analyze")
def analyze(request: MentalRequest):
    return analyze_mental_state(request.text)