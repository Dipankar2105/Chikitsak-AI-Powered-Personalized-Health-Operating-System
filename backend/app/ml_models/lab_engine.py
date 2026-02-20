import os

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../../"))
LAB_PATH = os.path.join(BASE_DIR, "datasets", "lab_ranges", "reference_ranges.csv")

_reference_map = None


def _get_reference_map():
    global _reference_map
    if _reference_map is not None:
        return _reference_map

    _reference_map = {}
    if not os.path.exists(LAB_PATH):
        from backend.app.logging_config import get_logger
        get_logger("ml_models.lab_engine").warning(f"Engine data absent: {LAB_PATH}")
        return _reference_map

    try:
        import pandas as pd
        lab_df = pd.read_csv(LAB_PATH)
        lab_df.columns = [col.strip().lower() for col in lab_df.columns]

        for _, row in lab_df.iterrows():
            test_name = str(row["test"]).strip()
            _reference_map[test_name] = {
                "min": float(row["min"]),
                "max": float(row["max"])
            }
    except Exception as e:
        from backend.app.logging_config import get_logger
        get_logger("ml_models.lab_engine").error("Data load failed: %s", e)

    return _reference_map


def analyze_lab_report(user_lab_values: dict):
    reference_map = _get_reference_map()
    results = {}
    abnormal_count = 0

    for test, value in user_lab_values.items():
        if test in reference_map:
            ref = reference_map[test]
            if value < ref["min"]:
                status = "Low"
                abnormal_count += 1
            elif value > ref["max"]:
                status = "High"
                abnormal_count += 1
            else:
                status = "Normal"

            results[test] = {
                "value": value,
                "status": status,
                "reference_range": ref
            }

    # Risk summary
    if abnormal_count == 0:
        overall = "All values normal"
    elif abnormal_count <= 2:
        overall = "Mild abnormalities"
    else:
        overall = "Multiple abnormalities – consult doctor"

    return {
        "detailed_results": results,
        "summary": overall
    }
