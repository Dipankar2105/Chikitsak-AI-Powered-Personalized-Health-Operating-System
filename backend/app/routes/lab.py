from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from pydantic import BaseModel
from typing import Dict, Optional
import csv
import io

from backend.app.ml_models.lab_engine import analyze_lab_report

router = APIRouter(prefix="/lab", tags=["Lab Analysis"])


class LabRequest(BaseModel):
    lab_values: Dict[str, float]


@router.post("/analyze")
async def analyze_lab(
    lab_values: Optional[str] = Form(None),
    file: Optional[UploadFile] = File(None),
):
    """
    Accept either multipart form JSON in `lab_values` or a CSV file upload.
    CSV should be two columns: test,value
    """
    parsed: Dict[str, float] = {}

    if file is not None:
        # parse CSV
        content = await file.read()
        try:
            text = content.decode("utf-8")
            reader = csv.reader(io.StringIO(text))
            for row in reader:
                if not row:
                    continue
                key = row[0].strip()
                try:
                    val = float(row[1])
                except Exception:
                    continue
                parsed[key] = val
        except Exception as e:
            raise HTTPException(status_code=400, detail="Invalid CSV file")
    elif lab_values:
        # lab_values passed as JSON string from form-data
        import json

        try:
            parsed = json.loads(lab_values)
        except Exception:
            raise HTTPException(status_code=400, detail="Invalid lab_values JSON")
    else:
        raise HTTPException(status_code=400, detail="Provide lab_values form field or upload a CSV file")

    return analyze_lab_report(parsed)