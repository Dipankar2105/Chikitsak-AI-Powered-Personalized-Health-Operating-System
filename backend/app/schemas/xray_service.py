from pydantic import BaseModel


class XrayAnalysisResponse(BaseModel):
    prediction: str
    confidence: float
    risk_level: str
    recommendation: str
