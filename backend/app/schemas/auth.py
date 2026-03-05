"""
Authentication Pydantic schemas — request/response models for auth endpoints.
"""

from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from backend.app.schemas.user import UserResponse


class RegisterRequest(BaseModel):
    name: str = Field(..., min_length=1, max_length=120)
    email: str = Field(..., min_length=5, max_length=255)
    password: str = Field(..., min_length=8, max_length=128, description="Min 8 chars, include uppercase, lowercase, number, special char")
    city: Optional[str] = None
    country: Optional[str] = None


class LoginRequest(BaseModel):
    email: str = Field(..., min_length=5, max_length=255)
    password: str = Field(..., min_length=1)


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    user: Optional[UserResponse] = None


class RefreshRequest(BaseModel):
    refresh_token: str


class LogoutRequest(BaseModel):
    refresh_token: str


class MessageResponse(BaseModel):
    message: str


class PasswordResetRequest(BaseModel):
    """Request password reset token via email."""
    email: str = Field(..., min_length=5, max_length=255, description="Email address")


class PasswordResetConfirm(BaseModel):
    """Confirm password reset with token and new password."""
    token: str = Field(..., min_length=10, description="Reset token from email")
    new_password: str = Field(..., min_length=8, max_length=128, description="New password (min 8 chars)")

