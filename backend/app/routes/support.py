from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr
from typing import Optional
from backend.app.database import get_db
from backend.app.services.auth_service import get_current_user
from backend.app import models

router = APIRouter(prefix="/support", tags=["Support"])

class FeedbackCreate(BaseModel):
    name: Optional[str] = "Anonymous"
    rating: int
    comment: str

class ContactCreate(BaseModel):
    name: str
    email: EmailStr
    subject: str
    message: str

@router.post("/feedback")
def submit_feedback(feedback: FeedbackCreate, db: Session = Depends(get_db)):
    db_feedback = models.Feedback(
        name=feedback.name,
        rating=feedback.rating,
        comment=feedback.comment
    )
    db.add(db_feedback)
    db.commit()
    return {"status": "success", "message": "Feedback received"}

@router.get("/feedback")
def get_feedback(db: Session = Depends(get_db)):
    feedbacks = db.query(models.Feedback).order_by(models.Feedback.created_at.desc()).limit(10).all()
    return feedbacks

@router.post("/contact")
def submit_contact(contact: ContactCreate):
    # Log contact request or send email
    return {"status": "success", "message": "Contact request received"}
