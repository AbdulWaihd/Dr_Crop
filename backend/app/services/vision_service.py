"""Vision service using Llama-3.2-11B-Vision-Instruct via HuggingFace Router."""

import base64
import json
import re
from typing import Any

from openai import OpenAI
from app.config import get_hf_token

import requests

HF_INFERENCE_URL = f"https://api-inference.huggingface.co/models/{VISION_MODEL}"

def analyze_plant_image(image_bytes: bytes) -> dict[str, Any]:
    """Analyze plant image using Vision LLM and return structured JSON."""
    token = get_hf_token()
    if not token:
        return {
            "crop": "Unknown",
            "disease": "Error: HF_TOKEN missing",
            "confidence": 0.0,
            "symptoms": "N/A"
        }

    # Encode image to base64
    image_b64 = base64.b64encode(image_bytes).decode("utf-8")

    try:
        print(f"[vision] Sending image to {VISION_MODEL} via Direct Inference API...")
        
        # Some providers on HF Router are flaky with vision base64.
        # Direct Inference API or the Chat completion endpoint via requests is more stable.
        response = requests.post(
            HF_INFERENCE_URL,
            headers={
                "Authorization": f"Bearer {token}",
                "Content-Type": "application/json"
            },
            json={
                "model": VISION_MODEL,
                "messages": [
                    {
                        "role": "user",
                        "content": [
                            {
                                "type": "image_url",
                                "image_url": { "url": f"data:image/jpeg;base64,{image_b64}" }
                            },
                            {
                                "type": "text",
                                "text": (
                                    "Analyze this plant leaf image. "
                                    "Respond ONLY with a JSON object containing: "
                                    '{"crop": "string", "disease": "string", "confidence": float, "symptoms": "string"}. '
                                    "If healthy, set disease to 'Healthy'."
                                )
                            }
                        ]
                    }
                ],
                "parameters": {
                    "max_new_tokens": 256,
                    "temperature": 0.1
                }
            },
            timeout=40
        )
        
        if response.status_code != 200:
            print(f"[vision] API Error {response.status_code}: {response.text}")
            raise Exception(f"Inference API returned {response.status_code}")

        res_json = response.json()
        
        # The inference API might return choices (chat format) or raw text depending on endpoint
        if isinstance(res_json, list):
            text = res_json[0].get("generated_text", "")
        elif "choices" in res_json:
            text = res_json["choices"][0]["message"]["content"]
        else:
            text = str(res_json)

        print(f"[vision] Received response: {text[:100]}...")
        
        # Extract JSON from response
        match = re.search(r"\{[\s\S]*\}", text)
        if not match:
            # Maybe the whole response is the JSON?
            return json.loads(text)
            
        return json.loads(match.group())

    except Exception as e:
        print(f"[vision] ERROR: Vision LLM failed: {e}")
        return {
            "crop": "Unknown",
            "disease": "Analysis failed",
            "confidence": 0.0,
            "symptoms": str(e)
        }

