"""
Mental Health Route — emotion analysis with auth and DB logging.
"""

from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session

from backend.app.database import get_db
from backend.app.models.user import User
from backend.app.models.chat_history import ChatHistory
from backend.app.services.auth_service import get_current_user
from backend.app.ml_models.mental_engine import analyze_mental_state
from backend.app.logging_config import get_logger

logger = get_logger("routes.mental")

router = APIRouter(prefix="/mental", tags=["Mental Health"])


class MentalRequest(BaseModel):
    text: str


@router.post("/analyze")
def analyze(
    request: MentalRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Analyze mental state from text. Authenticated, logged to DB."""
    result = analyze_mental_state(request.text)

    # Persist analysis to chat history for longitudinal tracking
    entry = ChatHistory(
        user_id=current_user.id,
        role="system",
        content=request.text,
        session_id=None,
        metadata_={
            "type": "mental_analysis",
            "emotion": result.get("emotion"),
            "confidence": result.get("confidence"),
            "severity_level": result.get("severity_level"),
        },
    )
    db.add(entry)
    db.commit()

    logger.info("Mental analysis for user %d: %s", current_user.id, result.get("emotion"))
    return result