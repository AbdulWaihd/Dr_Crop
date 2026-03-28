import json
import httpx

from app.config import get_settings

SYSTEM_PROMPT = """\
You are an agricultural expert AI. Given a crop disease diagnosis and research context,
provide actionable treatment advice in JSON format with these exact keys:
treatment, prevention, fertilizer, confidence_note.
Return ONLY valid JSON — no markdown fences, no extra text."""


async def generate_recommendation(
    context: str, disease: str, crop: str
) -> dict[str, str]:
    """Call an OpenAI-compatible LLM to generate structured treatment advice."""
    settings = get_settings()

    if not settings.llm_api_key:
        return _fallback_recommendation(disease, crop)

    user_prompt = (
        f"Crop: {crop}\nDisease: {disease}\n\n"
        f"Research context:\n{context}\n\n"
        f"Provide a JSON object with treatment, prevention, fertilizer, and confidence_note."
    )

    async with httpx.AsyncClient(timeout=30) as client:
        resp = await client.post(
            f"{settings.llm_base_url}/chat/completions",
            headers={"Authorization": f"Bearer {settings.llm_api_key}"},
            json={
                "model": settings.llm_model,
                "messages": [
                    {"role": "system", "content": SYSTEM_PROMPT},
                    {"role": "user", "content": user_prompt},
                ],
                "temperature": 0.3,
            },
        )
        resp.raise_for_status()
        content = resp.json()["choices"][0]["message"]["content"]

    try:
        return json.loads(content)
    except json.JSONDecodeError:
        return _fallback_recommendation(disease, crop)


def _fallback_recommendation(disease: str, crop: str) -> dict[str, str]:
    """Return placeholder advice when LLM is unavailable."""
    return {
        "treatment": f"Apply appropriate fungicide for {disease} on {crop}. Remove and destroy infected plant parts.",
        "prevention": "Practice crop rotation, use resistant varieties, ensure proper plant spacing.",
        "fertilizer": "Use balanced NPK fertilizer. Avoid excessive nitrogen which promotes disease-susceptible growth.",
        "confidence_note": "This is a placeholder recommendation. Connect an LLM API key for tailored advice.",
    }
