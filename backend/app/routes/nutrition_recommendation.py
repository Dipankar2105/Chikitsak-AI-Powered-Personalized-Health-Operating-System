from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from backend.app.database import get_db
from backend.app.services.nutrition_recommendation import get_recommendations
from backend.app.schemas.nutrition_recommendation import NutritionRecommendationResponse

router = APIRouter(prefix="/nutrition", tags=["Nutrition Recommendations"])


@router.get("/recommendations/{user_id}", response_model=NutritionRecommendationResponse)
def nutrition_recommendations(user_id: int, db: Session = Depends(get_db)):
    """Get personalized nutrition recommendations for a user."""
    result = get_recommendations(db, user_id)
    if "error" in result:
        raise HTTPException(status_code=404, detail=result["error"])
    return result
