"""POST /predict — Upload image → HuggingFace plant disease classification."""

from fastapi import APIRouter, File, UploadFile

from app.models.schemas import PredictionResponse
from app.services.vision_service import analyze_plant_image

router = APIRouter()


@router.post("/predict", response_model=PredictionResponse)
async def predict(file: UploadFile = File(...)):
    """Upload a leaf image and get crop disease prediction via Vision LLM."""
    contents = await file.read()
    print(f"[route/predict] Received image: {file.filename} ({len(contents)} bytes)")

    result = analyze_plant_image(contents)
    return PredictionResponse(**result)

