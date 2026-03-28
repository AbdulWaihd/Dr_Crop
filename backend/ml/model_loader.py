"""
Model loader — swap the placeholder for a real trained model.

Supported approach:
  1. Fine-tuned ResNet/EfficientNet on PlantVillage dataset
  2. Drop a .pth file into /backend/ml/ and update CLASS_NAMES
"""

import torch
import torch.nn as nn
from torchvision import models
from functools import lru_cache

CLASS_NAMES: list[str] = [
    "Tomato__Early_Blight",
    "Tomato__Late_Blight",
    "Tomato__Healthy",
    "Potato__Early_Blight",
    "Potato__Late_Blight",
    "Potato__Healthy",
    "Corn__Common_Rust",
    "Corn__Northern_Leaf_Blight",
    "Corn__Healthy",
    "Apple__Apple_Scab",
    "Apple__Black_Rot",
    "Apple__Healthy",
]

NUM_CLASSES = len(CLASS_NAMES)


def _build_model() -> nn.Module:
    """Build a ResNet-18 with the correct output head."""
    model = models.resnet18(weights=None)
    model.fc = nn.Linear(model.fc.in_features, NUM_CLASSES)
    return model


@lru_cache(maxsize=1)
def load_model(model_path: str | None = None) -> nn.Module:
    """
    Load model weights from disk. Falls back to random-init placeholder
    if no checkpoint exists (sufficient for demo/hackathon).
    """
    model = _build_model()

    if model_path:
        try:
            state = torch.load(model_path, map_location="cpu", weights_only=True)
            model.load_state_dict(state)
            print(f"[ML] Loaded weights from {model_path}")
        except FileNotFoundError:
            print("[ML] No checkpoint found — using random-init placeholder model")

    model.eval()
    return model
