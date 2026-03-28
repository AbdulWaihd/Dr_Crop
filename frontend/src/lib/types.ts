export interface PredictionResult {
  crop: string;
  disease: string;
  confidence: number;
}

export interface FieldConditions {
  temperature_c: number | null;
  relative_humidity_pct: number | null;
  precipitation_mm: number | null;
  weather_code: number | null;
  wind_speed_kmh: number | null;
  soil_moisture_0_7cm: number | null;
  soil_moisture_7_28cm: number | null;
  soil_temperature_0_7cm_c: number | null;
  time_utc: string | null;
}

export interface AirQuality {
  us_aqi: number | null;
  european_aqi: number | null;
  pm2_5: number | null;
  pm10: number | null;
  ozone: number | null;
  nitrogen_dioxide: number | null;
  sulphur_dioxide: number | null;
  carbon_monoxide: number | null;
  time_utc: string | null;
}

export interface Recommendation {
  treatment: string;
  prevention: string;
  fertilizer: string;
  confidence_note: string;
  irrigation_water?: string;
  soil_health_yield?: string;
  crop_practices_yield?: string;
  air_quality_advice?: string;
  /** Indicative comparison: likely yield vs ignoring advice (LLM + disclaimer). */
  yield_uplift_comparison?: string;
  field_conditions?: FieldConditions | null;
  air_quality?: AirQuality | null;
}

export interface FullDiagnosisResponse {
  prediction: PredictionResult;
  recommendation: Recommendation;
}
