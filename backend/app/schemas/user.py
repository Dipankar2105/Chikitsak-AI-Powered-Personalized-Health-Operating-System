from pydantic import BaseModel
from typing import Optional


class UserCreate(BaseModel):
    name: str
    email: str
    password: str
    age: Optional[int] = None
    gender: Optional[str] = None
    existing_conditions: Optional[list[str]] = None
    allergies: Optional[list[str]] = None


class UserResponse(BaseModel):
    id: int
    name: str
    email: str
    age: Optional[int] = None
    gender: Optional[str] = None
    existing_conditions: Optional[list[str]] = None
    allergies: Optional[list[str]] = None

    class Config:
        from_attributes = True
