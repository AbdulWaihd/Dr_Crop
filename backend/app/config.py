"""Dr. Crop backend configuration — single HF_TOKEN drives everything."""

import os
from pathlib import Path

from dotenv import load_dotenv

_BACKEND_DIR = Path(__file__).resolve().parent.parent
ENV_FILE_PATH = _BACKEND_DIR / ".env"

if ENV_FILE_PATH.is_file():
    load_dotenv(ENV_FILE_PATH, override=True, encoding="utf-8")


def get_hf_token() -> str:
    """Return HF_TOKEN from environment, or empty string."""
    return os.environ.get("HF_TOKEN", "").strip()
