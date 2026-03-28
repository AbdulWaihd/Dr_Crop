"use client";

import { useState } from "react";
import ImageUploader from "@/components/ImageUploader";
import ResultCard from "@/components/ResultCard";
import Header from "@/components/Header";
import { predictDisease } from "@/services/api";
import type { PredictionResult, Recommendation } from "@/lib/types";

const STATS = [
  { value: "38", label: "Crop Diseases", icon: "🧬" },
  { value: "54K", label: "Training Images", icon: "📷" },
  { value: "95%", label: "Accuracy", icon: "🎯" },
  { value: "<3s", label: "Analysis Time", icon: "⚡" },
];

const HOW_IT_WORKS = [
  {
    step: "01",
    icon: "📸",
    title: "Upload a photo",
    desc: "Take a photo of your crop leaf or upload from gallery. Works with any smartphone camera.",
  },
  {
    step: "02",
    icon: "🧠",
    title: "AI analysis",
    desc: "Our ResNet model analyzes the leaf, trained on 54,000+ plant images across 38 disease classes.",
  },
  {
    step: "03",
    icon: "💡",
    title: "Get treatment plan",
    desc: "Receive instant diagnosis, confidence score, and a tailored treatment & prevention plan.",
  },
];

export default function HomePage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PredictionResult | null>(null);
  const [recommendation, setRecommendation] = useState<Recommendation | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [soilPh, setSoilPh] = useState<string>("6.5");
  const [recentRainfall, setRecentRainfall] = useState<string>("12mm");
  const [lat, setLat] = useState<string>("34.0522");
  const [lon, setLon] = useState<string>("-118.2437");

  const handleImageSelected = async (file: File) => {
    setLoading(true);
    setError(null);
    setResult(null);
    setRecommendation(null);

    try {
      const data = await predictDisease(file, {
        soil_ph: soilPh,
        recent_rainfall: recentRainfall,
        location: { lat: parseFloat(lat) || 34.0522, lon: parseFloat(lon) || -118.2437 }
      });
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
    setPreview(null);
  };

  return (
    <>
      {/* Animated background */}
      <div className="bg-mesh" />

      <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
        <Header />

        <main style={{ flex: 1, padding: "0 20px 40px" }}>
          <div style={{ maxWidth: 680, margin: "0 auto" }}>

            {/* ── Hero section ── */}
            {!result && (
              <section
                className="animate-fade-in-up"
                style={{ textAlign: "center", padding: "48px 0 36px" }}
              >
                <div
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 8,
                    background: "rgba(74,222,128,0.08)",
                    border: "1px solid rgba(74,222,128,0.2)",
                    borderRadius: 999,
                    padding: "6px 16px",
                    fontSize: 12,
                    color: "var(--green-400)",
                    fontWeight: 600,
                    marginBottom: 20,
                    letterSpacing: "0.03em",
                  }}
                >
                  <span>✨</span> AI-Powered Crop Health
                </div>

                <h2
                  style={{
                    fontSize: "clamp(28px, 5vw, 42px)",
                    fontWeight: 800,
                    color: "var(--text-primary)",
                    letterSpacing: "-0.03em",
                    lineHeight: 1.15,
                    marginBottom: 14,
                  }}
                >
                  Diagnose Your Crop
                  <br />
                  <span
                    style={{
                      background: "linear-gradient(135deg, #4ade80, #22c55e)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                    }}
                  >
                    Instantly
                  </span>
                </h2>
                <p
                  style={{
                    fontSize: 15,
                    color: "var(--text-muted)",
                    maxWidth: 400,
                    margin: "0 auto",
                    lineHeight: 1.7,
                  }}
                >
                  Snap a photo of a diseased leaf and our AI will identify the
                  disease and give you a full treatment plan in seconds.
                </p>
              </section>
            )}

            {/* ── Stats row ── */}
            {!result && (
              <div
                className="animate-fade-in-up delay-100"
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(4, 1fr)",
                  gap: 10,
                  marginBottom: 28,
                }}
              >
                {STATS.map(({ value, label, icon }) => (
                  <div key={label} className="stat-card" style={{ textAlign: "center" }}>
                    <div style={{ fontSize: 20, marginBottom: 4 }}>{icon}</div>
                    <div
                      style={{
                        fontSize: 20,
                        fontWeight: 800,
                        color: "var(--green-400)",
                        letterSpacing: "-0.02em",
                      }}
                    >
                      {value}
                    </div>
                    <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>
                      {label}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* ── Main upload / result area ── */}
            <div className="animate-fade-in-up delay-200">
              {!result ? (
                <div className="glass-card" style={{ padding: 24 }}>
                  
                  {/* Env Data Form */}
                  <div style={{ marginBottom: 20, padding: 16, background: "rgba(255,255,255,0.03)", borderRadius: 12, border: "1px solid var(--border)" }}>
                    <h4 style={{ fontSize: 13, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 12 }}>Environmental Context (Optional)</h4>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                      <div>
                        <label style={{ display: "block", fontSize: 11, color: "var(--text-muted)", marginBottom: 4 }}>Soil pH</label>
                        <input type="text" value={soilPh} onChange={e => setSoilPh(e.target.value)} placeholder="e.g. 6.5" style={{ width: "100%", padding: "8px 12px", borderRadius: 8, background: "rgba(0,0,0,0.2)", border: "1px solid var(--border)", color: "var(--text-primary)", fontSize: 13, outline: "none" }} />
                      </div>
                      <div>
                        <label style={{ display: "block", fontSize: 11, color: "var(--text-muted)", marginBottom: 4 }}>Recent Rainfall</label>
                        <input type="text" value={recentRainfall} onChange={e => setRecentRainfall(e.target.value)} placeholder="e.g. 12mm" style={{ width: "100%", padding: "8px 12px", borderRadius: 8, background: "rgba(0,0,0,0.2)", border: "1px solid var(--border)", color: "var(--text-primary)", fontSize: 13, outline: "none" }} />
                      </div>
                      <div>
                        <label style={{ display: "block", fontSize: 11, color: "var(--text-muted)", marginBottom: 4 }}>Latitude</label>
                        <input type="text" value={lat} onChange={e => setLat(e.target.value)} placeholder="34.0522" style={{ width: "100%", padding: "8px 12px", borderRadius: 8, background: "rgba(0,0,0,0.2)", border: "1px solid var(--border)", color: "var(--text-primary)", fontSize: 13, outline: "none" }} />
                      </div>
                      <div>
                        <label style={{ display: "block", fontSize: 11, color: "var(--text-muted)", marginBottom: 4 }}>Longitude</label>
                        <input type="text" value={lon} onChange={e => setLon(e.target.value)} placeholder="-118.2437" style={{ width: "100%", padding: "8px 12px", borderRadius: 8, background: "rgba(0,0,0,0.2)", border: "1px solid var(--border)", color: "var(--text-primary)", fontSize: 13, outline: "none" }} />
                      </div>
                    </div>
                  </div>

                  <ImageUploader
                    onImageSelected={handleImageSelected}
                    loading={loading}
                    preview={preview}
                    setPreview={setPreview}
                  />

                  {/* Error message */}
                  {error && (
                    <div
                      id="error-message"
                      className="animate-fade-in"
                      style={{
                        marginTop: 16,
                        padding: "12px 16px",
                        background: "var(--danger-bg)",
                        border: "1px solid rgba(248,113,113,0.3)",
                        borderRadius: 12,
                        color: "var(--danger)",
                        fontSize: 13,
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                      }}
                    >
                      <span style={{ fontSize: 16 }}>⚠️</span>
                      {error}
                      <button
                        onClick={() => setError(null)}
                        style={{
                          marginLeft: "auto",
                          background: "none",
                          border: "none",
                          color: "var(--danger)",
                          cursor: "pointer",
                          fontSize: 16,
                          lineHeight: 1,
                        }}
                      >
                        ×
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <ResultCard
                  prediction={result}
                  recommendation={recommendation}
                  onReset={handleReset}
                  preview={preview}
                />
              )}
            </div>

            {/* ── How it works section ── */}
            {!result && (
              <section
                id="how-it-works"
                className="animate-fade-in-up delay-300"
                style={{ marginTop: 48 }}
              >
                <div style={{ textAlign: "center", marginBottom: 28 }}>
                  <h3
                    style={{
                      fontSize: 20,
                      fontWeight: 700,
                      color: "var(--text-primary)",
                      marginBottom: 8,
                    }}
                  >
                    How It Works
                  </h3>
                  <p style={{ fontSize: 13, color: "var(--text-muted)" }}>
                    From photo to diagnosis in 3 simple steps
                  </p>
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(3, 1fr)",
                    gap: 14,
                  }}
                >
                  {HOW_IT_WORKS.map(({ step, icon, title, desc }) => (
                    <div key={step} className="stat-card" style={{ padding: 18 }}>
                      <div
                        style={{
                          fontSize: 10,
                          fontWeight: 700,
                          color: "var(--green-600)",
                          letterSpacing: "0.1em",
                          marginBottom: 8,
                        }}
                      >
                        STEP {step}
                      </div>
                      <div style={{ fontSize: 28, marginBottom: 10 }}>{icon}</div>
                      <h4
                        style={{
                          fontSize: 13,
                          fontWeight: 700,
                          color: "var(--text-primary)",
                          marginBottom: 6,
                        }}
                      >
                        {title}
                      </h4>
                      <p style={{ fontSize: 12, color: "var(--text-muted)", lineHeight: 1.6 }}>
                        {desc}
                      </p>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>
        </main>

        {/* Footer */}
        <footer
          style={{
            borderTop: "1px solid var(--border)",
            padding: "20px",
            textAlign: "center",
          }}
        >
          <div
            style={{
              maxWidth: 680,
              margin: "0 auto",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: 8,
            }}
          >
            <span style={{ fontSize: 12, color: "var(--text-dim)" }}>
              🌿 Dr. Crop v0.1 — AI Crop Disease Detection
            </span>
            <div style={{ display: "flex", gap: 16 }}>
              <span style={{ fontSize: 12, color: "var(--text-dim)" }}>
                Built with Next.js · FastAPI · PyTorch
              </span>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
