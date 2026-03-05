"""
MRI Service — Brain tumor detection using ResNet18.

Model: brain_mri_model.pth (ResNet18, 2 classes: no_tumor / tumor)
Trained on: datasets/image/brain_mri/brain_tumor_dataset (ImageFolder with no/ and yes/ subdirs)
"""

import io
from PIL import Image
from pathlib import Path
from backend.app.logging_config import get_logger

logger = get_logger("services.mri_service")

# ─────────────────────────────────────────────────────────────────────────
# Configuration
# ─────────────────────────────────────────────────────────────────────────

MODEL_PATH = Path(Path(__file__).parent.parent, "ml_models", "brain_mri_model.pth")
CLASSES = ["NO_TUMOR", "TUMOR"]

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
        logger.error("Brain MRI model not found at %s", MODEL_PATH.resolve())
        raise FileNotFoundError(f"Model file not found: {MODEL_PATH}")

    import torch
    import torch.nn as nn
    from torchvision import models

    device = get_device()
    logger.info("Loading Brain MRI model from %s...", MODEL_PATH)
    try:
        model = models.resnet18(weights=None)
        model.fc = nn.Linear(model.fc.in_features, 2)

        state_dict = torch.load(MODEL_PATH, map_location=device, weights_only=True)
        model.load_state_dict(state_dict)

        model.to(device)
        model.eval()

        _model_instance = model
        logger.info("Brain MRI model loaded successfully on %s", device)
        return model
    except Exception as e:
        logger.error("Failed to load Brain MRI model: %s", e)
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


def predict_mri(image_bytes: bytes) -> dict:
    """Run inference on a brain MRI image."""
    import torch

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

        # Risk logic
        if prediction == "TUMOR":
            if confidence_value > 0.80:
                risk = "High"
                recommendation = "Brain anomaly detected with high confidence. Immediate neurological consultation recommended."
            elif confidence_value > 0.60:
                risk = "Moderate"
                recommendation = "Possible brain anomaly detected. Further imaging and specialist evaluation advised."
            else:
                risk = "Low-Moderate"
                recommendation = "Uncertain detection. Consider repeat scan or specialist review."
        else:
            risk = "Low"
            recommendation = "No brain anomaly detected. Continue routine monitoring if symptomatic."

        result = {
            "prediction": prediction,
            "confidence": round(confidence_value, 4),
            "risk_level": risk,
            "recommendation": recommendation,
        }

        logger.info("Brain MRI analyzed: %s (%.2f%%)", prediction, confidence_value * 100)
        return result

    except Exception as e:
        logger.error("Error during Brain MRI inference: %s", e)
        raise e
