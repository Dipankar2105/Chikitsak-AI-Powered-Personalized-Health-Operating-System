from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class SymptomLogCreate(BaseModel):
    user_id: int
    symptoms: list[str]
    predicted_disease: Optional[str] = None
    triage_level: Optional[str] = None


class SymptomLogResponse(BaseModel):
    id: int
    user_id: int
    symptoms: list[str]
    predicted_disease: Optional[str] = None
    triage_level: Optional[str] = None
    timestamp: datetime

    class Config:
        from_attributes = True

