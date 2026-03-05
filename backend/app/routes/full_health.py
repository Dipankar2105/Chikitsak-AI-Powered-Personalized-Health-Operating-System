from fastapi import APIRouter, Depends
from pydantic import BaseModel
from typing import List, Optional, Dict
from sqlalchemy.orm import Session
from backend.app.database import get_db
from backend.app.services.auth_service import get_current_user
from backend.app.models.user import User
from backend.app.services.health_orchestrator import run_full_health_analysis

router = APIRouter(prefix="/full-health", tags=["Unified Health Intelligence"])

class FullHealthRequest(BaseModel):
    symptoms: Optional[List[str]] = None
    lab_values: Optional[Dict[str, float]] = None
    medications: Optional[List[str]] = None
    mental_text: Optional[str] = None
    food: Optional[str] = None
    user_query: Optional[str] = None
    language: Optional[str] = "en"
    location: Optional[str] = None

@router.post("/analyze")
def analyze(
    request: FullHealthRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return run_full_health_analysis(db, current_user.id, request.model_dump())