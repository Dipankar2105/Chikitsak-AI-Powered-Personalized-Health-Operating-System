"""
Prediction Routes — ML inference for medical images with authentication.
"""

from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
from backend.app.services.xray_service import predict_xray as model_predict_xray
from backend.app.models.user import User
from backend.app.services.auth_service import get_current_user
from backend.app.logging_config import get_logger

router = APIRouter(prefix="/predict", tags=["Prediction"])

logger = get_logger("routes.predict")


@router.post("/mri")
async def predict_mri(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
):
    """Predict brain MRI anomalies using ResNet18 model."""
    contents = await file.read()
    try:
        from backend.app.services.mri_service import predict_mri as mri_predict
        return mri_predict(contents)
    except FileNotFoundError:
        raise HTTPException(status_code=503, detail="MRI model not available")
    except Exception as e:
        logger.error("MRI prediction error: %s", e)
        raise HTTPException(status_code=500, detail="MRI prediction failed")


@router.post("/xray")
async def predict_xray(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
):
    """Predict chest X-ray conditions using ResNet18 model."""
    contents = await file.read()
    try:
        return model_predict_xray(contents)
    except FileNotFoundError:
        raise HTTPException(status_code=503, detail="X-ray model not available")
    except Exception as e:
        logger.error("X-ray prediction error: %s", e)
        raise HTTPException(status_code=500, detail="X-ray prediction failed")


@router.post("/skin")
async def predict_skin(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
):
    """Predict skin lesion classification using ISIC model."""
    contents = await file.read()
    try:
        from backend.app.services.skin_service import predict_skin as skin_predict
        return skin_predict(contents)
    except FileNotFoundError:
        raise HTTPException(status_code=503, detail="Skin model not available")
    except Exception as e:
        logger.error("Skin prediction error: %s", e)
        raise HTTPException(status_code=500, detail="Skin prediction failed")


@router.post("/food")
async def predict_food(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
):
    """Predict food item from image using food recognition model."""
    contents = await file.read()
    try:
        from backend.app.services.food_service import predict_food as food_predict
        return food_predict(contents)
    except FileNotFoundError:
        raise HTTPException(status_code=503, detail="Food model not available")
    except Exception as e:
        logger.error("Food prediction error: %s", e)
        raise HTTPException(status_code=500, detail="Food prediction failed")