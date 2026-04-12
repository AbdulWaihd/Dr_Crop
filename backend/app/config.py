from pathlib import Path

from dotenv import load_dotenv
from pydantic import AliasChoices, Field
from pydantic_settings import BaseSettings, SettingsConfigDict

# backend/ directory (parent of app/)
_BACKEND_DIR = Path(__file__).resolve().parent.parent
ENV_FILE_PATH = _BACKEND_DIR / ".env"

# Load .env into os.environ so it wins over empty system env vars (common Windows issue)
if ENV_FILE_PATH.is_file():
    load_dotenv(ENV_FILE_PATH, override=True, encoding="utf-8")


class Settings(BaseSettings):
    """Environment variables: set LLM_API_KEY or OPENAI_API_KEY in backend/.env."""

    exa_api_key: str = ""
    llm_api_key: str = Field(
        default="",
        validation_alias=AliasChoices("LLM_API_KEY", "OPENAI_API_KEY"),
    )
    apify_api_key: str = ""
    llm_base_url: str = "https://api.openai.com/v1"
    llm_model: str = "gpt-4o-mini"
    vision_model: str = "gpt-4o-mini"
    openweathermap_api_key: str = ""
    model_path: str = "ml/model.pth"
    allowed_origins: list[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3001",
    ]

    model_config = SettingsConfigDict(
        env_file=ENV_FILE_PATH,
        env_file_encoding="utf-8",
        env_ignore_empty=True,
        extra="ignore",
    )


def get_settings() -> Settings:
    return Settings()
