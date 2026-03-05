"""
Food Service — Food item recognition using ResNet18 trained on Food-101.

Model: food_model.pth (ResNet18, 101 classes from food-101 dataset)
Trained on: datasets/image/food-101/food-101/images (ImageFolder)
Note: The training froze the backbone and only trained the FC layer.
"""

import io
import os
from PIL import Image
from pathlib import Path
from backend.app.logging_config import get_logger

logger = get_logger("services.food_service")

# ─────────────────────────────────────────────────────────────────────────
# Configuration
# ─────────────────────────────────────────────────────────────────────────

MODEL_PATH = Path(Path(__file__).parent.parent, "ml_models", "food_model.pth")
BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../../"))
DATASET_PATH = os.path.join(BASE_DIR, "datasets", "image", "food-101", "food-101", "images")

_model_instance = None
_device = None
_class_names = None


def get_device():
    global _device
    if _device is None:
        import torch
        _device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    return _device


def _load_class_names():
    """Load class names from the food-101 dataset directory structure."""
    global _class_names
    if _class_names is not None:
        return _class_names

    if os.path.exists(DATASET_PATH):
        _class_names = sorted([
            d for d in os.listdir(DATASET_PATH)
            if os.path.isdir(os.path.join(DATASET_PATH, d)) and not d.startswith(".")
        ])
        logger.info("Loaded %d food class names from dataset", len(_class_names))
    else:
        logger.warning("Food dataset not found at %s, using fallback class indices", DATASET_PATH)
        _class_names = None

    return _class_names


def load_model():
    """Singleton model loader with lazy imports."""
    global _model_instance
    if _model_instance is not None:
        return _model_instance

    if not MODEL_PATH.exists():
        logger.error("Food model not found at %s", MODEL_PATH.resolve())
        raise FileNotFoundError(f"Model file not found: {MODEL_PATH}")

    import torch
    import torch.nn as nn
    from torchvision import models

    device = get_device()
    class_names = _load_class_names()
    num_classes = len(class_names) if class_names else 101

    logger.info("Loading Food model from %s (%d classes)...", MODEL_PATH, num_classes)
    try:
        model = models.resnet18(weights=None)
        model.fc = nn.Linear(model.fc.in_features, num_classes)

        state_dict = torch.load(MODEL_PATH, map_location=device, weights_only=True)
        model.load_state_dict(state_dict)

        model.to(device)
        model.eval()

        _model_instance = model
        logger.info("Food model loaded successfully on %s", device)
        return model
    except Exception as e:
        logger.error("Failed to load Food model: %s", e)
        raise e


def get_transform():
    from torchvision import transforms
    return transforms.Compose([
        transforms.Resize((224, 224)),
        transforms.ToTensor(),
        transforms.Normalize(
            [0.485, 0.456, 0.406],
            [0.229, 0.224, 0.225]
        )
    ])


def predict_food(image_bytes: bytes) -> dict:
    """Run inference on a food image to identify the item."""
    import torch

    model = load_model()
    device = get_device()
    transform = get_transform()
    class_names = _load_class_names()

    try:
        image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
        image_tensor = transform(image).unsqueeze(0).to(device)

        with torch.no_grad():
            outputs = model(image_tensor)
            probabilities = torch.softmax(outputs, dim=1)

            # Get top 3 predictions
            top3_conf, top3_idx = torch.topk(probabilities, min(3, probabilities.shape[1]))

        top_confidence = float(top3_conf[0][0].item())
        top_idx = int(top3_idx[0][0].item())
        prediction = class_names[top_idx] if class_names and top_idx < len(class_names) else f"class_{top_idx}"

        # Build top-3 list
        top_predictions = []
        for i in range(min(3, len(top3_conf[0]))):
            idx = int(top3_idx[0][i].item())
            conf = float(top3_conf[0][i].item())
            name = class_names[idx] if class_names and idx < len(class_names) else f"class_{idx}"
            top_predictions.append({
                "food": name.replace("_", " ").title(),
                "confidence": round(conf, 4),
            })

        # Also look up nutritional info if available
        nutrition_info = None
        try:
            from backend.app.ml_models.nutrition_engine import analyze_food
            nutrition_info = analyze_food(prediction.replace("_", " "))
            if "error" in nutrition_info:
                nutrition_info = None
        except Exception:
            pass

        result = {
            "prediction": prediction.replace("_", " ").title(),
            "confidence": round(top_confidence, 4),
            "top_predictions": top_predictions,
            "nutrition": nutrition_info,
        }

        logger.info("Food recognized: %s (%.2f%%)", prediction, top_confidence * 100)
        return result

    except Exception as e:
        logger.error("Error during food inference: %s", e)
        raise e
