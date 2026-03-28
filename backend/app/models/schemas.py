from typing import Literal

from pydantic import BaseModel, Field, model_validator


class PredictionResponse(BaseModel):
    crop: str
    disease: str
    confidence: float


class FieldConditions(BaseModel):
    temperature_c: float | None = None
    relative_humidity_pct: float | None = None
    precipitation_mm: float | None = None
    weather_code: int | None = None
    wind_speed_kmh: float | None = None
    soil_moisture_0_7cm: float | None = Field(
        default=None,
        description="Volumetric soil moisture 0–7 cm (m³/m³)",
    )
    soil_moisture_7_28cm: float | None = None
    soil_temperature_0_7cm_c: float | None = None
    time_utc: str | None = None


class AirQuality(BaseModel):
    """Open-Meteo air-quality API (current) — concentrations in µg/m³ unless noted."""

    us_aqi: float | None = None
    european_aqi: float | None = None
    pm2_5: float | None = None
    pm10: float | None = None
    ozone: float | None = None
    nitrogen_dioxide: float | None = None
    sulphur_dioxide: float | None = None
    carbon_monoxide: float | None = None
    time_utc: str | None = None


class RecommendRequest(BaseModel):
    disease: str
    crop: str
    latitude: float | None = None
    longitude: float | None = None

    @model_validator(mode="after")
    def lat_lon_together(self):
        lat, lon = self.latitude, self.longitude
        if (lat is None) != (lon is None):
            raise ValueError("Provide both latitude and longitude, or neither.")
        if lat is not None:
            if not (-90 <= lat <= 90) or not (-180 <= lon <= 180):
                raise ValueError("Invalid coordinates.")
        return self


class RecommendResponse(BaseModel):
    treatment: str
    prevention: str
    fertilizer: str
    confidence_note: str
    irrigation_water: str = ""
    soil_health_yield: str = ""
    crop_practices_yield: str = ""
    air_quality_advice: str = ""
    yield_uplift_comparison: str = ""
    field_conditions: FieldConditions | None = None
    air_quality: AirQuality | None = None


class CopilotRequest(BaseModel):
    question: str = Field(..., min_length=1, max_length=2000)
    locale: Literal["en", "hi", "ur"] = "en"


class CopilotResponse(BaseModel):
    answer: str
