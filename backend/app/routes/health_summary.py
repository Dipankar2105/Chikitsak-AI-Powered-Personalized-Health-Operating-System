from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from backend.app.database import get_db
from backend.app.services.health_summary import generate_health_summary
from backend.app.schemas.health_summary import HealthSummaryResponse

router = APIRouter(prefix="/health-summary", tags=["Health Summary"])


@router.get("/{user_id}", response_model=HealthSummaryResponse)
def health_summary(user_id: int, db: Session = Depends(get_db)):
    """Get comprehensive health summary for a user."""
    result = generate_health_summary(db, user_id)
    if "error" in result:
        raise HTTPException(status_code=404, detail=result["error"])
    return result
