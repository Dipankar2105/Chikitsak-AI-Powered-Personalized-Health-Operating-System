import os
import torch
import torch.nn as nn
import torch.optim as optim
from torchvision import datasets, transforms, models
from torch.utils.data import DataLoader
from tqdm import tqdm

# ─────────────────────────────────────────
# PATH SETUP (IMPORTANT)
# ─────────────────────────────────────────

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../"))

DATASET_PATH = os.path.join(
    BASE_DIR,
    "datasets/image/chest_xray/chest_xray/train"
)

VAL_PATH = os.path.join(
    BASE_DIR,
    "datasets/image/chest_xray/chest_xray/val"
)

MODEL_SAVE_PATH = os.path.join(
    BASE_DIR,
    "backend/app/ml_models/xray_model.pth"
)

os.makedirs(os.path.dirname(MODEL_SAVE_PATH), exist_ok=True)

# ─────────────────────────────────────────
# CONFIG
# ─────────────────────────────────────────

BATCH_SIZE = 32
EPOCHS = 6
LR = 0.0005

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
print("Using device:", device)

torch.backends.cudnn.benchmark = True

# ─────────────────────────────────────────
# TRANSFORMS
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
# DATASETS
# ─────────────────────────────────────────

train_dataset = datasets.ImageFolder(DATASET_PATH, transform=transform)
val_dataset = datasets.ImageFolder(VAL_PATH, transform=transform)

train_loader = DataLoader(train_dataset, batch_size=BATCH_SIZE, shuffle=True, num_workers=0)
val_loader = DataLoader(val_dataset, batch_size=BATCH_SIZE, shuffle=False, num_workers=0)

print("Classes:", train_dataset.classes)

# ─────────────────────────────────────────
# MODEL
# ─────────────────────────────────────────

model = models.resnet18(weights="IMAGENET1K_V1")
model.fc = nn.Linear(model.fc.in_features, 2)
model = model.to(device)

criterion = nn.CrossEntropyLoss()
optimizer = optim.Adam(model.parameters(), lr=LR)

best_val_acc = 0.0

# ─────────────────────────────────────────
# TRAINING LOOP
# ─────────────────────────────────────────

for epoch in range(EPOCHS):
    model.train()
    train_correct = 0
    train_total = 0

    loop = tqdm(train_loader)

    for images, labels in loop:
        images = images.to(device)
        labels = labels.to(device)

        optimizer.zero_grad()

        outputs = model(images)
        loss = criterion(outputs, labels)

        loss.backward()
        optimizer.step()

        _, predicted = torch.max(outputs, 1)
        train_total += labels.size(0)
        train_correct += (predicted == labels).sum().item()

        loop.set_description(f"Epoch [{epoch+1}/{EPOCHS}]")
        loop.set_postfix(loss=loss.item())

    train_acc = train_correct / train_total

    # ───────── VALIDATION ─────────

    model.eval()
    val_correct = 0
    val_total = 0

    with torch.no_grad():
        for images, labels in val_loader:
            images = images.to(device)
            labels = labels.to(device)

            outputs = model(images)
            _, predicted = torch.max(outputs, 1)

            val_total += labels.size(0)
            val_correct += (predicted == labels).sum().item()

    val_acc = val_correct / val_total

    print(f"\nEpoch {epoch+1}: Train Acc = {train_acc:.4f} | Val Acc = {val_acc:.4f}")

    if val_acc > best_val_acc:
        best_val_acc = val_acc
        torch.save(model.state_dict(), MODEL_SAVE_PATH)
        print("Best model saved.")

print("\nTraining complete.")
print("Best Validation Accuracy:", best_val_acc)