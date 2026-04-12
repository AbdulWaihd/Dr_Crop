"""POST /recommend — Disease + crop → RAG context → Kimi-K2 treatment advice."""

import asyncio

from fastapi import APIRouter

from app.models.schemas import RecommendRequest, RecommendResponse
from app.services.rag_service import search_context
from app.services.llm_service import generate_recommendation
from app.services.open_meteo_service import (
    fetch_air_quality,
    fetch_field_conditions,
    format_agro_context_for_llm,
    format_air_quality_for_llm,
)

router = APIRouter()


@router.post("/recommend", response_model=RecommendResponse)
async def get_recommendation(req: RecommendRequest):
    """Get AI-powered treatment recommendations for a diagnosed crop disease."""
    print(f"[route/recommend] Request: crop={req.crop}, disease={req.disease}, locale={req.locale}")

    # 1 & 2. RAG context + Weather + Air Quality in parallel
    # search_context is synchronous, so we run it in a thread
    rag_task = asyncio.to_thread(search_context, req.crop, req.disease)
    
    tasks = [rag_task]
    if req.latitude is not None and req.longitude is not None:
        tasks.append(fetch_field_conditions(req.latitude, req.longitude))
        tasks.append(fetch_air_quality(req.latitude, req.longitude))

    results = await asyncio.gather(*tasks)
    
    context = results[0]
    field_conditions = None
    air_quality = None
    
    if len(results) > 1:
        field_conditions = results[1]
        air_quality = results[2]

    agro_text = ""
    air_text = ""
    if field_conditions is not None:
        agro_text = format_agro_context_for_llm(field_conditions)
    if air_quality is not None:
        air_text = format_air_quality_for_llm(air_quality)


    blocks: list[str] = []
    if agro_text.strip():
        blocks.append("Field weather & soil (model estimates):\n" + agro_text)
    if air_text.strip():
        blocks.append("Live air quality (model estimates):\n" + air_text)
    field_context = "\n\n".join(blocks)

    # 3. LLM recommendation via Kimi-K2
    rec = await generate_recommendation(
        context, req.disease, req.crop, field_context, air_quality, req.locale
    )

    return RecommendResponse(
        field_conditions=field_conditions,
        air_quality=air_quality,
        **rec,
    )
