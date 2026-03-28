from fastapi import APIRouter, HTTPException, Query

from app.models.schemas import FieldConditions
from app.services.open_meteo_service import fetch_field_conditions, format_agro_context_for_llm

router = APIRouter()


@router.get("/agro-context", response_model=FieldConditions)
async def agro_context(
    latitude: float = Query(..., ge=-90, le=90),
    longitude: float = Query(..., ge=-180, le=180),
):
    fc = await fetch_field_conditions(latitude, longitude)
    if fc is None:
        raise HTTPException(
            status_code=502,
            detail="Could not load weather/soil data. Try again later.",
        )
    return fc


@router.get("/agro-context/summary")
async def agro_context_summary(
    latitude: float = Query(..., ge=-90, le=90),
    longitude: float = Query(..., ge=-180, le=180),
):
    fc = await fetch_field_conditions(latitude, longitude)
    if fc is None:
        raise HTTPException(status_code=502, detail="Could not load field data.")
    return {"summary": format_agro_context_for_llm(fc), "conditions": fc.model_dump()}
