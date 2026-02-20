from fastapi import APIRouter
from pydantic import BaseModel
from typing import List, Optional, Dict

from backend.app.services.health_orchestrator import run_full_health_analysis

router = APIRouter(prefix="/full-health", tags=["Unified Health Intelligence"])

class FullHealthRequest(BaseModel):
    symptoms: Optional[List[str]] = None
    lab_values: Optional[Dict[str, float]] = None
    medications: Optional[List[str]] = None
    mental_text: Optional[str] = None
    food: Optional[str] = None
    user_query: Optional[str] = None

@router.post("/analyze")
def analyze(request: FullHealthRequest):
    return run_full_health_analysis(request.model_dump())