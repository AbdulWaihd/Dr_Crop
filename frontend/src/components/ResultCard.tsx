"use client";

import type { PredictionResult, Recommendation } from "@/lib/types";

interface Props {
  prediction: PredictionResult;
  recommendation: Recommendation | null;
  onReset: () => void;
}

export default function ResultCard({
  prediction,
  recommendation,
  onReset,
}: Props) {
  const confidencePercent = Math.round(prediction.confidence * 100);
  const isHealthy = prediction.disease.toLowerCase().includes("healthy");

  return (
    <div className="w-full space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Diagnosis card */}
      <div className="bg-surface rounded-2xl shadow-lg p-5 border border-border">
        <div className="flex items-start justify-between mb-3">
          <h3 className="text-lg font-bold">Diagnosis</h3>
          <span
            className={`px-3 py-1 rounded-full text-xs font-semibold ${
              isHealthy
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-700"
            }`}
          >
            {isHealthy ? "Healthy" : "Disease Detected"}
          </span>
        </div>

        <div className="space-y-2">
          <InfoRow label="Crop" value={prediction.crop} />
          <InfoRow
            label="Disease"
            value={isHealthy ? "None — your crop looks healthy!" : prediction.disease}
          />
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted">Confidence</span>
            <div className="flex items-center gap-2">
              <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full transition-all duration-700"
                  style={{ width: `${confidencePercent}%` }}
                />
              </div>
              <span className="text-sm font-semibold">{confidencePercent}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recommendations card */}
      {recommendation && !isHealthy && (
        <div className="bg-surface rounded-2xl shadow-lg p-5 border border-border">
          <h3 className="text-lg font-bold mb-3">Recommendations</h3>
          <div className="space-y-3">
            <RecSection icon="💊" title="Treatment" text={recommendation.treatment} />
            <RecSection icon="🛡️" title="Prevention" text={recommendation.prevention} />
            <RecSection icon="🌱" title="Fertilizer" text={recommendation.fertilizer} />
            {recommendation.confidence_note && (
              <p className="text-xs text-muted italic mt-2">
                {recommendation.confidence_note}
              </p>
            )}
          </div>
        </div>
      )}

      <button
        onClick={onReset}
        className="w-full py-3 bg-foreground text-background font-semibold rounded-2xl
                   hover:opacity-90 transition-opacity active:scale-[0.98]"
      >
        Scan Another Leaf
      </button>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-sm text-muted">{label}</span>
      <span className="text-sm font-semibold">{value}</span>
    </div>
  );
}

function RecSection({
  icon,
  title,
  text,
}: {
  icon: string;
  title: string;
  text: string;
}) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-1">
        <span>{icon}</span>
        <span className="text-sm font-semibold">{title}</span>
      </div>
      <p className="text-sm text-muted leading-relaxed pl-7">{text}</p>
    </div>
  );
}
