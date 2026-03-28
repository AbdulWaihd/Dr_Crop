"use client";

import { useState } from "react";
import ImageUploader from "@/components/ImageUploader";
import ResultCard from "@/components/ResultCard";
import Header from "@/components/Header";
import { predictDisease } from "@/services/api";
import type { PredictionResult, Recommendation } from "@/lib/types";

export default function HomePage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PredictionResult | null>(null);
  const [recommendation, setRecommendation] = useState<Recommendation | null>(
    null
  );
  const [error, setError] = useState<string | null>(null);

  const handleImageSelected = async (file: File) => {
    setLoading(true);
    setError(null);
    setResult(null);
    setRecommendation(null);

    try {
      const data = await predictDisease(file);
      setResult(data.prediction);
      setRecommendation(data.recommendation);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong. Try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setResult(null);
    setRecommendation(null);
    setError(null);
  };

  return (
    <main className="flex flex-col min-h-screen">
      <Header />

      <div className="flex-1 flex flex-col items-center px-4 py-6 max-w-lg mx-auto w-full">
        {!result ? (
          <>
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-foreground mb-2">
                Diagnose Your Crop
              </h2>
              <p className="text-muted text-sm">
                Take a photo or upload an image of a diseased leaf to get
                instant diagnosis and treatment advice.
              </p>
            </div>
            <ImageUploader
              onImageSelected={handleImageSelected}
              loading={loading}
            />
            {error && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-xl text-danger text-sm text-center w-full">
                {error}
              </div>
            )}
          </>
        ) : (
          <ResultCard
            prediction={result}
            recommendation={recommendation}
            onReset={handleReset}
          />
        )}
      </div>

      <footer className="text-center text-xs text-muted py-4 border-t border-border">
        Built for hackathon — Dr. Crop v0.1
      </footer>
    </main>
  );
}
