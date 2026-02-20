from PIL import Image
import io
from backend.app.logging_config import get_logger

logger = get_logger("services.model_services")


def simple_image_heuristic_prediction(image_bytes: bytes) -> dict:
    """
    Lightweight heuristic predictor for images used where full ML models
    are not available. Returns a prediction, confidence (0-1) and a short
    recommendation. This avoids per-request heavy model loads.
    """
    try:
        image = Image.open(io.BytesIO(image_bytes)).convert("L")
        stat = list(image.getdata())
        avg = sum(stat) / len(stat) if stat else 0
        # Normalize average (0-255) to 0..1
        norm = avg / 255.0
        # Heuristic: bright images -> NORMAL, dark -> ANOMALY
        if norm > 0.5:
            pred = "NORMAL"
            confidence = round(min(max((norm - 0.5) * 2, 0.0), 1.0), 4)
            recommendation = "No obvious anomaly detected."
        else:
            pred = "ANOMALY"
            confidence = round(min(max((0.5 - norm) * 2, 0.0), 1.0), 4)
            recommendation = "Potential anomaly detected; further review recommended."

        logger.info("Heuristic image prediction: %s (conf=%.3f)", pred, confidence)
        return {"prediction": pred, "confidence": confidence, "recommendation": recommendation}
    except Exception as e:
        logger.error("Heuristic prediction failed: %s", e)
        raise
