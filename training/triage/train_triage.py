import os
import pandas as pd
import joblib
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, classification_report
from sklearn.model_selection import train_test_split

# ─────────────────────────────────────────
# PATHS
# ─────────────────────────────────────────

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../"))

TRAIN_PATH = os.path.join(BASE_DIR, "datasets", "triage", "Training.csv")
MODEL_SAVE_PATH = os.path.join(BASE_DIR, "backend", "app", "ml_models", "triage_model.pkl")

os.makedirs(os.path.dirname(MODEL_SAVE_PATH), exist_ok=True)

# ─────────────────────────────────────────
# LOAD DATA
# ─────────────────────────────────────────

df = pd.read_csv(TRAIN_PATH)

# Remove unwanted unnamed columns
df = df.loc[:, ~df.columns.str.contains("^Unnamed")]

# Separate features and target
X = df.drop("prognosis", axis=1)
y = df["prognosis"]

print("Total samples:", len(df))
print("Number of diseases:", len(y.unique()))

# Train-test split (proper evaluation)
X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.2,
    random_state=42,
    stratify=y
)

print("Train size:", len(X_train))
print("Test size:", len(X_test))

# ─────────────────────────────────────────
# TRAIN MODEL
# ─────────────────────────────────────────

model = RandomForestClassifier(
    n_estimators=200,
    random_state=42,
    n_jobs=-1
)

model.fit(X_train, y_train)

# ─────────────────────────────────────────
# EVALUATE
# ─────────────────────────────────────────

y_pred = model.predict(X_test)

acc = accuracy_score(y_test, y_pred)

print("\nAccuracy:", acc)
print("\nClassification Report:\n")
print(classification_report(y_test, y_pred))

# ─────────────────────────────────────────
# SAVE MODEL
# ─────────────────────────────────────────

joblib.dump(model, MODEL_SAVE_PATH)

print("\nModel saved at:", MODEL_SAVE_PATH)