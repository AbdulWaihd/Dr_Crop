"""RAG context service using DuckDuckGo search with Wikipedia fallback."""

from duckduckgo_search import DDGS
import wikipediaapi


def search_context(crop: str, disease: str) -> str:
    """Fetch RAG context for a crop disease using DuckDuckGo, fallback to Wikipedia.

    Returns a combined context string from top search results.
    """
    query = f"{crop} {disease} treatment prevention fertilizer"

    # Try DuckDuckGo first
    context = _search_duckduckgo(query)
    if context:
        return context

    # Fallback to Wikipedia
    print("[rag] DuckDuckGo failed, trying Wikipedia...")
    context = _search_wikipedia(f"{crop} {disease}")
    if context:
        return context

    print("[rag] All search methods failed, returning empty context")
    return ""


def _search_duckduckgo(query: str) -> str:
    """Search DuckDuckGo and return combined body text from top 3 results."""
    try:
        print(f"[rag] Searching DuckDuckGo: '{query}'")
        with DDGS() as ddgs:
            results = list(ddgs.text(query, max_results=3))

        if not results:
            print("[rag] DuckDuckGo returned no results")
            return ""

        bodies = []
        for r in results:
            title = r.get("title", "")
            body = r.get("body", "")
            if body:
                bodies.append(f"**{title}**: {body}")

        combined = "\n\n".join(bodies)
        print(f"[rag] DuckDuckGo returned {len(results)} results ({len(combined)} chars)")
        return combined

    except Exception as e:
        print(f"[rag] ERROR: DuckDuckGo search failed: {e}")
        return ""


def _search_wikipedia(query: str) -> str:
    """Search Wikipedia and return page summary as fallback."""
    try:
        print(f"[rag] Searching Wikipedia: '{query}'")
        wiki = wikipediaapi.Wikipedia(
            user_agent="DrCrop/2.0 (https://github.com/AbdulWaihd/Dr_Crop)",
            language="en",
        )
        page = wiki.page(query)

        if page.exists():
            summary = page.summary[:3000]  # Limit to 3000 chars
            print(f"[rag] Wikipedia found: '{page.title}' ({len(summary)} chars)")
            return f"**{page.title}** (Wikipedia): {summary}"

        # Try just the disease name
        disease_only = query.split()[-1] if " " in query else query
        page = wiki.page(disease_only)
        if page.exists():
            summary = page.summary[:3000]
            print(f"[rag] Wikipedia found (disease only): '{page.title}' ({len(summary)} chars)")
            return f"**{page.title}** (Wikipedia): {summary}"

        print("[rag] Wikipedia: no matching page found")
        return ""

    except Exception as e:
        print(f"[rag] ERROR: Wikipedia search failed: {e}")
        return ""
