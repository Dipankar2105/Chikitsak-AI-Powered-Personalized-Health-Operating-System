from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class NutritionLogCreate(BaseModel):
    user_id: int
    food_name: str
    calories: Optional[float] = None
    protein: Optional[float] = None
    carbs: Optional[float] = None
    fats: Optional[float] = None


class NutritionLogResponse(BaseModel):
    id: int
    user_id: int
    food_name: str
    calories: Optional[float] = None
    protein: Optional[float] = None
    carbs: Optional[float] = None
    fats: Optional[float] = None
    timestamp: datetime

    class Config:
        from_attributes = True
