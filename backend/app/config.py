from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    exa_api_key: str = ""
    llm_api_key: str = ""
    apify_api_key: str = ""
    llm_base_url: str = "https://api.openai.com/v1"
    llm_model: str = "gpt-4o-mini"
    openweathermap_api_key: str = ""
    model_path: str = "ml/model.pth"
    allowed_origins: list[str] = ["http://localhost:3000"]

    model_config = {"env_file": ".env", "extra": "ignore"}


@lru_cache
def get_settings() -> Settings:
    return Settings()
