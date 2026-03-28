import type {
  PredictionResult,
  Recommendation,
  FullDiagnosisResponse,
} from "@/lib/types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export async function predictDisease(
  file: File,
  envData?: {
    soil_ph?: string;
    recent_rainfall?: string;
    location?: { lat: number; lon: number };
  }
): Promise<FullDiagnosisResponse> {
  const formData = new FormData();
  formData.append("file", file);

  const predRes = await fetch(`${API_BASE}/predict`, {
    method: "POST",
    body: formData,
  });

  if (!predRes.ok) {
    throw new Error(`Prediction failed (${predRes.status})`);
  }

  const prediction: PredictionResult = await predRes.json();

  const recRes = await fetch(`${API_BASE}/recommend`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ 
      disease: prediction.disease, 
      crop: prediction.crop,
      location: envData?.location || { lat: 34.0522, lon: -118.2437 },
      soil_ph: envData?.soil_ph ? parseFloat(envData.soil_ph) : 6.5,
      recent_rainfall: envData?.recent_rainfall || "12mm"
    }),
  });

  let recommendation: Recommendation;
  if (recRes.ok) {
    recommendation = await recRes.json();
  } else {
    recommendation = {
      ipm_plan: ["Unable to fetch recommendations at this time."],
      irrigation_schedule: ["N/A"],
      vulnerability_analysis: "N/A",
      confidence_note: "Recommendation service unavailable.",
    };
  }

  return { prediction, recommendation };
}
