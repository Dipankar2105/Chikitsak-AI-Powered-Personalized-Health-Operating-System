import os
import pandas as pd
import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import Dataset, DataLoader
from torchvision import transforms, models
from PIL import Image
from tqdm import tqdm

# ─────────────────────────────────────────
# PATH SETUP
# ─────────────────────────────────────────

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../"))

TRAIN_IMAGE_DIR = os.path.join(
    BASE_DIR,
    "datasets/image/isic2016/ISBI2016_ISIC_Part3_Training_Data"
)

TEST_IMAGE_DIR = os.path.join(
    BASE_DIR,
    "datasets/image/isic2016/ISBI2016_ISIC_Part3_Test_Data"
)

TRAIN_CSV = os.path.join(
    BASE_DIR,
    "datasets/image/isic2016/ISBI2016_ISIC_Part3_Training_GroundTruth.csv"
)

TEST_CSV = os.path.join(
    BASE_DIR,
    "datasets/image/isic2016/ISBI2016_ISIC_Part3_Test_GroundTruth.csv"
)

MODEL_SAVE_PATH = os.path.join(
    BASE_DIR,
    "backend/app/ml_models/isic_model.pth"
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
# CUSTOM DATASET
# ─────────────────────────────────────────

class ISICDataset(Dataset):
    def __init__(self, image_dir, csv_file, transform=None):
        self.image_dir = image_dir
        self.data = pd.read_csv(csv_file)
        self.transform = transform

    def __len__(self):
        return len(self.data)

    def __getitem__(self, idx):
        image_id = str(self.data.iloc[idx, 0])
        label_value = self.data.iloc[idx, 1]

        # Convert label properly
        if isinstance(label_value, str):
            label_value = label_value.strip().lower()
            if label_value in ["1", "1.0", "malignant"]:
                label = 1
            else:
                label = 0
        else:
            label = int(float(label_value))

        image_path = os.path.join(self.image_dir, image_id + ".jpg")
        image = Image.open(image_path).convert("RGB")

        if self.transform:
            image = self.transform(image)

        return image, torch.tensor(label, dtype=torch.long)

# ─────────────────────────────────────────
# DATA LOADERS
# ─────────────────────────────────────────

train_dataset = ISICDataset(TRAIN_IMAGE_DIR, TRAIN_CSV, transform)
test_dataset = ISICDataset(TEST_IMAGE_DIR, TEST_CSV, transform)

train_loader = DataLoader(train_dataset, batch_size=BATCH_SIZE, shuffle=True, num_workers=0)
test_loader = DataLoader(test_dataset, batch_size=BATCH_SIZE, shuffle=False, num_workers=0)

# ─────────────────────────────────────────
# MODEL
# ─────────────────────────────────────────

model = models.resnet18(weights="IMAGENET1K_V1")
model.fc = nn.Linear(model.fc.in_features, 2)
model = model.to(device)

criterion = nn.CrossEntropyLoss()
optimizer = optim.Adam(model.parameters(), lr=LR)

best_acc = 0.0

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

    # ───────── TEST EVALUATION ─────────

    model.eval()
    test_correct = 0
    test_total = 0

    with torch.no_grad():
        for images, labels in test_loader:
            images = images.to(device)
            labels = labels.to(device)

            outputs = model(images)
            _, predicted = torch.max(outputs, 1)

            test_total += labels.size(0)
            test_correct += (predicted == labels).sum().item()

    test_acc = test_correct / test_total

    print(f"\nEpoch {epoch+1}: Train Acc = {train_acc:.4f} | Test Acc = {test_acc:.4f}")

    if test_acc > best_acc:
        best_acc = test_acc
        torch.save(model.state_dict(), MODEL_SAVE_PATH)
        print("Best model saved.")

print("\nTraining complete.")
print("Best Test Accuracy:", best_acc)