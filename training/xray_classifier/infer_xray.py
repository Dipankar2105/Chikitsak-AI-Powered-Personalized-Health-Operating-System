import os
import torch
import torch.nn as nn
from torchvision import transforms, models
from PIL import Image

# ─────────────────────────────────────────
# PATH SETUP
# ─────────────────────────────────────────

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../"))

MODEL_PATH = os.path.join(
    BASE_DIR,
    "backend/app/ml_models/xray_model.pth"
)

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
print("Using device:", device)

# ─────────────────────────────────────────
# TRANSFORM
# ─────────────────────────────────────────

transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize(
        [0.485, 0.456, 0.406],
        [0.229, 0.224, 0.225]
    )
])

# ─────────────────────────────────────────
# LOAD MODEL
# ─────────────────────────────────────────

def load_model():
    model = models.resnet18(weights=None)
    model.fc = nn.Linear(model.fc.in_features, 2)

    state_dict = torch.load(MODEL_PATH, map_location=device)
    model.load_state_dict(state_dict)

    model = model.to(device)
    model.eval()
    return model


model = load_model()

class_names = ["NORMAL", "PNEUMONIA"]

# ─────────────────────────────────────────
# PREDICTION FUNCTION
# ─────────────────────────────────────────

def predict(image_path):
    image = Image.open(image_path).convert("RGB")
    image = transform(image).unsqueeze(0).to(device)

    with torch.no_grad():
        outputs = model(image)
        probabilities = torch.softmax(outputs, dim=1)
        confidence, predicted = torch.max(probabilities, 1)

    prediction = class_names[predicted.item()]
    confidence_value = round(confidence.item(), 4)

    # Risk interpretation
    if prediction == "PNEUMONIA":
        risk = "High"
    else:
        risk = "Low"

    return {
        "prediction": prediction,
        "confidence": confidence_value,
        "risk_level": risk
    }


# ─────────────────────────────────────────
# TEST RUN
# ─────────────────────────────────────────

if __name__ == "__main__":
    test_image = "D:/Programming/Programming_codes/Projects/chikitsak/datasets/image/chest_xray/chest_xray/test/PNEUMONIA/person1_virus_12.jpeg"
    result = predict(test_image)
    print(result)