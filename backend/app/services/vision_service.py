"""Vision service using Llama-3.2-11B-Vision-Instruct via HuggingFace Router."""

import base64
import json
import re
from typing import Any

from openai import OpenAI
from app.config import get_hf_token

HF_ROUTER_URL = "https://router.huggingface.co/v1"
VISION_MODEL = "meta-llama/Llama-3.2-11B-Vision-Instruct"

def _get_client() -> OpenAI | None:
    token = get_hf_token()
    if not token:
        print("[vision] WARNING: HF_TOKEN not set")
        return None
    return OpenAI(base_url=HF_ROUTER_URL, api_key=token)

def analyze_plant_image(image_bytes: bytes) -> dict[str, Any]:
    """Analyze plant image using Vision LLM and return structured JSON."""
    client = _get_client()
    if not client:
        return {
            "crop": "Unknown",
            "disease": "Error: HF_TOKEN missing",
            "confidence": 0.0,
            "symptoms": "N/A"
        }

    # Encode image to base64
    image_b64 = base64.b64encode(image_bytes).decode("utf-8")

    try:
        print(f"[vision] Sending image to {VISION_MODEL}...")
        response = client.chat.completions.create(
            model=VISION_MODEL,
            messages=[
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "image_url",
                            "image_url": {
                                "url": f"data:image/jpeg;base64,{image_b64}"
                            }
                        },
                        {
                            "type": "text",
                            "text": (
                                "You are an expert agricultural plant pathologist. "
                                "Analyze this plant image and respond ONLY in this JSON format:\n"
                                "{\n"
                                '  "crop": "crop name",\n'
                                '  "disease": "disease name or Healthy",\n'
                                '  "confidence": 0.95,\n'
                                '  "symptoms": "brief description of visible symptoms"\n'
                                "}\n"
                                "If it is not a plant, return confidence 0.0."
                            )
                        }
                    ]
                }
            ],
            max_tokens=256,
            temperature=0.1,
        )
        
        text = response.choices[0].message.content or ""
        print(f"[vision] Received response: {text[:100]}...")
        
        # Extract JSON from response
        match = re.search(r"\{[\s\S]*\}", text)
        if not match:
            raise ValueError("No JSON found in response")
            
        return json.loads(match.group())

    except Exception as e:
        print(f"[vision] ERROR: Vision LLM failed: {e}")
        return {
            "crop": "Unknown",
            "disease": "Analysis failed",
            "confidence": 0.0,
            "symptoms": str(e)
        }
