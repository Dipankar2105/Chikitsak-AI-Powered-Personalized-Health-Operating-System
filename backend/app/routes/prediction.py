# backend/app/routes/prediction.py

from fastapi import APIRouter, UploadFile, File, HTTPException
from backend.app.services.xray_service import predict_xray as model_predict_xray
from backend.app.services.model_services import simple_image_heuristic_prediction
from backend.app.logging_config import get_logger

router = APIRouter(prefix="/predict", tags=["Prediction"])

logger = get_logger("routes.predict")


@router.post("/mri")
async def predict_mri(file: UploadFile = File(...)):
    contents = await file.read()
    try:
        return simple_image_heuristic_prediction(contents)
    except Exception as e:
        logger.error("MRI prediction error: %s", e)
        raise HTTPException(status_code=500, detail="MRI prediction failed")


@router.post("/xray")
async def predict_xray(file: UploadFile = File(...)):
    contents = await file.read()
    try:
        return model_predict_xray(contents)
    except FileNotFoundError:
        # Model not present — fallback to heuristic
        logger.warning("X-ray model missing, using heuristic fallback")
        return simple_image_heuristic_prediction(contents)
    except Exception as e:
        logger.error("X-ray prediction error: %s", e)
        raise HTTPException(status_code=500, detail="X-ray prediction failed")


@router.post("/skin")
async def predict_skin(file: UploadFile = File(...)):
    contents = await file.read()
    try:
        return simple_image_heuristic_prediction(contents)
    except Exception as e:
        logger.error("Skin prediction error: %s", e)
        raise HTTPException(status_code=500, detail="Skin prediction failed")


@router.post("/food")
async def predict_food(file: UploadFile = File(...)):
    contents = await file.read()
    try:
        return simple_image_heuristic_prediction(contents)
    except Exception as e:
        logger.error("Food prediction error: %s", e)
        raise HTTPException(status_code=500, detail="Food prediction failed")