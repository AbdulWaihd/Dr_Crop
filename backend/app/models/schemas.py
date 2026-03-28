from pydantic import BaseModel


from typing import Optional

class PredictionResponse(BaseModel):
    crop: str
    disease: str
    confidence: float


class LocationInput(BaseModel):
    lat: float
    lon: float


class RecommendRequest(BaseModel):
    disease: str
    crop: str
    location: Optional[LocationInput] = None
    soil_ph: Optional[float] = None
    recent_rainfall: Optional[str] = None


class RecommendResponse(BaseModel):
    ipm_plan: list[str]
    irrigation_schedule: list[str]
    vulnerability_analysis: str
    confidence_note: str
