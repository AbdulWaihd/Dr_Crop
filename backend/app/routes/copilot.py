"""POST /copilot — Farm assistant Q&A powered by Kimi-K2."""

from fastapi import APIRouter, HTTPException

from app.models.schemas import CopilotRequest, CopilotResponse
from app.services.llm_service import generate_copilot_answer

router = APIRouter()


@router.post("/copilot", response_model=CopilotResponse)
async def farm_copilot(req: CopilotRequest):
    """Ask the farming copilot a question and get an AI answer."""
    try:
        answer = await generate_copilot_answer(req.question, req.locale)
    except Exception as e:
        print(f"[route/copilot] ERROR: {e}")
        raise HTTPException(
            status_code=503,
            detail=f"Copilot request failed: {e!s}",
        ) from e

    if not answer:
        raise HTTPException(status_code=503, detail="Empty copilot response.")

    return CopilotResponse(answer=answer)
