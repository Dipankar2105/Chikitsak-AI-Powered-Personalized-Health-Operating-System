"""
Chat Routes — Dual-mode chatbot endpoint.

POST /chat  →  Health Assistant or Mental Health Therapist
GET  /chat/history  →  Retrieve chat history for current user
"""

from fastapi import APIRouter, Depends, Query
from pydantic import BaseModel, Field
from typing import Optional, Literal
from sqlalchemy.orm import Session

from backend.app.database import get_db
from backend.app.models.user import User
from backend.app.models.chat_history import ChatHistory
from backend.app.services.auth_service import get_current_user
from backend.app.services.chat_service import process_chat
from backend.app.logging_config import get_logger

logger = get_logger("routes.chat")

router = APIRouter(prefix="/chat", tags=["Chatbot"])


class ChatRequest(BaseModel):
    message: str = Field(..., min_length=1, max_length=5000)
    mode: Literal["health", "mental"] = "health"
    language: Literal["en", "hi", "mr"] = "en"
    session_id: Optional[str] = None


class ChatResponse(BaseModel):
    mode: str
    response: str
    confidence: float
    risk_flags: list[str] = []
    session_id: str


class ChatHistoryItem(BaseModel):
    id: int
    role: str
    content: str
    session_id: Optional[str] = None
    timestamp: Optional[str] = None

    class Config:
        from_attributes = True


@router.post("", response_model=ChatResponse)
def chat(
    payload: ChatRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Send a chat message.

    - **mode=health**: General health questions, medicine suggestions, treatment guidance.
    - **mode=mental**: Empathetic responses, crisis detection, escalation support.
    """
    logger.info(
        "Chat request from user %d | mode=%s | lang=%s",
        current_user.id, payload.mode, payload.language,
    )

    result = process_chat(
        db=db,
        user_id=current_user.id,
        message=payload.message,
        mode=payload.mode,
        language=payload.language,
        session_id=payload.session_id,
    )
    return result


@router.get("/history", response_model=list[ChatHistoryItem])
def get_chat_history(
    session_id: Optional[str] = Query(None, description="Filter by session ID"),
    limit: int = Query(50, ge=1, le=200),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Retrieve chat history for the authenticated user.
    Optionally filter by session_id.
    """
    query = db.query(ChatHistory).filter(ChatHistory.user_id == current_user.id)

    if session_id:
        query = query.filter(ChatHistory.session_id == session_id)

    entries = (
        query.order_by(ChatHistory.created_at.desc())
        .limit(limit)
        .all()
    )

    return [
        {
            "id": e.id,
            "role": e.role,
            "content": e.content,
            "session_id": e.session_id,
            "timestamp": e.created_at.isoformat() if e.created_at else None,
        }
        for e in entries
    ]
