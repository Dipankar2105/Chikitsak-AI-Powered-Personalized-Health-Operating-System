"""
Subscription Routes — plan management and feature access checking.
"""

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from backend.app.database import get_db
from backend.app.models.user import User
from backend.app.services.auth_service import get_current_user
from backend.app.services.subscription_service import (
    get_plans, get_user_plan, check_feature_access, PlanTier,
)
from backend.app.logging_config import get_logger

logger = get_logger("routes.subscription")

router = APIRouter(prefix="/subscription", tags=["Subscription"])


class UpgradeRequest(BaseModel):
    plan: str = Field(..., description="free | pro | medical_plus")


@router.get("/plans")
def list_plans():
    """Get all available subscription plans (public endpoint)."""
    return {"plans": get_plans()}


@router.get("/current")
def current_plan(
    current_user: User = Depends(get_current_user),
):
    """Get current user's plan details."""
    plan = get_user_plan(current_user.plan_tier)
    return {
        "plan_tier": current_user.plan_tier,
        "plan_name": plan["display_name"],
        "features": plan["features"],
        "limits": plan["limits"],
        "highlights": plan["highlights"],
    }


@router.post("/upgrade")
def upgrade_plan(
    req: UpgradeRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Upgrade user's plan tier.
    In production, this would integrate with a payment gateway.
    For now, it directly updates the plan.
    """
    valid_plans = [p.value for p in PlanTier]
    if req.plan not in valid_plans:
        raise HTTPException(status_code=400, detail=f"Invalid plan: {req.plan}. Valid: {valid_plans}")

    old_plan = current_user.plan_tier
    current_user.plan_tier = req.plan
    db.commit()

    new_plan = get_user_plan(req.plan)
    logger.info("User %d upgraded: %s → %s", current_user.id, old_plan, req.plan)

    return {
        "status": "success",
        "message": f"Upgraded to {new_plan['display_name']}",
        "old_plan": old_plan,
        "new_plan": req.plan,
        "features_unlocked": new_plan["features"],
    }


@router.get("/check/{feature}")
def check_access(
    feature: str,
    current_user: User = Depends(get_current_user),
):
    """Check if user's plan allows access to a specific feature."""
    result = check_feature_access(current_user.plan_tier, feature)
    if not result["allowed"]:
        return {**result, "status": "restricted"}
    return {**result, "status": "allowed"}
