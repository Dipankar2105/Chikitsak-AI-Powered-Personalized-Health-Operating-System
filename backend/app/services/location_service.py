import requests
from backend.app.logging_config import get_logger
from backend.app.config import get_settings

logger = get_logger("services.location_service")
settings = get_settings()

OPENWEATHER_API_KEY = getattr(settings, "OPENWEATHER_API_KEY", None)

def get_location_health_insights(city: str) -> dict:
    """
    Fetch real-time AQI, weather, and epidemic alerts for a location.
    """
    insights = {
        "city": city,
        "aqi": 50,  # Moderate/Good base
        "temperature": 25,
        "humidity": 60,
        "conditions": "Clear",
        "alerts": []
    }

    if not OPENWEATHER_API_KEY:
        logger.warning("OPENWEATHER_API_KEY not set, returning fallback regional alerts")
        return _get_fallback_alerts(city, insights)

    try:
        # 1. Get Geocoding
        geo_url = f"http://api.openweathermap.org/geo/1.0/direct?q={city}&limit=1&appid={OPENWEATHER_API_KEY}"
        geo_res = requests.get(geo_url, timeout=5).json()
        
        if geo_res:
            lat, lon = geo_res[0]["lat"], geo_res[0]["lon"]
            
            # 2. Get Weather
            w_url = f"https://api.openweathermap.org/data/2.5/weather?lat={lat}&lon={lon}&units=metric&appid={OPENWEATHER_API_KEY}"
            w_data = requests.get(w_url, timeout=5).json()
            insights["temperature"] = w_data.get("main", {}).get("temp", 25)
            insights["humidity"] = w_data.get("main", {}).get("humidity", 60)
            insights["conditions"] = w_data.get("weather", [{}])[0].get("main", "Clear")

            # 3. Get AQI
            a_url = f"http://api.openweathermap.org/data/2.5/air_pollution?lat={lat}&lon={lon}&appid={OPENWEATHER_API_KEY}"
            a_data = requests.get(a_url, timeout=5).json()
            insights["aqi"] = a_data.get("list", [{}])[0].get("main", {}).get("aqi", 1) * 20 # Normalize roughly to 100 scale

        return _get_fallback_alerts(city, insights)
    except Exception as e:
        logger.error("Failed to fetch real-time location data for %s: %s", city, e)
        return _get_fallback_alerts(city, insights)

def _get_fallback_alerts(location: str, insights: dict) -> dict:
    try:
        from backend.app.services.epidemiology_engine import get_region_disease_alerts
        alerts = get_region_disease_alerts(location)
        insights["alerts"] = alerts.get("alerts", [])
    except Exception:
        pass
    return insights

def get_region_alerts(location: str) -> dict:
    """Wrapper for backward compatibility."""
    return get_location_health_insights(location)
