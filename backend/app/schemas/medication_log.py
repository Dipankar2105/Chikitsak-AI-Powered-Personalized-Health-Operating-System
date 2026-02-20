from pydantic import BaseModel
from datetime import datetime


class MedicationLogCreate(BaseModel):
    user_id: int
    medication_name: str


class MedicationLogResponse(BaseModel):
    id: int
    user_id: int
    medication_name: str
    timestamp: datetime

    class Config:
        from_attributes = True
