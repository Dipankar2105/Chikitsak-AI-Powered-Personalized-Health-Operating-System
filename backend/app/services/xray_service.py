import io
from PIL import Image
from pathlib import Path
from backend.app.logging_config import get_logger

logger = get_logger("services.xray_service")

# ─────────────────────────────────────────────────────────────────────────
# Configuration
# ─────────────────────────────────────────────────────────────────────────

MODEL_PATH = Path(Path(__file__).parent.parent.parent.parent, "training", "xray_classifier", "xray_model.pth")
CLASSES = ["NORMAL", "PNEUMONIA"]

_model_instance = None
_device = None


def get_device():
    global _device
    if _device is None:
        import torch
        _device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    return _device


def load_model():
    """Singleton model loader with lazy imports."""
    global _model_instance
    if _model_instance is not None:
        return _model_instance

    if not MODEL_PATH.exists():
        logger.error("X-ray model not found at %s", MODEL_PATH.resolve())
        raise FileNotFoundError(f"Model file not found: {MODEL_PATH}")

    import torch
    import torch.nn as nn
    from torchvision import models

    device = get_device()
    logger.info("Loading X-ray model from %s...", MODEL_PATH)
    try:
        model = models.resnet18(weights=None)
        model.fc = nn.Linear(model.fc.in_features, 2)
        
        state_dict = torch.load(MODEL_PATH, map_location=device, weights_only=True)
        model.load_state_dict(state_dict)
        
        model.to(device)
        model.eval()
        
        _model_instance = model
        logger.info("X-ray model loaded successfully on %s", device)
        return model
    except Exception as e:
        logger.error("Failed to load X-ray model: %s", e)
        raise e


def get_transform():
    from torchvision import transforms
    return transforms.Compose([
        transforms.Resize((224, 224)),
        transforms.Grayscale(num_output_channels=3),
        transforms.ToTensor(),
        transforms.Normalize(
            [0.485, 0.456, 0.406],
            [0.229, 0.224, 0.225]
        )
    ])



def predict_xray(image_bytes: bytes) -> dict:
    """
    Run inference on a raw image byte stream.
    """
    import torch
    from PIL import Image

    model = load_model()
    device = get_device()
    transform = get_transform()
    
    try:
        image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
        image_tensor = transform(image).unsqueeze(0).to(device)

        with torch.no_grad():
            outputs = model(image_tensor)
            probabilities = torch.softmax(outputs, dim=1)
            confidence, predicted_class = torch.max(probabilities, 1)

        confidence_value = float(confidence.item())
        prediction = CLASSES[predicted_class.item()]

        # Risk Logic
        if prediction == "PNEUMONIA":
            if confidence_value > 0.80:
                risk = "High"
                recommendation = "Immediate medical consultation recommended."
            elif confidence_value > 0.60:
                risk = "Moderate"
                recommendation = "Consult physician and monitor symptoms."
            else:
                risk = "Low-Moderate"
                recommendation = "Uncertain detection. Further evaluation advised."
        else:
            risk = "Low"
            recommendation = "No pneumonia detected. Continue regular monitoring."

        result = {
            "prediction": prediction,
            "confidence": round(confidence_value, 4),
            "risk_level": risk,
            "recommendation": recommendation,
        }
        
        logger.info("X-ray analyzed: %s (%.2f%%)", prediction, confidence_value * 100)
        return result

    except Exception as e:
        logger.error("Error during X-ray inference: %s", e)
        raise e
