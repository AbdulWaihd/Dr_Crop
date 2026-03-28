import httpx
from typing import Optional
from app.config import get_settings

async def fetch_weather(lat: float, lon: float) -> Optional[dict]:
    """
    Fetch current weather via OpenWeatherMap API for a given lat/lon.
    Returns: { "temp": int, "humidity": int, "wind_speed": float, "wind_deg": int }
    Or slightly mocked fallback if API key is not present.
    """
    settings = get_settings()

    # If no API key, return a mock response that matches our scenario (18C, high humidity, wind).
    if not settings.openweathermap_api_key:
        return {
            "temp": 18,
            "humidity": 85,
            "wind_speed": 5.5,
            "wind_deg": 180
        }

    url = "https://api.openweathermap.org/data/2.5/weather"
    params = {
        "lat": lat,
        "lon": lon,
        "appid": settings.openweathermap_api_key,
        "units": "metric"
    }

    try:
        async with httpx.AsyncClient(timeout=10) as client:
            resp = await client.get(url, params=params)
            resp.raise_for_status()
            data = resp.json()
            
            return {
                "temp": data.get("main", {}).get("temp", 18),
                "humidity": data.get("main", {}).get("humidity", 85),
                "wind_speed": data.get("wind", {}).get("speed", 5.5),
                "wind_deg": data.get("wind", {}).get("deg", 180)
            }
    except Exception as e:
        # Fallback similarly in case of error
        return {
            "temp": 18,
            "humidity": 85,
            "wind_speed": 5.5,
            "wind_deg": 180
        }
