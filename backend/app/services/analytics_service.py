from backend.app.logging_config import get_logger

logger = get_logger("services.analytics_service")


def calculate_bmi(weight_kg: float, height_cm: float) -> str | None:
    """
    Calculate Body Mass Index (BMI).
    Formula: weight (kg) / [height (m)]^2
    """
    if height_cm <= 0 or weight_kg <= 0:
        return None

    height_m = height_cm / 100
    bmi = weight_kg / (height_m * height_m)
    return f"{bmi:.2f}"


def calculate_daily_calorie_needs(
    age: int,
    gender: str,
    weight_kg: float,
    height_cm: float,
    activity_level: str = "moderate",
) -> int:
    """
    Calculate daily calorie needs using Mifflin-St Jeor Equation.
    """
    if weight_kg <= 0 or height_cm <= 0 or age <= 0:
        return 0

    # Base BMR calculation
    # Men: 10W + 6.25H - 5A + 5
    # Women: 10W + 6.25H - 5A - 161
    bmr = (10 * weight_kg) + (6.25 * height_cm) - (5 * age)

    if gender.lower() in ["male", "m"]:
        bmr += 5
    else:
        bmr -= 161

    # Activity multipliers
    multipliers = {
        "sedentary": 1.2,
        "light": 1.375,
        "moderate": 1.55,
        "active": 1.725,
        "very_active": 1.9,
    }
    multiplier = multipliers.get(activity_level.lower(), 1.55)

    return int(bmr * multiplier)


def generate_health_score(
    age: int,
    weight_kg: float,
    height_cm: float,
    activity_level: str,
    sleep_hours: float,
    stress_level: int,  # 1-10
) -> int:
    """
    Generate an overall health score (0-100) based on vital stats and lifestyle.
    This is a heuristic algorithm, not a medical diagnosis.
    """
    score = 100

    # 1. BMI Impact (Target BMI: 18.5 - 24.9)
    bmi_str = calculate_bmi(weight_kg, height_cm)
    if bmi_str:
        bmi = float(bmi_str)
        if bmi < 18.5:
            score -= 10  # Underweight
        elif 25 <= bmi < 30:
            score -= 10  # Overweight
        elif bmi >= 30:
            score -= 20  # Obese
    else:
        # Penalize slightly for invalid data if we can't calc BMI
        score -= 5

    # 2. Activity Level Impact
    activity_bonus = {
        "sedentary": -15,
        "light": -5,
        "moderate": 0,
        "active": +5,
        "very_active": +10,
    }
    score += activity_bonus.get(activity_level.lower(), 0)

    # 3. Sleep Impact (Target: 7-9 hours)
    if sleep_hours < 5:
        score -= 15
    elif sleep_hours < 7:
        score -= 5
    elif sleep_hours > 9:
        score -= 5  # Oversleeping can also be negative

    # 4. Stress Impact (1-10, lower is better)
    # 1-3: +0, 4-6: -5, 7-8: -15, 9-10: -25
    if stress_level >= 9:
        score -= 25
    elif stress_level >= 7:
        score -= 15
    elif stress_level >= 4:
        score -= 5
    
    # 5. Age Factor (Slight curve adjustment for older age to maintain realism)
    # No direct penalty just for being old, but maybe adjust expectations?
    # For now, let's keep it simple. User asked for no ML.

    # Clamp score between 0 and 100
    return max(0, min(100, score))
