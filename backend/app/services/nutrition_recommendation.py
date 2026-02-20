from sqlalchemy.orm import Session

from backend.app.models.user import User
from backend.app.services.health_analytics import get_nutrition_summary
from backend.app.logging_config import get_logger

logger = get_logger("services.nutrition_recommendation")

# ── Baseline targets ─────────────────────────────────────────────────────
BASE_TARGETS = {
    "male":   {"calories": 2500, "protein": 56, "carbs": 300, "fats": 78},
    "female": {"calories": 2000, "protein": 46, "carbs": 250, "fats": 65},
    "default": {"calories": 2200, "protein": 50, "carbs": 275, "fats": 70},
}

AGE_MULTIPLIERS = [
    (0, 12, 0.75),
    (13, 18, 0.95),
    (19, 30, 1.0),
    (31, 50, 0.95),
    (51, 65, 0.90),
    (66, 200, 0.80),
]

CONDITION_ADJUSTMENTS = {
    "diabetes":      {"carbs": -50, "protein": 10},
    "hypertension":  {"fats": -15},
    "obesity":       {"calories": -400, "carbs": -60, "fats": -20},
    "kidney disease": {"protein": -20},
    "anemia":        {"protein": 15, "calories": 200},
    "heart disease":  {"fats": -25, "calories": -200},
}

# ── Food Lists (Allow/Avoid) ─────────────────────────────────────────────
FOOD_SUGGESTIONS = {
    "calories": ["oats", "banana", "peanut butter", "brown rice", "sweet potato"],
    "protein":  ["eggs", "chicken breast", "lentils (dal)", "paneer", "greek yogurt"],
    "carbs":    ["brown rice", "whole wheat roti", "quinoa", "sweet potato", "fruits"],
    "fats":     ["almonds", "avocado", "olive oil", "flaxseed", "ghee (moderate)"],
}

FOODS_TO_AVOID = {
    "diabetes": ["sugar", "white bread", "soda", "pastries", "white rice"],
    "hypertension": ["salty snacks", "processed meats", "canned soups", "pickles"],
    "heart disease": ["fried foods", "full-fat dairy", "red meat", "trans fats"],
    "kidney disease": ["processed meats", "dark colored sodas", "avocados (high potassium)"],
    "obesity": ["fast food", "sugary drinks", "candies", "fried snacks"],
    "gerd": ["spicy foods", "citrus fruits", "chocolate", "caffeine"],
}


def _get_age_multiplier(age: int | None) -> float:
    if age is None:
        return 1.0
    for low, high, mult in AGE_MULTIPLIERS:
        if low <= age <= high:
            return mult
    return 1.0


def _get_conditions_list(conditions) -> list[str]:
    """Normalize conditions to a list of lowercase strings."""
    if not conditions:
        return []
    if isinstance(conditions, list):
        return [c.strip().lower() for c in conditions if c.strip()]
    return [c.strip().lower() for c in conditions.split(",") if c.strip()]


def _generate_avoid_list(conditions) -> set[str]:
    """Build a set of foods to avoid based on user conditions."""
    avoid = set()
    for cond in _get_conditions_list(conditions):
        if cond in FOODS_TO_AVOID:
            avoid.update(FOODS_TO_AVOID[cond])
    return avoid


def get_daily_targets(
    age: int | None = None,
    gender: str | None = None,
    conditions=None,
) -> dict:
    key = (gender or "").strip().lower()
    if key in ("m", "male"):
        base = dict(BASE_TARGETS["male"])
    elif key in ("f", "female"):
        base = dict(BASE_TARGETS["female"])
    else:
        base = dict(BASE_TARGETS["default"])

    multiplier = _get_age_multiplier(age)
    for k in base:
        base[k] = round(base[k] * multiplier, 1)

    for cond in _get_conditions_list(conditions):
        if cond in CONDITION_ADJUSTMENTS:
            for nutrient, delta in CONDITION_ADJUSTMENTS[cond].items():
                if nutrient in base:
                    base[nutrient] = round(base[nutrient] + delta, 1)

    return base


def get_recommendations(db: Session, user_id: int) -> dict:
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        return {"error": "User not found"}

    targets = get_daily_targets(
        age=user.age,
        gender=user.gender,
        conditions=user.existing_conditions,
    )

    current = get_nutrition_summary(db, user_id, days=7)

    mapping = {
        "calories": "avg_daily_calories",
        "protein": "avg_daily_protein",
        "carbs": "avg_daily_carbs",
        "fats": "avg_daily_fats",
    }

    analysis = []
    suggestions = []

    # Calculate deficits
    for nutrient, avg_key in mapping.items():
        target_val = targets[nutrient]
        current_val = current[avg_key]
        diff = round(current_val - target_val, 1)
        status = "surplus" if diff > 0 else "deficit" if diff < 0 else "on_target"

        analysis.append({
            "nutrient": nutrient,
            "target": target_val,
            "current": current_val,
            "difference": diff,
            "status": status,
        })

        if status == "deficit" and nutrient in FOOD_SUGGESTIONS:
            suggestions.extend(
                f"Increase {nutrient}: try {food}"
                for food in FOOD_SUGGESTIONS[nutrient][:2]
            )

    # Condition-based avoid list
    avoid_list = _generate_avoid_list(user.existing_conditions)

    logger.info("Nutrition recommendations generated for user %d", user_id)

    return {
        "user_id": user_id,
        "daily_targets": targets,
        "current_7d_avg": current,
        "analysis": analysis,
        "suggestions": list(set(suggestions)),  # unique
        "foods_to_avoid": list(avoid_list),
    }

