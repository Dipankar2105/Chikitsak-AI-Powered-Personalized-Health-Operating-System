"""
Medical Knowledge Routes — search medical knowledge base and get evidence-based answers.
"""

from fastapi import APIRouter, Depends
from pydantic import BaseModel, Field
from typing import Optional
from sqlalchemy.orm import Session

from backend.app.database import get_db
from backend.app.models.user import User
from backend.app.services.auth_service import get_current_user
from backend.app.services.medical_rag import (
    search_knowledge,
    generate_evidence_based_answer,
    get_condition_guidelines,
)
from backend.app.logging_config import get_logger

logger = get_logger("routes.medical_knowledge")

router = APIRouter(prefix="/knowledge", tags=["Medical Knowledge"])


class SearchRequest(BaseModel):
    query: str = Field(..., min_length=2, max_length=500)
    top_k: int = Field(5, ge=1, le=10)


class ExplainRequest(BaseModel):
    question: str = Field(..., min_length=2, max_length=500)


class GuidelineRequest(BaseModel):
    condition: str = Field(..., min_length=2, max_length=200)


@router.post("/search")
def search_medical_knowledge(
    req: SearchRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Search the medical knowledge base using semantic search."""
    results = search_knowledge(req.query, top_k=req.top_k)
    logger.info("Knowledge search by user %d: '%s' → %d results", current_user.id, req.query, len(results))
    return {
        "query": req.query,
        "results": results,
        "total_results": len(results),
    }


@router.post("/explain")
def explain_condition(
    req: ExplainRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get an evidence-based explanation for a medical question."""
    answer = generate_evidence_based_answer(req.question)
    logger.info("Knowledge explain by user %d: '%s'", current_user.id, req.question)
    return answer


@router.post("/guidelines")
def get_guidelines(
    req: GuidelineRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get WHO/CDC treatment guidelines for a specific condition."""
    guidelines = get_condition_guidelines(req.condition)
    logger.info("Guidelines request by user %d: '%s'", current_user.id, req.condition)
    return guidelines
