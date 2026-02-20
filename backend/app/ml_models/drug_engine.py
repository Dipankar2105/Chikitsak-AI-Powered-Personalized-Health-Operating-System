import os

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../../"))
DRUG_PATH = os.path.join(BASE_DIR, "datasets", "medication", "db_drug_interactions.csv")

_drug_df = None


def _get_drug_df():
    global _drug_df
    if _drug_df is None:
        import pandas as pd
        if not os.path.exists(DRUG_PATH):
            from backend.app.logging_config import get_logger
            get_logger("ml_models.drug_engine").warning(f"Engine data absent: {DRUG_PATH}")
            return None
        _drug_df = pd.read_csv(DRUG_PATH)
        _drug_df.columns = [c.strip().lower() for c in _drug_df.columns]
    return _drug_df


def check_drug_interactions(med_list):
    drug_df = _get_drug_df()
    if drug_df is None:
        return {"status": "Service unavailable (data missing)", "details": []}

    interactions_found = []

    for i in range(len(med_list)):
        for j in range(i + 1, len(med_list)):
            d1 = med_list[i].lower()
            d2 = med_list[j].lower()

            match = drug_df[
                ((drug_df["drug1"].str.lower() == d1) & (drug_df["drug2"].str.lower() == d2)) |
                ((drug_df["drug1"].str.lower() == d2) & (drug_df["drug2"].str.lower() == d1))
            ]

            if not match.empty:
                row = match.iloc[0]
                interactions_found.append({
                    "drug_1": d1,
                    "drug_2": d2,
                    "interaction": row["interaction"],
                    "severity": row.get("severity", "Unknown")
                })

    if not interactions_found:
        return {"status": "No interactions found", "details": []}

    return {"status": "Interactions detected", "details": interactions_found}
