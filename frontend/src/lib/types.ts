export interface PredictionResult {
  crop: string;
  disease: string;
  confidence: number;
}

export interface Recommendation {
  treatment: string;
  prevention: string;
  fertilizer: string;
  confidence_note: string;
}

export interface FullDiagnosisResponse {
  prediction: PredictionResult;
  recommendation: Recommendation;
}
