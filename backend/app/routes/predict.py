"""POST /predict — Upload image → HuggingFace plant disease classification."""

from fastapi import APIRouter, File, UploadFile

from app.models.schemas import PredictionResponse
from ml.inference import predict_disease

router = APIRouter()


@router.post("/predict", response_model=PredictionResponse)
async def predict(file: UploadFile = File(...)):
    """Upload a leaf image and get crop disease prediction via HF Inference API."""
    contents = await file.read()
    print(f"[route/predict] Received image: {file.filename} ({len(contents)} bytes)")

    result = predict_disease(contents)
    return PredictionResponse(**result)
