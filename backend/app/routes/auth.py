"""
Authentication Routes — register, login, refresh, logout, change-password.
"""

from fastapi import APIRouter, Depends, HTTPException, status, Request
from pydantic import BaseModel
from sqlalchemy.orm import Session
from datetime import datetime, timezone, timedelta

from backend.app.database import get_db
from backend.app.models.user import User
from backend.app.config import get_settings
from backend.app.rate_limit import rate_limiters
from backend.app.schemas.auth import (
    RegisterRequest,
    LoginRequest,
    TokenResponse,
    RefreshRequest,
    LogoutRequest,
    MessageResponse,
    PasswordResetRequest,
    PasswordResetConfirm,
)
from backend.app.services.auth_service import (
    hash_password,
    verify_password,
    create_access_token,
    create_refresh_token,
    validate_refresh_token,
    revoke_refresh_token,
    revoke_all_user_sessions,
    get_current_user,
    validate_password_strength,
    create_password_reset_token,
    validate_password_reset_token,
    reset_password,
)
from backend.app.logging_config import get_logger

logger = get_logger("routes.auth")
settings = get_settings()

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
def register(payload: RegisterRequest, db: Session = Depends(get_db)):
    """Register a new user, initialize health profile, and return tokens."""
    
    # Validate password strength
    is_strong, error = validate_password_strength(payload.password)
    if not is_strong:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=error,
        )
    
    existing = db.query(User).filter(User.email == payload.email).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Email already registered",
        )

    try:
        user = User(
            name=payload.name,
            email=payload.email,
            password_hash=hash_password(payload.password),
        )
        user.city = getattr(payload, 'city', None)
        user.country = getattr(payload, 'country', None)
        
        db.add(user)
        db.commit()
        db.refresh(user)

        # Initialize health profile for new user
        try:
            from backend.app.services.health_profile_service import initialize_health_profile
            initialize_health_profile(db, user)
        except Exception as e:
            logger.warning("Failed to initialize health profile for user %d: %s", user.id, e)

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
    except Exception as e:
        import traceback
        logger.error(f"Registration Error: {str(e)}")
        logger.error(traceback.format_exc())
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Registration failed: {str(e)}"
        )


@router.post("/login", response_model=TokenResponse)
def login(payload: LoginRequest, db: Session = Depends(get_db), request: Request = None):
    """Authenticate a user and return tokens."""
    
    # Rate limiting on auth endpoints
    if settings.RATE_LIMIT_ENABLED and request:
        client_id = request.client.host if request.client else "unknown"
        allowed, retry_after = rate_limiters.is_allowed('auth', client_id)
        if not allowed:
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail=f"Too many login attempts. Please try again in {retry_after} seconds",
            )
    
    user = db.query(User).filter(User.email == payload.email).first()
    
    # Check if account is locked
    if user and user.account_locked:
        if user.account_locked_until and user.account_locked_until > datetime.now(timezone.utc):
            unlock_time = user.account_locked_until.strftime("%H:%M:%S")
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Account is locked. Try again after {unlock_time} UTC",
            )
        else:
            # Auto-unlock if lockout period expired
            user.account_locked = False
            user.account_locked_until = None
            user.failed_login_attempts = 0
            db.commit()
    
    # Check password
    if not user or not verify_password(payload.password, user.password_hash):
        # Increment failed login attempts
        if user:
            user.failed_login_attempts = (user.failed_login_attempts or 0) + 1
            
            # Lock account if max attempts exceeded
            if user.failed_login_attempts >= settings.MAX_LOGIN_ATTEMPTS:
                user.account_locked = True
                user.account_locked_until = datetime.now(timezone.utc) + timedelta(
                    minutes=settings.ACCOUNT_LOCKOUT_DURATION_MINUTES
                )
                db.commit()
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail=f"Too many failed login attempts. Account locked for {settings.ACCOUNT_LOCKOUT_DURATION_MINUTES} minutes",
                )
            
            db.commit()
        
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )
    
    # Successful login - reset failed attempts and update last login
    user.failed_login_attempts = 0
    user.last_login = datetime.now(timezone.utc)
    if request and request.client:
        user.last_login_ip = request.client.host
    db.commit()

    access_token = create_access_token(user.id)
    refresh_token = create_refresh_token(db, user.id)

    logger.info("User logged in: %s (id=%d) from %s", 
                user.email, user.id, request.client.host if request and request.client else "unknown")

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


class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str


@router.post("/change-password", response_model=MessageResponse)
def change_password(
    payload: ChangePasswordRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Change password for the authenticated user."""
    if not verify_password(payload.current_password, current_user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Current password is incorrect",
        )

    is_strong, error = validate_password_strength(payload.new_password)
    if not is_strong:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=error,
        )

    current_user.password_hash = hash_password(payload.new_password)
    db.commit()

    # Revoke all other sessions for security
    revoke_all_user_sessions(db, current_user.id)

    logger.info("Password changed for user %d", current_user.id)
    return {"message": "Password changed successfully"}


@router.post("/forgot-password", response_model=MessageResponse)
def forgot_password(
    payload: PasswordResetRequest,
    db: Session = Depends(get_db),
):
    """
    Request a password reset token. Token is sent via email.
    Returns generic message for security (user doesn't know if email exists).
    """
    # Rate limiting
    if settings.RATE_LIMIT_ENABLED:
        # In production, get client IP from request
        allowed, retry_after = rate_limiters.is_allowed('auth', payload.email)
        if not allowed:
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail=f"Too many password reset attempts. Try again in {retry_after} seconds",
            )
    
    user = db.query(User).filter(User.email == payload.email).first()
    
    if not user:
        # Return generic message for security
        logger.info("Password reset requested for non-existent email: %s", payload.email)
        return {"message": "If email exists, password reset link will be sent"}
    
    # Generate reset token
    reset_token = create_password_reset_token(db, user.id, token_lifetime_hours=1)
    
    # TODO: Send email with reset token
    # In production, send: /reset-password?token={reset_token}
    logger.info("Password reset email queued for user: %s", user.email)
    
    return {"message": "If email exists, password reset link will be sent"}


@router.post("/reset-password", response_model=MessageResponse)
def reset_password_endpoint(
    payload: PasswordResetConfirm,
    db: Session = Depends(get_db),
):
    """
    Confirm password reset with token and new password.
    """
    success, message = reset_password(db, payload.token, payload.new_password)
    
    if not success:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=message,
        )
    
    logger.info("Password reset completed via token")
    return {"message": message}


