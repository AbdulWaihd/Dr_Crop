"""HuggingFace Inference API for plant disease image classification."""

import requests

from app.config import get_hf_token

HF_MODEL_URL = "https://api-inference.huggingface.co/models/prof-freakenstein/plantnet-disease-detection"




def _parse_label(label: str) -> tuple[str, str]:
    """Parse HF label format 'Crop___Disease_Name' into (crop, disease).

    Examples:
        'Tomato___Early_blight'  -> ('Tomato', 'Early Blight')
        'Corn_(maize)___Common_rust_'  -> ('Corn (Maize)', 'Common Rust')
        'Tomato___healthy'  -> ('Tomato', 'Healthy')
    """
    parts = label.split("___")
    if len(parts) == 2:
        crop_raw, disease_raw = parts
    else:
        # Fallback if format is unexpected
        crop_raw = parts[0] if parts else "Unknown"
        disease_raw = "___".join(parts[1:]) if len(parts) > 1 else "Unknown"

    # Clean up underscores → spaces, title case
    crop = crop_raw.replace("_", " ").strip().title()
    disease = disease_raw.replace("_", " ").strip().title()

    # Fix common parenthetical like "Corn (maize)" → "Corn (Maize)"
    if not disease or disease.lower() == "healthy":
        disease = "Healthy"

    return crop, disease


def predict_disease(image_bytes: bytes) -> dict:
    """Send image to HF Inference API and return structured prediction.

    Returns: {"crop": str, "disease": str, "confidence": float}
    """
    token = get_hf_token()
    if not token:
        print("[predict] WARNING: HF_TOKEN not set — returning mock prediction")
        return {"crop": "Tomato", "disease": "Early Blight", "confidence": 0.5}

    headers = {"Authorization": f"Bearer {token}"}

    try:
        print(f"[predict] Sending image ({len(image_bytes)} bytes) to HF Inference API...")
        response = requests.post(HF_MODEL_URL, headers=headers, data=image_bytes, timeout=60)
        response.raise_for_status()
        results = response.json()
        print(f"[predict] HF response: {results[:3] if isinstance(results, list) else results}")
    except requests.exceptions.RequestException as e:
        print(f"[predict] ERROR: HF Inference API failed: {e}")
        return {"crop": "Tomato", "disease": "Early Blight", "confidence": 0.5}
    except Exception as e:
        print(f"[predict] ERROR: Unexpected error: {e}")
        return {"crop": "Tomato", "disease": "Early Blight", "confidence": 0.5}

    # HF returns a list of [{label, score}, ...] sorted by confidence
    if not isinstance(results, list) or len(results) == 0:
        print(f"[predict] WARNING: Unexpected response format: {results}")
        return {"crop": "Tomato", "disease": "Early Blight", "confidence": 0.5}

    top = results[0]
    label = top.get("label", "Unknown___Unknown")
    score = float(top.get("score", 0.5))

    crop, disease = _parse_label(label)
    print(f"[predict] Result: crop={crop}, disease={disease}, confidence={score:.4f}")

    return {"crop": crop, "disease": disease, "confidence": round(score, 4)}
