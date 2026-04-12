"""Image diagnosis: vision LLM → dimensions → Exa RAG → synthesis."""

import base64
import io
import json
import re
from typing import Any

import httpx
from PIL import Image

from app.config import get_settings
from app.services.exa_service import _fallback_diagnosis_rag, search_diagnosis_rag
from app.services.gemini_client import (
    gemini_generate_text,
    gemini_generate_vision,
    gemini_http_error_message,
    use_gemini_key,
)

MAX_IMAGE_EDGE = 1280
JPEG_QUALITY = 88

VISION_SYSTEM = """You are an expert plant pathologist assistant. Examine the agricultural image.
Return ONLY a JSON object (no markdown fences) with exactly these keys:
- plant_part: string, one of leaf|stem|fruit|flower|whole_plant|unknown
- likely_crop: string or null if the crop cannot be identified from the image
- symptoms_observed: array of short symptom strings (e.g. "concentric rings", "water-soaked lesions")
- visual_summary: string, 2-5 sentences of objective visual description (colors, patterns, affected area)
- healthy_likelihood: number from 0 to 1 (1 = appears completely healthy)
- disease_hypotheses: array of at most 5 objects, each { "name": string, "confidence": number 0-1 },
  best guesses for disease or pest issues; use "Healthy" with high confidence only if appropriate

Rules: If the image is not a plant, is a random object, or is unusably blurry, set likely_crop to null,
healthy_likelihood to 0, disease_hypotheses to [], and explain in visual_summary. Never invent a specific crop name without visual evidence."""

SYNTHESIS_SYSTEM = """You are an agronomist synthesizing a final diagnosis.
You receive (1) structured visual analysis from a vision model and (2) optional web research snippets from Exa.
Produce a single JSON object with exactly these keys:
- crop: string (best estimate; use "Unknown" if uncertain)
- disease: string (disease name, pest, disorder, or "Healthy" / "Unable to determine")
- confidence: number from 0 to 1 reflecting certainty of crop AND condition together

Weight the vision analysis heavily; use research snippets to disambiguate similar diseases and spell names correctly.
If evidence is weak, lower confidence and prefer "Unable to determine" for disease.
Return ONLY valid JSON, no markdown."""


def _resize_image(image: Image.Image) -> Image.Image:
    image = image.convert("RGB")
    w, h = image.size
    m = max(w, h)
    if m <= MAX_IMAGE_EDGE:
        return image
    scale = MAX_IMAGE_EDGE / m
    return image.resize((int(w * scale), int(h * scale)), Image.Resampling.LANCZOS)


def _image_to_data_url(image: Image.Image) -> str:
    buf = io.BytesIO()
    _resize_image(image).save(buf, format="JPEG", quality=JPEG_QUALITY, optimize=True)
    b64 = base64.standard_b64encode(buf.getvalue()).decode("ascii")
    return f"data:image/jpeg;base64,{b64}"


def _openai_error_message(response: httpx.Response) -> str:
    """Short, safe message from OpenAI-compatible error JSON."""
    try:
        data = response.json()
        err = data.get("error")
        if isinstance(err, dict) and err.get("message"):
            return str(err["message"])[:500]
        if isinstance(err, str):
            return err[:500]
    except Exception:
        pass
    return (response.text or "")[:500]


def _parse_json_object(text: str) -> dict[str, Any]:
    text = text.strip()
    m = re.search(r"\{[\s\S]*\}", text)
    if not m:
        raise ValueError("No JSON object in model response")
    return json.loads(m.group())


async def extract_visual_dimensions(image: Image.Image) -> dict[str, Any]:
    settings = get_settings()
    if not settings.llm_api_key:
        raise RuntimeError("LLM_API_KEY is required for vision-based diagnosis")

    data_url = _image_to_data_url(image)
    user_text = (
        "Analyze this image for crop disease screening. "
        "Follow the JSON schema in the system instructions exactly."
    )

    try:
        if use_gemini_key(settings.llm_api_key):
            if "," not in data_url:
                raise RuntimeError("Invalid image data URL for Gemini.")
            raw_b64 = data_url.split(",", 1)[1]
            content = await gemini_generate_vision(
                settings.llm_api_key.strip(),
                settings.vision_model,
                system_instruction=VISION_SYSTEM,
                user_text=user_text,
                image_mime="image/jpeg",
                image_base64=raw_b64,
                temperature=0.2,
                max_output_tokens=1200,
            )
        else:
            payload = {
                "model": settings.vision_model,
                "messages": [
                    {"role": "system", "content": VISION_SYSTEM},
                    {
                        "role": "user",
                        "content": [
                            {"type": "text", "text": user_text},
                            {"type": "image_url", "image_url": {"url": data_url}},
                        ],
                    },
                ],
                "temperature": 0.2,
                "max_tokens": 1200,
            }
            async with httpx.AsyncClient(timeout=90) as client:
                resp = await client.post(
                    f"{settings.llm_base_url}/chat/completions",
                    headers={"Authorization": f"Bearer {settings.llm_api_key}"},
                    json=payload,
                )
                resp.raise_for_status()
                content = resp.json()["choices"][0]["message"]["content"]
    except httpx.HTTPStatusError as e:
        msg = (
            gemini_http_error_message(e)
            if use_gemini_key(settings.llm_api_key)
            else _openai_error_message(e.response)
        )
        raise RuntimeError(
            f"Vision API HTTP {e.response.status_code}: {msg or e!s}. "
            "Check LLM_API_KEY, billing, and that VISION_MODEL supports images."
        ) from e
    except httpx.RequestError as e:
        raise RuntimeError(
            f"Cannot reach LLM server at {settings.llm_base_url}: {e!s}"
        ) from e

    try:
        return _parse_json_object(content)
    except (json.JSONDecodeError, ValueError) as e:
        raise RuntimeError(f"Vision model returned invalid JSON: {e!s}") from e


async def synthesize_diagnosis(
    dimensions: dict[str, Any], exa_context: str
) -> dict[str, Any]:
    settings = get_settings()
    if not settings.llm_api_key:
        raise RuntimeError("LLM_API_KEY is required")

    user_prompt = (
        "Visual analysis (JSON):\n"
        + json.dumps(dimensions, ensure_ascii=False)
        + "\n\nResearch context (may be partial or empty):\n"
        + (exa_context[:12000] if exa_context else "(none)")
    )

    try:
        if use_gemini_key(settings.llm_api_key):
            content = await gemini_generate_text(
                settings.llm_api_key.strip(),
                settings.llm_model,
                system_instruction=SYNTHESIS_SYSTEM,
                user_text=user_prompt,
                temperature=0.15,
                max_output_tokens=1024,
            )
        else:
            async with httpx.AsyncClient(timeout=60) as client:
                resp = await client.post(
                    f"{settings.llm_base_url}/chat/completions",
                    headers={"Authorization": f"Bearer {settings.llm_api_key}"},
                    json={
                        "model": settings.llm_model,
                        "messages": [
                            {"role": "system", "content": SYNTHESIS_SYSTEM},
                            {"role": "user", "content": user_prompt},
                        ],
                        "temperature": 0.15,
                        "max_tokens": 500,
                    },
                )
                resp.raise_for_status()
                content = resp.json()["choices"][0]["message"]["content"]
    except httpx.HTTPStatusError as e:
        msg = (
            gemini_http_error_message(e)
            if use_gemini_key(settings.llm_api_key)
            else _openai_error_message(e.response)
        )
        raise RuntimeError(
            f"Synthesis API HTTP {e.response.status_code}: {msg or e!s}"
        ) from e
    except httpx.RequestError as e:
        raise RuntimeError(f"Cannot reach LLM server: {e!s}") from e

    try:
        out = _parse_json_object(content)
    except (json.JSONDecodeError, ValueError) as e:
        raise RuntimeError(f"Synthesis model returned invalid JSON: {e!s}") from e

    crop = str(out.get("crop", "Unknown")).strip() or "Unknown"
    disease = str(out.get("disease", "Unable to determine")).strip() or "Unable to determine"
    conf = out.get("confidence", 0.5)
    try:
        c = float(conf)
    except (TypeError, ValueError):
        c = 0.5
    c = max(0.0, min(1.0, c))

    return {"crop": crop, "disease": disease, "confidence": round(c, 4)}


def _fallback_from_dimensions(dimensions: dict[str, Any]) -> dict[str, Any]:
    crop = dimensions.get("likely_crop")
    if isinstance(crop, str) and crop.strip():
        crop = crop.strip()
    else:
        crop = "Unknown"

    hl = dimensions.get("healthy_likelihood")
    try:
        hl_f = float(hl) if hl is not None else 0.0
    except (TypeError, ValueError):
        hl_f = 0.0
    hl_f = max(0.0, min(1.0, hl_f))

    hypos = dimensions.get("disease_hypotheses") or []
    disease = "Unable to determine"
    conf = 0.35
    if isinstance(hypos, list) and hypos:
        first = hypos[0]
        if isinstance(first, dict) and first.get("name"):
            disease = str(first["name"]).strip()
            try:
                conf = float(first.get("confidence", 0.4))
            except (TypeError, ValueError):
                conf = 0.4
            conf = max(0.0, min(1.0, conf)) * 0.85
    elif hl_f >= 0.72:
        disease = "Healthy"
        conf = hl_f * 0.88

    if hl_f >= 0.75 and "healthy" in disease.lower():
        conf = max(conf, hl_f * 0.88)

    return {
        "crop": crop,
        "disease": disease,
        "confidence": round(max(0.1, min(0.95, conf)), 4),
    }


async def diagnose_from_image(image: Image.Image) -> dict[str, Any]:
    dimensions = await extract_visual_dimensions(image)
    try:
        exa_context = await search_diagnosis_rag(dimensions)
    except Exception:
        exa_context = _fallback_diagnosis_rag(dimensions)

    try:
        return await synthesize_diagnosis(dimensions, exa_context)
    except Exception:
        return _fallback_from_dimensions(dimensions)
