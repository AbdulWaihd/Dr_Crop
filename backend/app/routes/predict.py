from fastapi import APIRouter, UploadFile, File
from PIL import Image
import io

from app.models.schemas import PredictionResponse
from ml.inference import predict as run_inference

router = APIRouter()


@router.post("/predict", response_model=PredictionResponse)
async def predict_disease(file: UploadFile = File(...)):
    """Accept a crop leaf image and return disease prediction."""
    contents = await file.read()
    image = Image.open(io.BytesIO(contents)).convert("RGB")

    result = run_inference(image)

    return PredictionResponse(**result)
