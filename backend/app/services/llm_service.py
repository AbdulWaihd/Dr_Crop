"""LLM service using Kimi-K2 via HuggingFace Router for treatment recommendations and copilot."""

import json
import re
from typing import Any

from openai import OpenAI

from app.config import get_hf_token

HF_BASE_URL = "https://router.huggingface.co/v1"
HF_MODEL = "moonshotai/Kimi-K2-Instruct"

# ─── Recommendation system prompt ───────────────────────────────────────────

SYSTEM_PROMPT = """\
You are an expert agricultural scientist. You receive a crop, disease diagnosis, optional research context,
and optional live field data: weather/soil estimates and/or air quality.

Return a single JSON object with EXACTLY these keys (all strings):
treatment, prevention, fertilizer, confidence_note,
irrigation_water, soil_health_yield, crop_practices_yield, air_quality_advice, yield_uplift_comparison.

- treatment / prevention / fertilizer: focus on the diagnosed problem (if the plant is healthy,
  give brief maintenance and monitoring tips instead of chemical treatment).
- irrigation_water: timing irrigation, drainage, rainfall — tied to weather/soil data when provided.
- soil_health_yield: organic matter, pH, compaction, mulch, nutrients for maximum yield.
- crop_practices_yield: cultivar, spacing, rotation, scouting, harvest timing for best yield.
- air_quality_advice: give general best practice for crop protection from air pollution.
- yield_uplift_comparison: compare likely yield if the farmer IGNORES the advice versus if they FOLLOW it.
  Give an indicative percentage range. State clearly this is an indicative estimate only.

If weather/soil or air data is missing, still give sound general advice for the crop.
Return ONLY valid JSON — no markdown fences, no extra text."""

RECOMMEND_KEYS = (
    "treatment",
    "prevention",
    "fertilizer",
    "confidence_note",
    "irrigation_water",
    "soil_health_yield",
    "crop_practices_yield",
    "air_quality_advice",
    "yield_uplift_comparison",
)

_RECOMMEND_LANG: dict[str, str] = {
    "en": "Write every field of the JSON response in English.",
    "hi": "CRITICAL RULE: Write EVERY SINGLE FIELD of the JSON response entirely in Hindi (Devanagari script). DO NOT include any English text, words, or headings inside the fields. Translate everything.",
    "ur": "CRITICAL RULE: Write EVERY SINGLE FIELD of the JSON response entirely in Urdu (Arabic/Nastaliq script). DO NOT include any English text, words, or headings inside the fields. Translate everything.",
}

# ─── Copilot system prompt ──────────────────────────────────────────────────

COPILOT_SYSTEM_BASE = """\
You are a warm, respectful farming copilot for smallholders and rural farmers \
(including areas with limited connectivity or formal extension). \
Use simple, everyday language. Short sentences. If you must use a technical term, add one plain-language line. \
Never talk down to the farmer. Give practical steps they can try soon. \
If the question is unclear, end with one short clarifying question. \
Topics: crops, soil, water, pests, diseases (general), weather, storage, nutrients, organic options, safe chemical use. \
Do not invent government scheme amounts, dates, or subsidies — say the farmer should confirm with local extension / Krishi Kendra. \
Keep the reply under about 350 words unless a short numbered list is clearly better.

IMPORTANT — LANGUAGE RULE (highest priority, override everything else): {lang_rule} \
Even if the farmer writes in a different language, you MUST reply in {lang_name} only. No exceptions."""

_COPILOT_LANG_META: dict[str, dict[str, str]] = {
    "en": {"rule": "Reply ONLY in English.", "name": "English"},
    "hi": {"rule": "CRITICAL RULE: You MUST reply entirely in Hindi using Devanagari script. DO NOT output any English text, headings, or words. Translate everything to Hindi.", "name": "Hindi (हिन्दी)"},
    "ur": {"rule": "CRITICAL RULE: You MUST reply entirely in Urdu using Arabic/Nastaliq script. DO NOT output any English text, headings, or words. Translate everything to Urdu.", "name": "Urdu (اردو)"},
}


# ─── Helpers ────────────────────────────────────────────────────────────────

def _get_client() -> OpenAI | None:
    """Create an OpenAI client pointing at HuggingFace Router."""
    token = get_hf_token()
    if not token:
        print("[llm] WARNING: HF_TOKEN not set — cannot call LLM")
        return None
    return OpenAI(base_url=HF_BASE_URL, api_key=token)


def _parse_json_object(text: str) -> dict[str, Any]:
    """Extract JSON object from LLM response text."""
    text = text.strip()
    m = re.search(r"\{[\s\S]*\}", text)
    if not m:
        raise ValueError("No JSON object in model response")
    return json.loads(m.group())


# ─── Recommendation ────────────────────────────────────────────────────────

def _fallback_recommendation(disease: str, crop: str) -> dict[str, str]:
    """Return hardcoded template when LLM is unavailable."""
    return {
        "treatment": f"For {disease} on {crop}: follow label directions for appropriate crop protection; remove heavily infected tissue and improve airflow.",
        "prevention": "Rotate crops, choose resistant varieties where available, avoid prolonged leaf wetness, and scout early.",
        "fertilizer": f"Apply balanced nutrition based on a soil test; avoid excess N on {crop} that favors disease-prone lush growth.",
        "confidence_note": "This is a template response — LLM was unavailable. Add HF_TOKEN for AI-powered recommendations.",
        "irrigation_water": "Irrigate deeply and less often to encourage rooting; adjust for recent rain and forecast.",
        "soil_health_yield": "Build organic matter with compost or cover crops, maintain pH for your crop, and minimize compaction.",
        "crop_practices_yield": f"Use optimal planting density for {crop}, keep field records, and time operations to reduce plant stress.",
        "air_quality_advice": "Avoid foliar sprays during smog, rinse dust from leaves after storms, keep plants well-watered to reduce pollution stress.",
        "yield_uplift_comparison": f"If {disease} on {crop} is left unmanaged, yield losses of 15-50% are common. Following treatment steps can recover much of that gap.",
    }


# Simple in-memory cache for recommendations
_RECOMMEND_CACHE: dict[str, dict[str, str]] = {}


async def generate_recommendation(
    context: str,
    disease: str,
    crop: str,
    field_context: str = "",
    air_quality: Any = None,
    locale: str = "en",
) -> dict[str, str]:
    """Call Kimi-K2 via HF Router to generate treatment recommendations."""
    # Check cache first
    cache_key = f"{crop}:{disease}:{locale}"
    if cache_key in _RECOMMEND_CACHE:
        print(f"[llm] Cache hit for {cache_key}")
        return _RECOMMEND_CACHE[cache_key]


    client = _get_client()

    if client is None:
        return _fallback_recommendation(disease, crop)

    field_block = (
        f"\n\nField context (weather/soil and/or air quality):\n{field_context}\n"
        if field_context.strip()
        else "\n\nField weather/soil/air: not provided — give general best-practice advice.\n"
    )

    lang_instruction = _RECOMMEND_LANG.get(locale, _RECOMMEND_LANG["en"])
    user_prompt = (
        f"Language instruction: {lang_instruction}\n\n"
        f"Crop: {crop}\nDisease / condition: {disease}\n\n"
        f"Research context:\n{context}\n"
        f"{field_block}"
        f"Respond with the JSON object using these keys: {', '.join(RECOMMEND_KEYS)}."
    )

    try:
        print(f"[llm] Generating recommendation for {crop}/{disease} (locale={locale})...")
        completion = client.chat.completions.create(
            model=HF_MODEL,
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": user_prompt},
            ],
            temperature=0.3,
            max_tokens=4096,
        )
        content = completion.choices[0].message.content or ""
        print(f"[llm] Recommendation response received ({len(content)} chars)")
    except Exception as e:
        print(f"[llm] ERROR: Kimi-K2 recommendation failed: {e}")
        return _fallback_recommendation(disease, crop)

    try:
        raw = _parse_json_object(content)
        # Merge with fallback to ensure all keys exist
        fallback = _fallback_recommendation(disease, crop)
        for key in RECOMMEND_KEYS:
            val = raw.get(key)
            if isinstance(val, str) and val.strip():
                fallback[key] = val.strip()
        
        # Cache the successful result
        _RECOMMEND_CACHE[cache_key] = fallback
        return fallback
    except (json.JSONDecodeError, ValueError) as e:

        print(f"[llm] WARNING: Could not parse JSON from LLM: {e}")
        return _fallback_recommendation(disease, crop)


# ─── Copilot ───────────────────────────────────────────────────────────────

async def generate_copilot_answer(question: str, locale: str) -> str:
    """Fast farming Q&A using Kimi-K2 in the requested language."""
    client = _get_client()
    if client is None:
        return _copilot_fallback_no_key(locale)

    meta = _COPILOT_LANG_META.get(locale, _COPILOT_LANG_META["en"])
    system_prompt = COPILOT_SYSTEM_BASE.format(
        lang_rule=meta["rule"],
        lang_name=meta["name"],
    )
    user_content = f"Farmer's question:\n{question.strip()}"

    try:
        print(f"[copilot] Question: '{question[:80]}...' (locale={locale})")
        completion = client.chat.completions.create(
            model=HF_MODEL,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_content},
            ],
            temperature=0.4,
            max_tokens=2048,
        )
        answer = (completion.choices[0].message.content or "").strip()
        print(f"[copilot] Response received ({len(answer)} chars)")
        return answer
    except Exception as e:
        print(f"[copilot] ERROR: Kimi-K2 copilot failed: {e}")
        return _copilot_fallback_no_key(locale)


def _copilot_fallback_no_key(locale: str) -> str:
    texts = {
        "en": "The farming assistant needs an HF_TOKEN on the server. Please ask whoever runs the app to set HF_TOKEN in backend/.env.",
        "hi": "फार्मिंग सहायक के लिए सर्वर पर HF_TOKEN चाहिए। कृपया ऐप चलाने वाले से backend/.env में HF_TOKEN लगाने को कहें।",
        "ur": "فارمنگ معاون کے لیے سرور پر HF_TOKEN درکار ہے۔ براہ کرم ایپ چلانے والے سے کہیں کہ backend/.env میں HF_TOKEN لگائیں۔",
    }
    return texts.get(locale, texts["en"])
