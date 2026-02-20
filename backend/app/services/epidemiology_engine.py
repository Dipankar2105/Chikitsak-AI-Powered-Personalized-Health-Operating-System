"""
Epidemiology Engine — regional disease alert data from CSV.

Loads CSV lazily so missing data files don't crash server startup.
"""

import os
import pandas as pd
from backend.app.logging_config import get_logger

logger = get_logger("services.epidemiology_engine")

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../../"))
DATA_PATH = os.path.join(BASE_DIR, "datasets", "epidemiology", "Number_of_Cases_And_Deaths_Due_To_Diseases.csv")

_df = None


def _load_data():
    """Lazy-load the epidemiology CSV."""
    global _df
    if _df is not None:
        return _df

    if not os.path.exists(DATA_PATH):
        logger.warning("Epidemiology data file not found at %s", DATA_PATH)
        return None

    try:
        _df = pd.read_csv(DATA_PATH)
        _df.columns = [c.strip().lower() for c in _df.columns]
        logger.info("Loaded epidemiology data: %d rows", len(_df))
        return _df
    except Exception as e:
        logger.error("Failed to load epidemiology data: %s", e)
        return None


def compute_risk_level(cases):
    if cases > 10000:
        return "High"
    elif cases > 3000:
        return "Moderate"
    else:
        return "Low"


def get_region_disease_alerts(region_name):
    df = _load_data()
    if df is None:
        return {"status": "Data unavailable", "alerts": []}

    region_df = df[df["state"].str.lower() == region_name.lower()]

    if region_df.empty:
        return {"status": "No data found", "alerts": []}

    latest_year = region_df["year"].max()
    latest_data = region_df[region_df["year"] == latest_year]

    alerts = []

    for _, row in latest_data.iterrows():
        alerts.append({
            "disease": row["disease"],
            "cases": row["cases"],
            "risk_level": compute_risk_level(row["cases"]),
            "year": latest_year
        })

    return {
        "status": "Data retrieved",
        "region": region_name,
        "alerts": alerts
    }