import os
import joblib
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import classification_report
from sklearn.model_selection import train_test_split

# ─────────────────────────────────────────
# PATHS
# ─────────────────────────────────────────

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../"))
TRAIN_PATH = os.path.join(BASE_DIR, "datasets", "mental_health", "train.txt")
MODEL_SAVE_PATH = os.path.join(BASE_DIR, "backend", "app", "ml_models", "mental_model.pkl")

# ─────────────────────────────────────────
# LOAD DATA
# ─────────────────────────────────────────

data = []

with open(TRAIN_PATH, "r", encoding="utf-8") as f:
    for line in f:
        text, label = line.strip().split(";")
        data.append((text, label))

df = pd.DataFrame(data, columns=["text", "label"])

X_train, X_test, y_train, y_test = train_test_split(
    df["text"], df["label"], test_size=0.2, random_state=42
)

# ─────────────────────────────────────────
# TF-IDF + Logistic Regression
# ─────────────────────────────────────────

vectorizer = TfidfVectorizer(stop_words="english")
X_train_vec = vectorizer.fit_transform(X_train)
X_test_vec = vectorizer.transform(X_test)

model = LogisticRegression(max_iter=1000)
model.fit(X_train_vec, y_train)

y_pred = model.predict(X_test_vec)

print("\nClassification Report:\n")
print(classification_report(y_test, y_pred))

# Save both vectorizer and model
joblib.dump((vectorizer, model), MODEL_SAVE_PATH)

print("\nMental health model saved at:", MODEL_SAVE_PATH)