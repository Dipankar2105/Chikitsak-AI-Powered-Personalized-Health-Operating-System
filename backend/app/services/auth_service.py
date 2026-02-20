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
