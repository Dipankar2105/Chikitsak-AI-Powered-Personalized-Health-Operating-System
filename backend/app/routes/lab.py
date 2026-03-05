"""
Lab Report Routes — analyze lab values with auth, DB persistence, PDF/image OCR support.
"""

from fastapi import APIRouter, UploadFile, File, Form, HTTPException, Depends
from typing import Dict, Optional
from sqlalchemy.orm import Session
import csv
import io
import json

from backend.app.database import get_db
from backend.app.models.user import User
from backend.app.models.lab_report import LabReport
from backend.app.services.auth_service import get_current_user
from backend.app.ml_models.lab_engine import (
    analyze_lab_report,
    extract_lab_values_from_text,
    get_abnormality_explanation,
)
from backend.app.logging_config import get_logger

logger = get_logger("routes.lab")

router = APIRouter(prefix="/lab", tags=["Lab Analysis"])


def _extract_text_from_pdf(content: bytes) -> str:
    """Extract text from PDF bytes. Tries PyPDF2 first, then pdfplumber."""
    # Try PyPDF2
    try:
        import PyPDF2
        reader = PyPDF2.PdfReader(io.BytesIO(content))
        text_parts = []
        for page in reader.pages:
            page_text = page.extract_text()
            if page_text:
                text_parts.append(page_text)
        text = "\n".join(text_parts)
        if text.strip():
            return text
    except Exception as e:
        logger.debug("PyPDF2 extraction failed: %s", e)

    # Try pdfplumber
    try:
        import pdfplumber
        with pdfplumber.open(io.BytesIO(content)) as pdf:
            text_parts = []
            for page in pdf.pages:
                page_text = page.extract_text()
                if page_text:
                    text_parts.append(page_text)
        text = "\n".join(text_parts)
        if text.strip():
            return text
    except Exception as e:
        logger.debug("pdfplumber extraction failed: %s", e)

    return ""


def _extract_text_from_image(content: bytes) -> str:
    """Extract text from image bytes using OCR (pytesseract)."""
    try:
        from PIL import Image
        import pytesseract

        image = Image.open(io.BytesIO(content))
        text = pytesseract.image_to_string(image)
        return text
    except ImportError:
        logger.warning("pytesseract not available for OCR")
        return ""
    except Exception as e:
        logger.warning("OCR extraction failed: %s", e)
        return ""


@router.post("/analyze")
async def analyze_lab(
    lab_values: Optional[str] = Form(None),
    file: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Analyze lab values. Accepts:
    - JSON form data (lab_values field)
    - CSV file upload
    - PDF file upload (text extraction)
    - Image file upload (OCR extraction)

    Results are persisted to the database.
    """
    parsed: Dict[str, float] = {}

    if file is not None:
        content = await file.read()
        filename = (file.filename or "").lower()
        content_type = (file.content_type or "").lower()

        if filename.endswith(".csv") or "csv" in content_type:
            # CSV parsing
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
            except Exception:
                raise HTTPException(status_code=400, detail="Invalid CSV file")

        elif filename.endswith(".pdf") or "pdf" in content_type:
            # PDF text extraction
            text = _extract_text_from_pdf(content)
            if not text.strip():
                raise HTTPException(
                    status_code=400,
                    detail="Could not extract text from PDF. Try uploading a clearer PDF or enter values manually.",
                )
            parsed = extract_lab_values_from_text(text)
            if not parsed:
                raise HTTPException(
                    status_code=400,
                    detail="Could not identify lab values in the PDF. Please enter values manually.",
                )

        elif content_type.startswith("image/") or filename.endswith((".png", ".jpg", ".jpeg", ".tiff", ".bmp")):
            # Image OCR
            text = _extract_text_from_image(content)
            if not text.strip():
                raise HTTPException(
                    status_code=400,
                    detail="Could not extract text from image. Ensure the image is clear and well-lit, or enter values manually.",
                )
            parsed = extract_lab_values_from_text(text)
            if not parsed:
                raise HTTPException(
                    status_code=400,
                    detail="Could not identify lab values in the image. Please enter values manually.",
                )
        else:
            raise HTTPException(
                status_code=400,
                detail=f"Unsupported file type: {content_type}. Supported: CSV, PDF, PNG, JPG.",
            )

    elif lab_values:
        try:
            parsed = json.loads(lab_values)
        except Exception:
            raise HTTPException(status_code=400, detail="Invalid lab_values JSON")
    else:
        raise HTTPException(status_code=400, detail="Provide lab_values or upload a CSV/PDF/image file")

    # Run analysis
    result = analyze_lab_report(parsed)

    # Enrich with explanations for abnormal values
    detailed = result.get("detailed_results", {})
    for test_name, test_result in detailed.items():
        status = test_result.get("status", "Normal")
        if status in ("Low", "High"):
            test_result["explanation"] = get_abnormality_explanation(test_name, status)

    # Persist to database
    report = LabReport(
        user_id=current_user.id,
        report_name=file.filename if file else "Manual Entry",
        abnormal_values={k: v for k, v in parsed.items()
                         if detailed.get(k, {}).get("status") != "Normal"},
        analysis_result=result,
    )
    db.add(report)
    db.commit()

    logger.info("Lab report analyzed for user %d: %s", current_user.id, result.get("summary"))
    return result


@router.get("/history")
def get_lab_history(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Retrieve lab report history for the authenticated user."""
    reports = (
        db.query(LabReport)
        .filter(LabReport.user_id == current_user.id)
        .order_by(LabReport.timestamp.desc())
        .limit(20)
        .all()
    )
    return [
        {
            "id": r.id,
            "report_name": r.report_name,
            "summary": r.analysis_result.get("summary") if r.analysis_result else None,
            "abnormal_count": len(r.abnormal_values) if r.abnormal_values else 0,
            "timestamp": r.timestamp.isoformat() if r.timestamp else None,
        }
        for r in reports
    ]