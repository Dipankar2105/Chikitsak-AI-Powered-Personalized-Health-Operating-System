"""
Location Health Routes — AQI, epidemiology alerts, and weather data from datasets.
"""

import os
from fastapi import APIRouter
from backend.app.services.epidemiology_engine import get_region_disease_alerts
from backend.app.logging_config import get_logger

logger = get_logger("routes.location")

router = APIRouter(prefix="/location", tags=["Location Health"])

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../../"))
AQI_PATH = os.path.join(BASE_DIR, "datasets", "epidemiology", "AQI.csv")

_aqi_df = None


def _load_aqi():
    global _aqi_df
    if _aqi_df is not None:
        return _aqi_df

    if not os.path.exists(AQI_PATH):
        logger.warning("AQI data absent: %s", AQI_PATH)
        return None

    try:
        import pandas as pd
        _aqi_df = pd.read_csv(AQI_PATH)
        _aqi_df.columns = [c.strip().lower() for c in _aqi_df.columns]
        logger.info("Loaded AQI data: %d rows", len(_aqi_df))
        return _aqi_df
    except Exception as e:
        logger.error("AQI load failed: %s", e)
        return None


def get_city_aqi(city: str) -> dict:
    """Look up AQI data for a city from the dataset."""
    df = _load_aqi()
    if df is None:
        return {"aqi": None, "aqi_label": "Data unavailable"}

    # Try matching city column
    city_col = None
    for col in df.columns:
        if "city" in col or "station" in col or "location" in col:
            city_col = col
            break

    if city_col is None:
        return {"aqi": None, "aqi_label": "Data unavailable"}

    match = df[df[city_col].str.lower().str.contains(city.lower(), na=False)]

    if match.empty:
        return {"aqi": None, "aqi_label": "No data for this city"}

    row = match.iloc[0]

    # Find AQI column
    aqi_col = None
    for col in df.columns:
        if "aqi" in col:
            aqi_col = col
            break

    aqi_val = int(row[aqi_col]) if aqi_col and aqi_col in row else None

    # AQI label
    if aqi_val is None:
        label = "Unknown"
    elif aqi_val <= 50:
        label = "Good"
    elif aqi_val <= 100:
        label = "Moderate"
    elif aqi_val <= 200:
        label = "Unhealthy for Sensitive Groups"
    elif aqi_val <= 300:
        label = "Unhealthy"
    else:
        label = "Hazardous"

    return {"aqi": aqi_val, "aqi_label": label}


@router.get("/alerts/{city}")
def get_location_alerts(city: str):
    """
    Get health alerts for a city: AQI + epidemiology disease data.
    No auth required — public health data.
    """
    # AQI data from CSV
    aqi_data = get_city_aqi(city)

    # Epidemiology data (maps city to state for Indian data)
    epi_data = get_region_disease_alerts(city)

    # Seasonal tips based on risk levels
    tips = []
    if aqi_data.get("aqi") and aqi_data["aqi"] > 200:
        tips.append("Wear N95 mask outdoors")
        tips.append("Use air purifiers indoors")
    if aqi_data.get("aqi") and aqi_data["aqi"] > 100:
        tips.append("Avoid outdoor exercise during peak hours")

    alerts = epi_data.get("alerts", [])
    if any(a.get("risk_level") == "High" for a in alerts):
        tips.append("Consult a doctor if you notice symptoms")
    if not tips:
        tips = ["Stay hydrated", "Maintain regular exercise", "Get adequate sleep"]

    return {
        "city": city,
        "aqi": aqi_data.get("aqi"),
        "aqi_label": aqi_data.get("aqi_label"),
        "illnesses": [
            {
                "name": a["disease"],
                "risk": a["risk_level"],
                "cases": a.get("cases"),
            }
            for a in alerts
        ],
        "seasonal_tips": tips,
    }
