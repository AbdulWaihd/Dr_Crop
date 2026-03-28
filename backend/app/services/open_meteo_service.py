"""Weather + soil proxies from Open-Meteo (no API key)."""

import httpx

from app.models.schemas import AirQuality, FieldConditions

OPEN_METEO_FORECAST = "https://api.open-meteo.com/v1/forecast"
OPEN_METEO_AIR = "https://air-quality-api.open-meteo.com/v1/air-quality"

AIR_CURRENT_VARS = (
    "us_aqi,european_aqi,pm10,pm2_5,ozone,nitrogen_dioxide,"
    "sulphur_dioxide,carbon_monoxide"
)

CURRENT_VARS = (
    "temperature_2m,relative_humidity_2m,precipitation,weather_code,"
    "wind_speed_10m,soil_moisture_0_to_7cm,soil_moisture_7_to_28cm,"
    "soil_temperature_0_to_7cm"
)


async def fetch_field_conditions(latitude: float, longitude: float) -> FieldConditions | None:
    params = {
        "latitude": latitude,
        "longitude": longitude,
        "current": CURRENT_VARS,
        "timezone": "auto",
    }
    try:
        async with httpx.AsyncClient(timeout=15) as client:
            resp = await client.get(OPEN_METEO_FORECAST, params=params)
            resp.raise_for_status()
            data = resp.json()
    except (httpx.HTTPError, ValueError):
        return None

    cur = data.get("current") or {}
    if not cur:
        return None

    return FieldConditions(
        temperature_c=_num(cur.get("temperature_2m")),
        relative_humidity_pct=_num(cur.get("relative_humidity_2m")),
        precipitation_mm=_num(cur.get("precipitation")),
        weather_code=cur.get("weather_code"),
        wind_speed_kmh=_num(cur.get("wind_speed_10m")),
        soil_moisture_0_7cm=_num(cur.get("soil_moisture_0_to_7cm")),
        soil_moisture_7_28cm=_num(cur.get("soil_moisture_7_to_28cm")),
        soil_temperature_0_7cm_c=_num(cur.get("soil_temperature_0_to_7cm")),
        time_utc=cur.get("time"),
    )


async def fetch_air_quality(latitude: float, longitude: float) -> AirQuality | None:
    params = {
        "latitude": latitude,
        "longitude": longitude,
        "current": AIR_CURRENT_VARS,
        "timezone": "auto",
    }
    try:
        async with httpx.AsyncClient(timeout=15) as client:
            resp = await client.get(OPEN_METEO_AIR, params=params)
            resp.raise_for_status()
            data = resp.json()
    except (httpx.HTTPError, ValueError):
        return None

    cur = data.get("current") or {}
    if not cur:
        return None

    return AirQuality(
        us_aqi=_num(cur.get("us_aqi")),
        european_aqi=_num(cur.get("european_aqi")),
        pm2_5=_num(cur.get("pm2_5")),
        pm10=_num(cur.get("pm10")),
        ozone=_num(cur.get("ozone")),
        nitrogen_dioxide=_num(cur.get("nitrogen_dioxide")),
        sulphur_dioxide=_num(cur.get("sulphur_dioxide")),
        carbon_monoxide=_num(cur.get("carbon_monoxide")),
        time_utc=cur.get("time"),
    )


def _num(v) -> float | None:
    if v is None:
        return None
    try:
        return float(v)
    except (TypeError, ValueError):
        return None


def format_agro_context_for_llm(fc: FieldConditions) -> str:
    lines: list[str] = []
    if fc.temperature_c is not None:
        lines.append(f"Air temperature: {fc.temperature_c:.1f} °C")
    if fc.relative_humidity_pct is not None:
        lines.append(f"Relative humidity: {fc.relative_humidity_pct:.0f}%")
    if fc.precipitation_mm is not None:
        lines.append(f"Recent precipitation (interval): {fc.precipitation_mm:.1f} mm")
    if fc.wind_speed_kmh is not None:
        lines.append(f"Wind speed (10 m): {fc.wind_speed_kmh:.1f} km/h")
    if fc.soil_moisture_0_7cm is not None:
        lines.append(
            f"Soil moisture (0–7 cm): {fc.soil_moisture_0_7cm:.3f} m³/m³ "
            "(higher = wetter; typical 0.1–0.45 depending on texture)"
        )
    if fc.soil_moisture_7_28cm is not None:
        lines.append(f"Soil moisture (7–28 cm): {fc.soil_moisture_7_28cm:.3f} m³/m³")
    if fc.soil_temperature_0_7cm_c is not None:
        lines.append(f"Soil temperature (0–7 cm): {fc.soil_temperature_0_7cm_c:.1f} °C")
    if not lines:
        return "No current weather/soil variables parsed."
    return "\n".join(lines)


def format_air_quality_for_llm(aq: AirQuality) -> str:
    lines: list[str] = []
    if aq.us_aqi is not None:
        lines.append(f"US Air Quality Index (AQI): {aq.us_aqi:.0f} (higher = worse)")
    if aq.european_aqi is not None:
        lines.append(f"European AQI: {aq.european_aqi:.0f}")
    if aq.pm2_5 is not None:
        lines.append(f"PM2.5: {aq.pm2_5:.1f} µg/m³ (fine particles — leaf/soil deposition, health)")
    if aq.pm10 is not None:
        lines.append(f"PM10: {aq.pm10:.1f} µg/m³ (coarse dust — can shade leaves, abrade)")
    if aq.ozone is not None:
        lines.append(
            f"Ground-level ozone (O3): {aq.ozone:.1f} µg/m³ (oxidant stress — leaf injury, yield)"
        )
    if aq.nitrogen_dioxide is not None:
        lines.append(f"Nitrogen dioxide (NO2): {aq.nitrogen_dioxide:.1f} µg/m³")
    if aq.sulphur_dioxide is not None:
        lines.append(f"Sulphur dioxide (SO2): {aq.sulphur_dioxide:.1f} µg/m³")
    if aq.carbon_monoxide is not None:
        lines.append(f"Carbon monoxide (CO): {aq.carbon_monoxide:.1f} µg/m³")
    if not lines:
        return "No air quality variables parsed."
    return "\n".join(lines)
