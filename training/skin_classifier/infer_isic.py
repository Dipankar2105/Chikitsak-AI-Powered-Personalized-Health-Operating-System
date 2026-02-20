import os
import torch
import torch.nn as nn
from torchvision import transforms, models
from PIL import Image

# ─────────────────────────────────────────
# PATHS
# ─────────────────────────────────────────

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../"))

MODEL_PATH = os.path.join(
    BASE_DIR,
    "backend/app/ml_models/isic_model.pth"
)

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
print("Using device:", device)

# ─────────────────────────────────────────
# CLASS LABELS
# ─────────────────────────────────────────

class_names = ["benign", "malignant"]

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

model = models.resnet18(weights=None)
model.fc = nn.Linear(model.fc.in_features, 2)

# Safe loading (new PyTorch style)
state_dict = torch.load(MODEL_PATH, map_location=device, weights_only=True)
model.load_state_dict(state_dict)

model = model.to(device)
model.eval()

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

    return {
        "prediction": class_names[predicted.item()],
        "confidence": round(confidence.item(), 4)
    }

# ─────────────────────────────────────────
# TEST RUN
# ─────────────────────────────────────────

if __name__ == "__main__":
    test_image = r"D:\Programming\Programming_codes\Projects\chikitsak\datasets\image\isic2016\ISBI2016_ISIC_Part3_Test_Data\ISIC_0000023.jpg"
    result = predict(test_image)
    print(result)