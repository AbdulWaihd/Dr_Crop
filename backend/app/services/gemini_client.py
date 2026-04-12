"""Google Gemini REST API (generateContent) — used when LLM_API_KEY is a Google API key (AIza…)."""

from __future__ import annotations

import httpx

GEMINI_API_ROOT = "https://generativelanguage.googleapis.com/v1beta"


def use_gemini_key(api_key: str) -> bool:
    return bool(api_key and api_key.strip().startswith("AIza"))


def _error_detail(response: httpx.Response) -> str:
    try:
        data = response.json()
        err = data.get("error")
        if isinstance(err, dict) and err.get("message"):
            return str(err["message"])[:800]
    except Exception:
        pass
    return (response.text or "")[:500]


def _extract_text(data: dict) -> str:
    cands = data.get("candidates") or []
    if not cands:
        err = data.get("promptFeedback") or data.get("error")
        raise RuntimeError(f"Gemini returned no candidates: {err!s}")
    parts = (cands[0].get("content") or {}).get("parts") or []
    texts: list[str] = []
    for p in parts:
        if isinstance(p, dict) and p.get("text"):
            texts.append(str(p["text"]))
    out = "".join(texts).strip()
    if not out:
        raise RuntimeError("Gemini returned empty text.")
    return out


async def gemini_generate_text(
    api_key: str,
    model: str,
    *,
    system_instruction: str,
    user_text: str,
    temperature: float = 0.3,
    max_output_tokens: int = 8192,
) -> str:
    url = f"{GEMINI_API_ROOT}/models/{model}:generateContent"
    body: dict = {
        "systemInstruction": {"parts": [{"text": system_instruction}]},
        "contents": [{"role": "user", "parts": [{"text": user_text}]}],
        "generationConfig": {
            "temperature": temperature,
            "maxOutputTokens": max_output_tokens,
        },
    }
    async with httpx.AsyncClient(timeout=120) as client:
        r = await client.post(url, params={"key": api_key}, json=body)
        r.raise_for_status()
        return _extract_text(r.json())


async def gemini_generate_vision(
    api_key: str,
    model: str,
    *,
    system_instruction: str,
    user_text: str,
    image_mime: str,
    image_base64: str,
    temperature: float = 0.2,
    max_output_tokens: int = 1200,
) -> str:
    """image_base64: raw base64 without data: URL prefix."""
    url = f"{GEMINI_API_ROOT}/models/{model}:generateContent"
    body: dict = {
        "systemInstruction": {"parts": [{"text": system_instruction}]},
        "contents": [
            {
                "role": "user",
                "parts": [
                    {"text": user_text},
                    {"inline_data": {"mime_type": image_mime, "data": image_base64}},
                ],
            }
        ],
        "generationConfig": {
            "temperature": temperature,
            "maxOutputTokens": max_output_tokens,
        },
    }
    async with httpx.AsyncClient(timeout=120) as client:
        r = await client.post(url, params={"key": api_key}, json=body)
        r.raise_for_status()
        return _extract_text(r.json())


def gemini_http_error_message(exc: httpx.HTTPStatusError) -> str:
    return _error_detail(exc.response) or str(exc)
