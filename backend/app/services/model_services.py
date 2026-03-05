from PIL import Image
import io
from threading import Lock
from backend.app.logging_config import get_logger

logger = get_logger("services.model_services")

_preload_done = False
_preload_lock = Lock()


def preload_models_once() -> None:
    """
    Load all major ML models exactly once during startup.
    Safe to call multiple times.
    """
    global _preload_done
    if _preload_done:
        return

    with _preload_lock:
        if _preload_done:
            return

        loaders = [
            ("xray", "backend.app.services.xray_service", "load_model"),
            ("mri", "backend.app.services.mri_service", "load_model"),
            ("skin", "backend.app.services.skin_service", "load_model"),
            ("food", "backend.app.services.food_service", "load_model"),
            ("triage", "backend.app.ml_models.triage_infer", "_load_resources"),
            ("mental", "backend.app.ml_models.mental_engine", "_load_model"),
            ("medquad", "backend.app.ml_models.medquad_engine", "_load_engine"),
        ]

        for name, module_path, fn_name in loaders:
            try:
                module = __import__(module_path, fromlist=[fn_name])
                getattr(module, fn_name)()
                logger.info("Preloaded model: %s", name)
            except Exception as exc:
                logger.warning("Model preload skipped for %s: %s", name, exc)

        _preload_done = True


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
