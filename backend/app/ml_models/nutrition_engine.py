import os
import pandas as pd
from backend.app.logging_config import get_logger

logger = get_logger("ml_models.nutrition_engine")

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../../"))
USDA_DIR = os.path.join(BASE_DIR, "datasets", "nutrition", "usda")

_nutrition_df = None


def _get_nutrition_df():
    global _nutrition_df
    if _nutrition_df is not None:
        return _nutrition_df

    if not os.path.exists(USDA_DIR):
        logger.warning(f"USDA data directory absent: {USDA_DIR}")
        return None

    try:
        combined_dfs = []
        for i in range(1, 6):
            file_path = os.path.join(USDA_DIR, f"FOOD-DATA-GROUP{i}.csv")
            if os.path.exists(file_path):
                df = pd.read_csv(file_path)
                # Map columns to standard format
                # Expecting: food, Caloric Value, Fat, Protein, Carbohydrates
                column_map = {
                    "food": "food",
                    "Caloric Value": "calories",
                    "Protein": "protein",
                    "Carbohydrates": "carbohydrates",
                    "Fat": "fat"
                }
                # Keep only what we need and rename
                available_cols = [c for c in column_map.keys() if c in df.columns]
                df = df[available_cols].rename(columns=column_map)
                combined_dfs.append(df)
            else:
                logger.debug(f"Group file missing: {file_path}")

        if combined_dfs:
            _nutrition_df = pd.concat(combined_dfs, ignore_index=True)
            _nutrition_df["food"] = _nutrition_df["food"].str.lower()
            logger.info(f"Loaded {len(_nutrition_df)} food items from USDA groups")
        else:
            logger.warning("No USDA group files found")

    except Exception as e:
        logger.error("Nutrition data load failed: %s", e)

    return _nutrition_df


def analyze_food(food_name):
    """
    Look up nutrition data for a food name.
    """
    nutrition_df = _get_nutrition_df()
    if nutrition_df is None:
        return {"error": "Food database unavailable"}

    food_name = food_name.lower().strip()
    match = nutrition_df[nutrition_df["food"] == food_name]

    if match.empty:
        # Try partial match if exact fails
        match = nutrition_df[nutrition_df["food"].str.contains(food_name, regex=False)]
        if match.empty:
            return {"error": "Food not found"}

    # Take the first best match
    row = match.iloc[0]

    return {
        "calories": float(row.get("calories", 0)),
        "protein": float(row.get("protein", 0)),
        "carbs": float(row.get("carbohydrates", 0)),
        "fat": float(row.get("fat", 0))
    }
