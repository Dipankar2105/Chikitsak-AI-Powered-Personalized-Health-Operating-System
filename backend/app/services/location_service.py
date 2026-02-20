"""
Location Service — wraps the epidemiology_engine to provide region-based disease alerts.

This file was missing and caused an ImportError in health_orchestrator.py.
"""

from backend.app.logging_config import get_logger

logger = get_logger("services.location_service")


def get_region_alerts(location: str) -> dict:
    """
    Get disease alerts for a given region/state.
    Wraps epidemiology_engine with error handling so the orchestrator doesn't crash
    if the underlying CSV data is missing.
    """
    try:
        from backend.app.services.epidemiology_engine import get_region_disease_alerts
        return get_region_disease_alerts(location)
    except Exception as e:
        logger.warning("Could not load epidemiology data for '%s': %s", location, e)
        return {"status": "unavailable", "region": location, "alerts": []}
