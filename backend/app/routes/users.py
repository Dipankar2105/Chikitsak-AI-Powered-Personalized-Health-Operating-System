from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from backend.app.services.auth_service import hash_password, get_current_user

from backend.app.database import get_db
from backend.app.models.user import User
from backend.app.schemas.user import UserCreate, UserResponse
from backend.app.services.health_summary_service import generate_health_intelligence
from backend.app.schemas.health_summary_service import HealthIntelligenceResponse

router = APIRouter(prefix="/users", tags=["Users"])


@router.post("/", response_model=UserResponse)
def create_user(user: UserCreate, db: Session = Depends(get_db)):
    """Create a new user."""
    existing = db.query(User).filter(User.email == user.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    db_user = User(
        name=user.name,
        email=user.email,
        password_hash=hash_password(user.password),
        age=user.age,
        gender=user.gender,
        existing_conditions=user.existing_conditions,
        allergies=user.allergies,
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user


# NOTE: /me MUST come before /{user_id} to prevent FastAPI from
# interpreting the literal string "me" as an integer path parameter.
@router.get("/me", response_model=UserResponse)
def read_current_user(current: User = Depends(get_current_user)):
    """Return the currently authenticated user."""
    return current


@router.get("/{user_id}", response_model=UserResponse)
def get_user(user_id: int, db: Session = Depends(get_db)):
    """Get a user by ID."""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user


@router.get("/{user_id}/health-summary", response_model=HealthIntelligenceResponse)
def get_user_health_summary(user_id: int, db: Session = Depends(get_db)):
    """
    Health Intelligence Engine — analyses symptom, nutrition, and medication
    logs to produce risk score, recurring conditions, nutrition/medication
    patterns, and a text summary.
    """
    result = generate_health_intelligence(db, user_id)
    if "error" in result:
        raise HTTPException(status_code=404, detail=result["error"])
    return result
