from pydantic import BaseModel


class PredictionResponse(BaseModel):
    crop: str
    disease: str
    confidence: float


class RecommendRequest(BaseModel):
    disease: str
    crop: str


class RecommendResponse(BaseModel):
    treatment: str
    prevention: str
    fertilizer: str
    confidence_note: str
