import os
import torch
import torch.nn as nn
import torch.optim as optim
from torchvision import datasets, transforms, models
from torch.utils.data import DataLoader, random_split
from tqdm import tqdm

# ─────────────────────────────────────────
# PATHS
# ─────────────────────────────────────────

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../"))

DATASET_PATH = os.path.join(
    BASE_DIR,
    "datasets/image/food-101/food-101/images"
)

MODEL_SAVE_PATH = os.path.join(
    BASE_DIR,
    "backend/app/ml_models/food_model.pth"
)

os.makedirs(os.path.dirname(MODEL_SAVE_PATH), exist_ok=True)

# ─────────────────────────────────────────
# CONFIG
# ─────────────────────────────────────────

BATCH_SIZE = 64
EPOCHS = 2   # Keep 2 for stability first
LR = 0.0003

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
print("Using device:", device)

torch.backends.cudnn.benchmark = True

# ─────────────────────────────────────────
# TRANSFORMS
# ─────────────────────────────────────────

transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.RandomHorizontalFlip(),
    transforms.ToTensor(),
    transforms.Normalize(
        [0.485, 0.456, 0.406],
        [0.229, 0.224, 0.225]
    )
])

# ─────────────────────────────────────────
# DATASET
# ─────────────────────────────────────────

dataset = datasets.ImageFolder(
    DATASET_PATH,
    transform=transform,
    is_valid_file=lambda x: not os.path.basename(x).startswith("._")
)
num_classes = len(dataset.classes)
print("Number of classes:", num_classes)

# Manual split with generator (more stable)
train_size = int(0.8 * len(dataset))
val_size = len(dataset) - train_size

generator = torch.Generator().manual_seed(42)
train_dataset, val_dataset = random_split(dataset, [train_size, val_size], generator=generator)

train_loader = DataLoader(train_dataset, batch_size=BATCH_SIZE, shuffle=True, num_workers=0)
val_loader = DataLoader(val_dataset, batch_size=BATCH_SIZE, shuffle=False, num_workers=0)

# ─────────────────────────────────────────
# MODEL (Transfer Learning)
# ─────────────────────────────────────────

model = models.resnet18(weights="IMAGENET1K_V1")

# Freeze backbone
for param in model.parameters():
    param.requires_grad = False

model.fc = nn.Linear(model.fc.in_features, num_classes)
model = model.to(device)

criterion = nn.CrossEntropyLoss()
optimizer = optim.Adam(model.fc.parameters(), lr=LR)

best_acc = 0.0

# ─────────────────────────────────────────
# TRAINING LOOP
# ─────────────────────────────────────────

for epoch in range(EPOCHS):
    model.train()
    train_correct = 0
    train_total = 0

    train_loop = tqdm(train_loader)

    for images, labels in train_loop:
        images = images.to(device)
        labels = labels.to(device)

        # SAFETY CHECK (prevents CUDA assert)
        if labels.max().item() >= num_classes:
            print("Label out of range:", labels.max().item())
            continue

        optimizer.zero_grad()
        outputs = model(images)
        loss = criterion(outputs, labels)
        loss.backward()
        optimizer.step()

        _, predicted = torch.max(outputs, 1)
        train_total += labels.size(0)
        train_correct += (predicted == labels).sum().item()

        train_loop.set_description(f"Epoch [{epoch+1}/{EPOCHS}]")
        train_loop.set_postfix(loss=loss.item())

    train_acc = train_correct / train_total

    # ───────── VALIDATION ─────────

    model.eval()
    val_correct = 0
    val_total = 0

    val_loop = tqdm(val_loader)

    with torch.no_grad():
        for images, labels in val_loop:
            images = images.to(device)
            labels = labels.to(device)

            outputs = model(images)
            _, predicted = torch.max(outputs, 1)

            val_total += labels.size(0)
            val_correct += (predicted == labels).sum().item()

    val_acc = val_correct / val_total

    print(f"\nEpoch {epoch+1}: Train Acc = {train_acc:.4f} | Val Acc = {val_acc:.4f}")

    if val_acc > best_acc:
        best_acc = val_acc
        torch.save(model.state_dict(), MODEL_SAVE_PATH)
        print("Best model saved.")

print("\nTraining complete.")
print("Best Validation Accuracy:", best_acc) 