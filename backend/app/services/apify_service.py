import httpx

from app.config import get_settings

APIFY_API_BASE = "https://api.apify.com/v2"


async def fetch_agriculture_data(query: str = "crop disease dataset") -> list[dict]:
    """
    Fetch agricultural data via Apify. Can be wired to a specific Apify actor
    for scraping agriculture databases, extension service sites, etc.
    """
    settings = get_settings()

    if not settings.apify_api_key:
        return _fallback_data()

    # Example: trigger a pre-built web-scraping actor and retrieve results.
    # Replace ACTOR_ID with an actual Apify actor for production use.
    actor_id = "apify~web-scraper"
    run_url = f"{APIFY_API_BASE}/acts/{actor_id}/runs"

    async with httpx.AsyncClient(timeout=60) as client:
        resp = await client.post(
            run_url,
            params={"token": settings.apify_api_key},
            json={
                "startUrls": [
                    {"url": "https://www.apsnet.org/edcenter/disandpath/Pages/default.aspx"}
                ],
                "pageFunction": "async function pageFunction(context) { return { title: document.title, url: context.request.url }; }",
            },
        )
        resp.raise_for_status()
        run_data = resp.json().get("data", {})

    return run_data.get("items", _fallback_data())


def _fallback_data() -> list[dict]:
    """Placeholder data when Apify is unavailable."""
    return [
        {
            "source": "PlantVillage",
            "url": "https://plantvillage.psu.edu",
            "description": "Open-access crop disease image dataset with 54K+ labeled images across 38 classes.",
        },
        {
            "source": "APS (American Phytopathological Society)",
            "url": "https://www.apsnet.org",
            "description": "Authoritative plant pathology resources and disease management guides.",
        },
    ]
