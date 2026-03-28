from fastapi import APIRouter, File, HTTPException, UploadFile
from PIL import Image
import io

from app.models.schemas import PredictionResponse
from app.services.vision_diagnosis_service import diagnose_from_image

router = APIRouter()


@router.post("/predict", response_model=PredictionResponse)
async def predict_disease(file: UploadFile = File(...)):
    """
    Vision LLM (structured dimensions) + Exa RAG + synthesis. Requires LLM_API_KEY.
    """
    contents = await file.read()
    image = Image.open(io.BytesIO(contents)).convert("RGB")

    try:
        result = await diagnose_from_image(image)
    except RuntimeError as e:
        raise HTTPException(status_code=503, detail=str(e)) from e

    return PredictionResponse(**result)
