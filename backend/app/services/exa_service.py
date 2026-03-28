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


def _fallback_diagnosis_rag(visual_dimensions: dict) -> str:
    """When Exa is disabled, still pass vision copy into the synthesis step."""
    vs = visual_dimensions.get("visual_summary")
    text = vs if isinstance(vs, str) else ""
    lc = visual_dimensions.get("likely_crop")
    crop_hint = f"\nLikely crop (vision): {lc}" if lc else ""
    return (
        "EXA_API_KEY not set — no web retrieval. Rely on the structured visual analysis only."
        + crop_hint
        + "\n\nVisual summary:\n"
        + (text[:2500] if text else "(none)")
    )


async def search_diagnosis_rag(visual_dimensions: dict) -> str:
    """
    RAG for diagnosis: build a query from vision-model dimensions and return Exa snippets.
    """
    settings = get_settings()

    if not settings.exa_api_key:
        return _fallback_diagnosis_rag(visual_dimensions)

    parts: list[str] = []
    lc = visual_dimensions.get("likely_crop")
    if isinstance(lc, str) and lc.strip():
        parts.append(lc.strip())

    vs = visual_dimensions.get("visual_summary")
    if isinstance(vs, str) and vs.strip():
        parts.append(vs.strip()[:500])

    hypos = visual_dimensions.get("disease_hypotheses") or []
    if isinstance(hypos, list):
        for h in hypos[:5]:
            if isinstance(h, dict) and h.get("name"):
                parts.append(str(h["name"]))

    sym = visual_dimensions.get("symptoms_observed") or []
    if isinstance(sym, list):
        parts.extend(str(s) for s in sym[:8] if s)

    query = " ".join(parts) if parts else "crop plant disease identification agriculture"
    query = f"{query} agricultural plant pathology symptoms differential diagnosis"

    async with httpx.AsyncClient(timeout=20) as client:
        resp = await client.post(
            EXA_SEARCH_URL,
            headers={"x-api-key": settings.exa_api_key},
            json={
                "query": query,
                "num_results": 8,
                "use_autoprompt": True,
                "type": "auto",
            },
        )
        resp.raise_for_status()
        results = resp.json().get("results", [])

    snippets: list[str] = []
    for r in results[:8]:
        title = r.get("title") or ""
        text = r.get("text") or ""
        url = r.get("url") or ""
        line = " ".join(x for x in (title, text[:1200]) if x)
        if url:
            line = f"{line}\nSource: {url}"
        if line.strip():
            snippets.append(line.strip())

    if not snippets:
        return _fallback_diagnosis_rag(visual_dimensions)

    return "\n\n---\n\n".join(snippets)
