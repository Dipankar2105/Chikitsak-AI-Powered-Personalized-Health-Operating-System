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
    """
    Analyze lab values for abnormalities.
    """
    reference_map = _get_reference_map()
    
    # Fallback thresholds if dataset is empty or missing specific tests
    thresholds = {
        "Hemoglobin": (13.5, 17.5),
        "WBC": (4500, 11000),
        "Platelets": (150000, 450000),
        "Glucose": (70, 100),
        "Cholesterol": (0, 200),
        "Creatinine": (0.7, 1.3),
        "TSH": (0.4, 4.0),
    }

    results = {}
    abnormal_count = 0

    for test, value in user_lab_values.items():
        low, high = None, None
        
        if test in reference_map:
            low, high = reference_map[test]["min"], reference_map[test]["max"]
        elif test in thresholds:
            low, high = thresholds[test]
            
        if low is not None and high is not None:
            if value < low:
                status = "Low"
                abnormal_count += 1
            elif value > high:
                status = "High"
                abnormal_count += 1
            else:
                status = "Normal"

            results[test] = {
                "value": value,
                "status": status,
                "reference_range": f"{low}-{high}"
            }
        else:
            results[test] = {
                "value": value,
                "status": "Not Analyzed",
                "reference_range": "Unknown"
            }

    # Risk summary
    if abnormal_count == 0:
        overall = "All values normal"
    elif abnormal_count <= 2:
        overall = "Mild abnormalities detected"
    else:
        overall = "Multiple abnormalities – consult doctor"

    return {
        "detailed_results": results,
        "summary": overall,
        "abnormal_count": abnormal_count
    }


def extract_lab_values_from_text(text: str) -> dict:
    """
    Extract lab test names and values from OCR/PDF text using pattern matching.
    Looks for patterns like 'Hemoglobin: 13.5' or 'WBC 4500' or 'Glucose = 95 mg/dL'.
    """
    import re

    # Common test name patterns and their canonical names
    test_aliases = {
        "hemoglobin": "Hemoglobin", "hb": "Hemoglobin", "hgb": "Hemoglobin",
        "wbc": "WBC", "white blood cell": "WBC", "leucocyte": "WBC",
        "platelets": "Platelets", "platelet count": "Platelets", "plt": "Platelets",
        "glucose": "Glucose", "blood sugar": "Glucose", "fasting glucose": "Glucose", "fbs": "Glucose",
        "cholesterol": "Cholesterol", "total cholesterol": "Cholesterol",
        "creatinine": "Creatinine", "serum creatinine": "Creatinine",
        "tsh": "TSH", "thyroid": "TSH",
        "rbc": "RBC", "red blood cell": "RBC", "erythrocyte": "RBC",
        "alt": "ALT", "sgpt": "ALT", "alanine aminotransferase": "ALT",
        "ast": "AST", "sgot": "AST", "aspartate aminotransferase": "AST",
        "bilirubin": "Bilirubin", "total bilirubin": "Bilirubin",
        "albumin": "Albumin", "serum albumin": "Albumin",
        "urea": "Urea", "blood urea": "Urea", "bun": "Urea",
        "calcium": "Calcium", "serum calcium": "Calcium",
        "sodium": "Sodium", "serum sodium": "Sodium", "na": "Sodium",
        "potassium": "Potassium", "serum potassium": "Potassium", "k": "Potassium",
        "iron": "Iron", "serum iron": "Iron",
        "vitamin d": "Vitamin D", "vit d": "Vitamin D", "25-oh vitamin d": "Vitamin D",
        "vitamin b12": "Vitamin B12", "vit b12": "Vitamin B12",
        "hba1c": "HbA1c", "glycated hemoglobin": "HbA1c",
        "ldl": "LDL", "ldl cholesterol": "LDL",
        "hdl": "HDL", "hdl cholesterol": "HDL",
        "triglycerides": "Triglycerides", "tg": "Triglycerides",
        "esr": "ESR", "erythrocyte sedimentation rate": "ESR",
    }

    parsed = {}
    text_lower = text.lower()
    lines = text_lower.split("\n")

    for line in lines:
        for alias, canonical in test_aliases.items():
            if alias in line:
                # Try to find a numeric value near the test name
                # Pattern: test_name followed by separator and number
                pattern = re.compile(
                    rf"{re.escape(alias)}[\s:=\-–>|]+([\d]+\.?[\d]*)",
                    re.IGNORECASE,
                )
                match = pattern.search(line)
                if match:
                    try:
                        value = float(match.group(1))
                        parsed[canonical] = value
                    except ValueError:
                        continue
                break  # Only match first alias per line

    return parsed


# Explanations for common abnormalities
ABNORMALITY_EXPLANATIONS = {
    "Hemoglobin": {
        "Low": "Low hemoglobin may indicate anemia, blood loss, or nutritional deficiency (iron, B12, folate).",
        "High": "High hemoglobin may indicate dehydration, lung disease, or polycythemia.",
    },
    "WBC": {
        "Low": "Low WBC (leukopenia) may indicate bone marrow problems, autoimmune conditions, or viral infections.",
        "High": "High WBC (leukocytosis) may indicate infection, inflammation, or stress response.",
    },
    "Platelets": {
        "Low": "Low platelets (thrombocytopenia) increases bleeding risk. May indicate viral infection, autoimmune condition, or medication effect.",
        "High": "High platelets (thrombocytosis) may indicate inflammation, infection, or iron deficiency.",
    },
    "Glucose": {
        "Low": "Low blood glucose (hypoglycemia) may cause dizziness, sweating, confusion. Could indicate medication effect or fasting.",
        "High": "High blood glucose may indicate diabetes or prediabetes. Fasting glucose >126 mg/dL suggests diabetes.",
    },
    "Cholesterol": {
        "High": "Elevated cholesterol increases cardiovascular risk. Lifestyle changes and medication may be needed.",
    },
    "Creatinine": {
        "Low": "Low creatinine may indicate reduced muscle mass or liver disease.",
        "High": "High creatinine may indicate impaired kidney function. Further evaluation recommended.",
    },
    "TSH": {
        "Low": "Low TSH may indicate hyperthyroidism (overactive thyroid).",
        "High": "High TSH may indicate hypothyroidism (underactive thyroid).",
    },
}


def get_abnormality_explanation(test_name: str, status: str) -> str:
    """Get a human-readable explanation for an abnormal lab value."""
    explanations = ABNORMALITY_EXPLANATIONS.get(test_name, {})
    return explanations.get(status, f"{test_name} is {status.lower()}. Consult your doctor for interpretation.")
