import os
import torch
import torch.nn as nn
from torchvision import transforms, models
from PIL import Image

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../"))
MODEL_PATH = os.path.join(BASE_DIR, "backend/app/ml_models/brain_mri_model.pth")

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

model = models.resnet18(weights=None)
model.fc = nn.Linear(model.fc.in_features, 2)
model.load_state_dict(torch.load(MODEL_PATH, map_location=device))
model.to(device)
model.eval()

transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.Grayscale(num_output_channels=3),
    transforms.ToTensor(),
    transforms.Normalize(
        [0.485, 0.456, 0.406],
        [0.229, 0.224, 0.225]
    )
])

classes = ["NO_TUMOR", "TUMOR"]

def predict(image_path):
    image = Image.open(image_path).convert("RGB")
    image = transform(image).unsqueeze(0).to(device)

    with torch.no_grad():
        outputs = model(image)
        probs = torch.softmax(outputs, dim=1)
        confidence, pred = torch.max(probs, 1)

    confidence_value = float(confidence.item())
    prediction = classes[pred.item()]

    risk = "High" if prediction == "TUMOR" else "Low"

    return {
        "prediction": prediction,
        "confidence": round(confidence_value, 4),
        "risk_level": risk
    }

if __name__ == "__main__":
   result = predict("D:/Programming/Programming_codes/Projects/chikitsak/datasets/image/brain_mri/brain_tumor_dataset/yes/Y1.jpg")
   print(result)