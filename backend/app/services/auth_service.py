"""
Authentication Service — JWT token management, password hashing, and session control.

Provides:
  - bcrypt password hashing (replaces insecure sha256)
  - JWT access token generation (stateless, short-lived)
  - Refresh token management (database-backed, long-lived)
  - get_current_user dependency for route protection
"""

from datetime import datetime, timedelta, timezone
import secrets
import bcrypt

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from passlib.context import CryptContext
from sqlalchemy.orm import Session

from backend.app.config import get_settings
from backend.app.database import get_db
from backend.app.models.user import User
from backend.app.models.auth_token import AuthSession
from backend.app.logging_config import get_logger

logger = get_logger("services.auth_service")
settings = get_settings()

# ─────────────────────────────────────────────────────────────────────────
# Password Hashing
# ─────────────────────────────────────────────────────────────────────────

def hash_password(password: str) -> str:
    """Hash a password using bcrypt."""
    # bcrypt maximum length is 72 bytes
    pwd_bytes = password.encode("utf-8")[:72]
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(pwd_bytes, salt)
    return hashed.decode("utf-8")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a plain password against a bcrypt hash."""
    try:
        pwd_bytes = plain_password.encode("utf-8")[:72]
        hash_bytes = hashed_password.encode("utf-8")
        return bcrypt.checkpw(pwd_bytes, hash_bytes)
    except Exception as e:
        logger.error("Password verification error: %s", e)
        return False


# ─────────────────────────────────────────────────────────────────────────
# JWT Access Token
# ─────────────────────────────────────────────────────────────────────────

def create_access_token(user_id: int) -> str:
    """Create a short-lived JWT access token."""
    expire = datetime.now(timezone.utc) + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    payload = {
        "sub": str(user_id),
        "exp": expire,
        "type": "access",
    }
    return jwt.encode(payload, settings.SECRET_KEY, algorithm=settings.ALGORITHM)


def decode_access_token(token: str) -> dict:
    """Decode and validate a JWT access token. Raises on invalid/expired."""
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        if payload.get("type") != "access":
            raise JWTError("Invalid token type")
        return payload
    except JWTError as e:
        logger.warning("Token decode failed: %s", e)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
            headers={"WWW-Authenticate": "Bearer"},
        )


# ─────────────────────────────────────────────────────────────────────────
# Refresh Token (database-backed)
# ─────────────────────────────────────────────────────────────────────────

def create_refresh_token(db: Session, user_id: int) -> str:
    """Create a secure refresh token and store it in the database."""
    token = secrets.token_urlsafe(64)
    expires_at = datetime.now(timezone.utc) + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)

    session = AuthSession(
        user_id=user_id,
        refresh_token=token,
        expires_at=expires_at,
    )
    db.add(session)
    db.commit()

    logger.info("Refresh token created for user %d", user_id)
    return token


def validate_refresh_token(db: Session, token: str) -> AuthSession:
    """Validate a refresh token. Returns the session or raises 401."""
    session = (
        db.query(AuthSession)
        .filter(AuthSession.refresh_token == token)
        .first()
    )

    if not session:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token",
        )

    if session.expires_at < datetime.now(timezone.utc):
        # Clean up expired session
        db.delete(session)
        db.commit()
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Refresh token expired",
        )

    return session


def revoke_refresh_token(db: Session, token: str) -> None:
    """Revoke (delete) a refresh token — used for logout."""
    session = (
        db.query(AuthSession)
        .filter(AuthSession.refresh_token == token)
        .first()
    )
    if session:
        db.delete(session)
        db.commit()
        logger.info("Refresh token revoked for user %d", session.user_id)


def revoke_all_user_sessions(db: Session, user_id: int) -> int:
    """Revoke all refresh tokens for a user — used for password change, account lockout."""
    count = (
        db.query(AuthSession)
        .filter(AuthSession.user_id == user_id)
        .delete()
    )
    db.commit()
    logger.info("Revoked %d sessions for user %d", count, user_id)
    return count


# ─────────────────────────────────────────────────────────────────────────
# FastAPI Dependency — get_current_user
# ─────────────────────────────────────────────────────────────────────────

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")


def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
) -> User:
    """
    FastAPI dependency to extract and validate the current user from
    the Authorization: Bearer <token> header.

    Usage:
        @router.get("/protected")
        def protected_route(user: User = Depends(get_current_user)):
            ...
    """
    payload = decode_access_token(token)
    user_id = payload.get("sub")

    if user_id is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token payload",
        )

    user = db.query(User).filter(User.id == int(user_id)).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
        )

    return user


# ─────────────────────────────────────────────────────────────────────────
# Password Validation & Reset
# ─────────────────────────────────────────────────────────────────────────

def validate_password_strength(password: str) -> tuple[bool, str]:
    """
    Validate password meets minimum security requirements.
    
    Returns: (is_valid, error_message)
    """
    if len(password) < 8:
        return False, "Password must be at least 8 characters"
    if not any(c.isupper() for c in password):
        return False, "Password must contain at least one uppercase letter"
    if not any(c.islower() for c in password):
        return False, "Password must contain at least one lowercase letter"
    if not any(c.isdigit() for c in password):
        return False, "Password must contain at least one number"
    if not any(c in "!@#$%^&*()-_=+[]{}|;:',.<>?/" for c in password):
        return False, "Password must contain at least one special character"
    return True, ""


def generate_password_reset_token() -> str:
    """Generate a secure reset token."""
    return secrets.token_urlsafe(32)


def create_password_reset_token(db: Session, user_id: int, token_lifetime_hours: int = 1) -> str:
    """
    Create a password reset token for a user.
    Old tokens are invalidated.
    """
    from backend.app.models.password_reset_token import PasswordResetToken
    
    # Invalidate old tokens
    db.query(PasswordResetToken).filter(
        PasswordResetToken.user_id == user_id,
        PasswordResetToken.is_used == False
    ).update({"is_used": True})
    
    # Create new token
    token = generate_password_reset_token()
    reset_token = PasswordResetToken(
        user_id=user_id,
        token=token,
        expires_at=datetime.now(timezone.utc) + timedelta(hours=token_lifetime_hours)
    )
    db.add(reset_token)
    db.commit()
    
    logger.info("Password reset token created for user id=%d", user_id)
    return token


def validate_password_reset_token(db: Session, token: str) -> tuple[bool, User | None]:
    """
    Validate a password reset token.
    
    Returns: (is_valid, user) or (False, None) if invalid
    """
    from backend.app.models.password_reset_token import PasswordResetToken
    
    reset_token = db.query(PasswordResetToken).filter(
        PasswordResetToken.token == token
    ).first()
    
    if not reset_token:
        return False, None
    
    if not reset_token.is_valid():
        return False, None
    
    user = reset_token.user
    return True, user


def reset_password(db: Session, token: str, new_password: str) -> tuple[bool, str]:
    """
    Reset user password using reset token.
    
    Returns: (success, message)
    """
    from backend.app.models.password_reset_token import PasswordResetToken
    
    # Validate token
    is_valid, user = validate_password_reset_token(db, token)
    if not is_valid or not user:
        return False, "Invalid or expired reset token"
    
    # Validate new password
    is_strong, error = validate_password_strength(new_password)
    if not is_strong:
        return False, error
    
    # Update password
    user.password_hash = hash_password(new_password)
    user.failed_login_attempts = 0  # Reset login attempts
    user.account_locked = False
    user.account_locked_until = None
    
    # Mark token as used
    reset_token = db.query(PasswordResetToken).filter(
        PasswordResetToken.token == token
    ).first()
    reset_token.is_used = True
    reset_token.used_at = datetime.now(timezone.utc)
    
    db.commit()
    logger.info("Password reset for user id=%d", user.id)
    return True, "Password reset successful"

