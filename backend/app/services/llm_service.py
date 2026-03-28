import json
import httpx

from app.config import get_settings

SYSTEM_PROMPT = """\
You are an expert plant pathologist, digital crop consultant, and agronomist.
Given a crop disease diagnosis, local weather conditions, environmental facts, and research context,
explain why the environmental factors made the plant vulnerable. Provide a 3-step integrated pest management (IPM) plan focusing on organic recovery first.
Also suggest a precise irrigation schedule.
Return your advice in valid JSON format with these exact keys:
ipm_plan (list of strings), irrigation_schedule (list of strings), vulnerability_analysis (string), confidence_note (string).
Return ONLY valid JSON — no markdown fences, no extra text."""


async def generate_recommendation(
    context: str, disease: str, crop: str, env_data: dict = None
) -> dict:
    """Call an OpenAI-compatible LLM to generate structured treatment advice."""
    settings = get_settings()

    if not settings.llm_api_key:
        return _fallback_recommendation(disease, crop)

    env_str = json.dumps(env_data, indent=2) if env_data else "No additional environmental data provided."

    user_prompt = (
        f"Crop: {crop}\nDisease: {disease}\n\n"
        f"Environmental & Weather Data:\n{env_str}\n\n"
        f"Research context:\n{context}\n\n"
        f"Provide a JSON object with ipm_plan, irrigation_schedule, vulnerability_analysis, and confidence_note."
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


def _fallback_recommendation(disease: str, crop: str) -> dict:
    """Return placeholder advice when LLM is unavailable."""
    return {
        "ipm_plan": [
            "Cultural: Remove and destroy infected plant parts immediately.",
            "Biological: Use beneficial microbes if available.",
            f"Chemical/Organic: Apply appropriate organic fungicide for {disease}."
        ],
        "irrigation_schedule": [
            "Day 1-2: Strict dry-down. Avoid overhead watering.",
            "Day 3-5: Targeted root-zone watering early in the morning."
        ],
        "vulnerability_analysis": "High humidity and current weather conditions create an optimal breeding ground for fungal spores. Moisture management is critical.",
        "confidence_note": "This is a placeholder recommendation. Connect an LLM API key for tailored advice.",
    }
