import os

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../../"))
NUTRITION_PATH = os.path.join(BASE_DIR, "datasets", "nutrition", "usda_food_data.csv")

_nutrition_df = None


def _get_nutrition_df():
    global _nutrition_df
    if _nutrition_df is not None:
        return _nutrition_df

    if not os.path.exists(NUTRITION_PATH):
        from backend.app.logging_config import get_logger
        get_logger("ml_models.nutrition_engine").warning(f"Engine data absent: {NUTRITION_PATH}")
        return None

    try:
        import pandas as pd
        _nutrition_df = pd.read_csv(NUTRITION_PATH)
        _nutrition_df.columns = [c.lower() for c in _nutrition_df.columns]
    except Exception as e:
        from backend.app.logging_config import get_logger
        get_logger("ml_models.nutrition_engine").error("Data load failed: %s", e)

    return _nutrition_df


def analyze_food(food_name):
    nutrition_df = _get_nutrition_df()
    if nutrition_df is None:
        return {"error": "Food database unavailable"}

    match = nutrition_df[nutrition_df["food"].str.lower() == food_name.lower()]

    if match.empty:
        return {"error": "Food not found"}

    row = match.iloc[0]

    return {
        "calories": row["calories"],
        "protein": row["protein"],
        "carbs": row["carbohydrates"],
        "fat": row["fat"]
    }
