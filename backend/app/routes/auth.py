"""
Authentication Routes — register, login, refresh, logout.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from backend.app.database import get_db
from backend.app.models.user import User
from backend.app.schemas.auth import (
    RegisterRequest,
    LoginRequest,
    TokenResponse,
    RefreshRequest,
    LogoutRequest,
    MessageResponse,
)
from backend.app.services.auth_service import (
    hash_password,
    verify_password,
    create_access_token,
    create_refresh_token,
    validate_refresh_token,
    revoke_refresh_token,
)
from backend.app.logging_config import get_logger

logger = get_logger("routes.auth")

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
def register(payload: RegisterRequest, db: Session = Depends(get_db)):
    """Register a new user and return tokens."""
    existing = db.query(User).filter(User.email == payload.email).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Email already registered",
        )

    user = User(
        name=payload.name,
        email=payload.email,
        password_hash=hash_password(payload.password),
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    access_token = create_access_token(user.id)
    refresh_token = create_refresh_token(db, user.id)

    logger.info("User registered: %s (id=%d)", user.email, user.id)

    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "user": {
            "id": user.id,
            "name": user.name,
            "email": user.email,
        },
    }


@router.post("/login", response_model=TokenResponse)
def login(payload: LoginRequest, db: Session = Depends(get_db)):
    """Authenticate a user and return tokens."""
    user = db.query(User).filter(User.email == payload.email).first()

    if not user or not verify_password(payload.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    access_token = create_access_token(user.id)
    refresh_token = create_refresh_token(db, user.id)

    logger.info("User logged in: %s (id=%d)", user.email, user.id)

    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "user": {
            "id": user.id,
            "name": user.name,
            "email": user.email,
        },
    }


@router.post("/refresh", response_model=TokenResponse)
def refresh(payload: RefreshRequest, db: Session = Depends(get_db)):
    """Exchange a valid refresh token for a new access token."""
    session = validate_refresh_token(db, payload.refresh_token)

    # Issue new access token (refresh token stays the same)
    access_token = create_access_token(session.user_id)
    user = db.query(User).filter(User.id == session.user_id).first()

    return {
        "access_token": access_token,
        "refresh_token": payload.refresh_token,
        "user": {
            "id": user.id,
            "name": user.name,
            "email": user.email,
        },
    }


@router.post("/logout", response_model=MessageResponse)
def logout(payload: LogoutRequest, db: Session = Depends(get_db)):
    """Revoke a refresh token to log the user out."""
    revoke_refresh_token(db, payload.refresh_token)
    return {"message": "Logged out successfully"}
