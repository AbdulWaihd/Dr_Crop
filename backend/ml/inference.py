"""
Legacy ResNet inference (optional / offline experiments).

Production `/predict` uses vision LLM + Exa RAG — see `app.services.vision_diagnosis_service`.
"""

import torch
from torchvision import transforms
from PIL import Image

from ml.model_loader import load_model, CLASS_NAMES

_transform = transforms.Compose(
    [
        transforms.Resize((224, 224)),
        transforms.ToTensor(),
        transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]),
    ]
)


def preprocess(image: Image.Image) -> torch.Tensor:
    """Convert a PIL image to a batched model-ready tensor."""
    return _transform(image).unsqueeze(0)


def predict(image: Image.Image) -> dict:
    """
    Run the full inference pipeline.
    Returns: {"crop": str, "disease": str, "confidence": float}
    """
    model = load_model()
    tensor = preprocess(image)

    with torch.no_grad():
        logits = model(tensor)
        probs = torch.softmax(logits, dim=1)
        confidence, idx = torch.max(probs, dim=1)

    class_label = CLASS_NAMES[idx.item()]
    # Labels follow "Crop__Disease" convention
    parts = class_label.split("__")
    crop = parts[0]
    disease = parts[1].replace("_", " ") if len(parts) > 1 else "Unknown"

    return {
        "crop": crop,
        "disease": disease,
        "confidence": round(confidence.item(), 4),
    }
