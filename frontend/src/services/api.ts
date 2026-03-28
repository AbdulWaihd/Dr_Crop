import type {
  PredictionResult,
  Recommendation,
  FullDiagnosisResponse,
} from "@/lib/types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export async function predictDisease(
  file: File
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
    body: JSON.stringify({ disease: prediction.disease, crop: prediction.crop }),
  });

  let recommendation: Recommendation;
  if (recRes.ok) {
    recommendation = await recRes.json();
  } else {
    recommendation = {
      treatment: "Unable to fetch recommendations at this time.",
      prevention: "N/A",
      fertilizer: "N/A",
      confidence_note: "Recommendation service unavailable.",
    };
  }

  return { prediction, recommendation };
}
