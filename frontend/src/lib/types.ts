export interface PredictionResult {
  crop: string;
  disease: string;
  confidence: number;
}

export interface Recommendation {
  ipm_plan: string[];
  irrigation_schedule: string[];
  vulnerability_analysis: string;
  confidence_note: string;
}

export interface FullDiagnosisResponse {
  prediction: PredictionResult;
  recommendation: Recommendation;
}
