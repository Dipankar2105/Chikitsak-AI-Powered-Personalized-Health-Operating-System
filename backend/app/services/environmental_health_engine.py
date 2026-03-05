"""
Environmental Health Engine

Assesses health risks based on:
- Air pollution levels (AQI)
- Weather conditions (temperature, humidity)
- Water quality indicators
- Location-specific disease prevalence

Produces location-specific health risk assessments.
"""

import logging
from typing import Dict, Any, List, Optional

logger = logging.getLogger(__name__)

# ─────────────────────────────────────────────────────────────────────────
# City Environmental Profiles (embedded data for major Indian cities)
# ─────────────────────────────────────────────────────────────────────────

CITY_PROFILES: Dict[str, Dict[str, Any]] = {
    "mumbai": {
        "aqi_typical": 150, "aqi_range": "120-200",
        "avg_temp_c": 30, "humidity_pct": 75,
        "water_quality": "moderate",
        "endemic_diseases": ["dengue", "malaria", "leptospirosis", "hepatitis_a"],
        "seasonal_risks": {
            "monsoon": ["waterborne diseases", "dengue", "leptospirosis", "flooding injuries"],
            "summer": ["heat stroke", "dehydration", "food poisoning"],
            "winter": ["respiratory infections", "asthma exacerbation"],
        },
    },
    "delhi": {
        "aqi_typical": 250, "aqi_range": "150-400",
        "avg_temp_c": 28, "humidity_pct": 50,
        "water_quality": "poor",
        "endemic_diseases": ["dengue", "chikungunya", "typhoid"],
        "seasonal_risks": {
            "winter": ["severe air pollution", "respiratory disease", "COPD exacerbation"],
            "summer": ["heat stroke", "dehydration", "sunburn"],
            "monsoon": ["dengue", "waterborne diseases", "flooding"],
        },
    },
    "bangalore": {
        "aqi_typical": 100, "aqi_range": "60-140",
        "avg_temp_c": 26, "humidity_pct": 65,
        "water_quality": "moderate",
        "endemic_diseases": ["dengue", "typhoid"],
        "seasonal_risks": {
            "monsoon": ["dengue", "waterborne diseases"],
            "summer": ["mild heat stress"],
            "winter": ["respiratory infections"],
        },
    },
    "kolkata": {
        "aqi_typical": 170, "aqi_range": "100-250",
        "avg_temp_c": 29, "humidity_pct": 80,
        "water_quality": "poor",
        "endemic_diseases": ["dengue", "malaria", "cholera", "hepatitis_a"],
        "seasonal_risks": {
            "monsoon": ["flooding", "waterborne diseases", "dengue"],
            "summer": ["heat stroke", "dehydration"],
            "winter": ["air pollution", "respiratory disease"],
        },
    },
    "chennai": {
        "aqi_typical": 90, "aqi_range": "50-130",
        "avg_temp_c": 32, "humidity_pct": 70,
        "water_quality": "moderate",
        "endemic_diseases": ["dengue", "chikungunya"],
        "seasonal_risks": {
            "monsoon": ["flooding", "dengue", "waterborne diseases"],
            "summer": ["severe heat", "dehydration", "heat stroke"],
            "winter": ["minimal risks"],
        },
    },
    "hyderabad": {
        "aqi_typical": 110, "aqi_range": "70-160",
        "avg_temp_c": 30, "humidity_pct": 55,
        "water_quality": "moderate",
        "endemic_diseases": ["dengue", "chikungunya"],
        "seasonal_risks": {
            "monsoon": ["dengue", "waterborne diseases"],
            "summer": ["heat stress", "dehydration"],
            "winter": ["mild air pollution"],
        },
    },
    "pune": {
        "aqi_typical": 95, "aqi_range": "50-140",
        "avg_temp_c": 27, "humidity_pct": 60,
        "water_quality": "good",
        "endemic_diseases": ["dengue"],
        "seasonal_risks": {
            "monsoon": ["dengue", "waterborne diseases"],
            "summer": ["mild heat stress"],
            "winter": ["respiratory infections"],
        },
    },
}

# Default for unknown cities
DEFAULT_PROFILE = {
    "aqi_typical": 100, "aqi_range": "50-200",
    "avg_temp_c": 28, "humidity_pct": 60,
    "water_quality": "moderate",
    "endemic_diseases": [],
    "seasonal_risks": {},
}


def get_aqi_risk(aqi: int) -> Dict[str, str]:
    """Classify AQI into health risk categories."""
    if aqi <= 50:
        return {"level": "Good", "risk": "Low", "color": "#22C55E",
                "advice": "Air quality is satisfactory. Enjoy outdoor activities."}
    elif aqi <= 100:
        return {"level": "Moderate", "risk": "Low", "color": "#EAB308",
                "advice": "Acceptable quality. Sensitive individuals should limit prolonged outdoor exertion."}
    elif aqi <= 150:
        return {"level": "Unhealthy for Sensitive Groups", "risk": "Moderate", "color": "#F97316",
                "advice": "People with respiratory/heart conditions, elderly, and children should reduce outdoor activity."}
    elif aqi <= 200:
        return {"level": "Unhealthy", "risk": "High", "color": "#EF4444",
                "advice": "Everyone may experience health effects. Limit outdoor exertion. Wear N95 mask outdoors."}
    elif aqi <= 300:
        return {"level": "Very Unhealthy", "risk": "Very High", "color": "#7C3AED",
                "advice": "Health alert. Avoid outdoor activity. Use air purifiers indoors."}
    else:
        return {"level": "Hazardous", "risk": "Severe", "color": "#991B1B",
                "advice": "Emergency conditions. Stay indoors. Seal windows. Use air purifier. Wear N95 if going outside."}


def get_heat_risk(temp_c: float, humidity_pct: float) -> Dict[str, str]:
    """Assess heat stress risk using heat index."""
    # Simplified heat index
    heat_index = temp_c + (0.5 * humidity_pct / 10)

    if heat_index < 32:
        return {"level": "Low", "risk": "Low",
                "advice": "Comfortable conditions. Stay hydrated."}
    elif heat_index < 38:
        return {"level": "Moderate", "risk": "Moderate",
                "advice": "Caution: fatigue possible with prolonged exposure. Drink water regularly."}
    elif heat_index < 45:
        return {"level": "High", "risk": "High",
                "advice": "Danger: heat cramps and exhaustion likely. Limit outdoor activity to early morning/evening."}
    else:
        return {"level": "Extreme", "risk": "Very High",
                "advice": "Extreme danger: heat stroke imminent. Stay indoors in AC. Hydrate continuously."}


def assess_environmental_health(
    city: Optional[str] = None,
    country: Optional[str] = None,
    aqi_override: Optional[int] = None,
    temp_override: Optional[float] = None,
    humidity_override: Optional[float] = None,
    existing_conditions: Optional[List[str]] = None,
) -> Dict[str, Any]:
    """
    Comprehensive environmental health risk assessment for a location.
    """
    city_lower = (city or "").lower().strip()
    profile = CITY_PROFILES.get(city_lower, DEFAULT_PROFILE)

    aqi = aqi_override or profile["aqi_typical"]
    temp = temp_override or profile["avg_temp_c"]
    humidity = humidity_override or profile["humidity_pct"]

    aqi_risk = get_aqi_risk(aqi)
    heat_risk = get_heat_risk(temp, humidity)

    # Water quality risk
    wq = profile["water_quality"]
    water_risk = {
        "good": {"level": "Low", "advice": "Municipal water is generally safe. Still prefer filtered/boiled water."},
        "moderate": {"level": "Moderate", "advice": "Use water purifier or boil water before drinking. Avoid street-side ice."},
        "poor": {"level": "High", "advice": "Water contamination risk. Use only RO/UV purified water. Avoid uncooked vegetables washed in tap water."},
    }.get(wq, {"level": "Moderate", "advice": "Use purified water."})

    # Condition-specific risks
    condition_alerts = []
    conds = [c.lower() for c in (existing_conditions or [])]

    if "asthma" in conds and aqi > 100:
        condition_alerts.append({
            "condition": "Asthma",
            "risk": "High" if aqi > 150 else "Moderate",
            "alert": f"AQI {aqi} may trigger asthma exacerbation. Keep rescue inhaler accessible. Consider staying indoors.",
        })
    if "copd" in conds and aqi > 100:
        condition_alerts.append({
            "condition": "COPD",
            "risk": "High",
            "alert": f"AQI {aqi} is dangerous for COPD. Stay indoors with air purifier. Monitor oxygen saturation.",
        })
    if "heart disease" in conds or "hypertension" in conds:
        if temp > 35:
            condition_alerts.append({
                "condition": "Cardiovascular",
                "risk": "Moderate",
                "alert": "High temperature increases cardiac workload. Stay hydrated. Avoid exertion in peak heat.",
            })
    if "diabetes" in conds and temp > 35:
        condition_alerts.append({
            "condition": "Diabetes",
            "risk": "Moderate",
            "alert": "Heat can affect blood sugar levels and insulin storage. Monitor glucose more frequently. Keep insulin cool.",
        })

    # Get current season (rough approximation for India)
    from datetime import datetime
    month = datetime.now().month
    if month in (6, 7, 8, 9):
        season = "monsoon"
    elif month in (3, 4, 5):
        season = "summer"
    else:
        season = "winter"

    seasonal = profile.get("seasonal_risks", {}).get(season, [])

    return {
        "location": city or "Unknown",
        "country": country or "India",
        "air_quality": {
            "aqi": aqi,
            "aqi_range": profile["aqi_range"],
            **aqi_risk,
        },
        "heat_stress": {
            "temperature_c": temp,
            "humidity_pct": humidity,
            **heat_risk,
        },
        "water_quality": {
            "quality": wq,
            **water_risk,
        },
        "endemic_diseases": profile["endemic_diseases"],
        "current_season": season,
        "seasonal_risks": seasonal,
        "condition_specific_alerts": condition_alerts,
        "general_recommendations": [
            "Carry a water bottle — stay hydrated throughout the day",
            f"{'Wear N95 mask outdoors' if aqi > 150 else 'Air quality is acceptable for most activities'}",
            f"{'Limit outdoor exposure 11am-4pm' if temp > 33 else 'Outdoor activity is safe'}",
            "Wash hands frequently to prevent waterborne/vector-borne diseases",
        ],
    }
