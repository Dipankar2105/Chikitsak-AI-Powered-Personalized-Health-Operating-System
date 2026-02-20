from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class LabReportCreate(BaseModel):
    user_id: int
    report_name: str
    abnormal_values: Optional[str] = None


class LabReportResponse(BaseModel):
    id: int
    user_id: int
    report_name: str
    abnormal_values: Optional[str] = None
    timestamp: datetime

    class Config:
        from_attributes = True
