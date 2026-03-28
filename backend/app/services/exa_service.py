import httpx

from app.config import get_settings

EXA_SEARCH_URL = "https://api.exa.ai/search"


async def search_agriculture_context(disease: str, crop: str) -> str:
    """Query Exa AI for relevant agricultural knowledge about a crop disease."""
    settings = get_settings()

    if not settings.exa_api_key:
        return _fallback_context(disease, crop)

    query = f"{crop} {disease} treatment prevention agricultural advice"

    async with httpx.AsyncClient(timeout=15) as client:
        resp = await client.post(
            EXA_SEARCH_URL,
            headers={"x-api-key": settings.exa_api_key},
            json={
                "query": query,
                "num_results": 5,
                "use_autoprompt": True,
                "type": "auto",
            },
        )
        resp.raise_for_status()
        results = resp.json().get("results", [])

    snippets = [r.get("text", r.get("title", "")) for r in results[:5]]
    return "\n\n".join(snippets) if snippets else _fallback_context(disease, crop)


def _fallback_context(disease: str, crop: str) -> str:
    """Provide minimal context when Exa is unavailable."""
    return (
        f"{crop} affected by {disease}. Common treatments include fungicide application, "
        f"crop rotation, removing infected leaves, and ensuring proper spacing for airflow."
    )
