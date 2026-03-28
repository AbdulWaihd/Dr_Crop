from fastapi import APIRouter

from app.models.schemas import RecommendRequest, RecommendResponse
from app.services.exa_service import search_agriculture_context
from app.services.llm_service import generate_recommendation

router = APIRouter()


@router.post("/recommend", response_model=RecommendResponse)
async def get_recommendation(req: RecommendRequest):
    """Fetch context from Exa and generate treatment recommendations via LLM."""
    context = await search_agriculture_context(req.disease, req.crop)
    recommendation = await generate_recommendation(context, req.disease, req.crop)

    return RecommendResponse(**recommendation)
