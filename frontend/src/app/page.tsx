"use client";

import { useState } from "react";
import FarmCopilot from "@/components/FarmCopilot";
import ImageUploader from "@/components/ImageUploader";
import ResultCard from "@/components/ResultCard";
import WeatherLocationPicker, { type WeatherLocMode } from "@/components/WeatherLocationPicker";
import Header from "@/components/Header";
import { useLocale } from "@/contexts/LocaleContext";
import { predictDisease } from "@/services/api";
import type { PredictionResult, Recommendation } from "@/lib/types";

function getFieldCoords(): Promise<{
  latitude: number;
  longitude: number;
} | null> {
  if (typeof navigator === "undefined" || !navigator.geolocation) {
    return Promise.resolve(null);
  }
  return new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition(
      (pos) =>
        resolve({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        }),
      () => resolve(null),
      { enableHighAccuracy: true, timeout: 25_000, maximumAge: 0 }
    );
  });
}

type ManualParse =
  | { kind: "ok"; coords: { latitude: number; longitude: number } }
  | { kind: "skip" }
  | { kind: "error"; messageKey: "coordsIncomplete" | "coordsInvalid" };

function parseManualCoords(latStr: string, lonStr: string): ManualParse {
  const lat = latStr.trim();
  const lon = lonStr.trim();
  if (lat === "" && lon === "") return { kind: "skip" };
  if (lat === "" || lon === "") return { kind: "error", messageKey: "coordsIncomplete" };
  const la = Number(lat);
  const lo = Number(lon);
  if (Number.isNaN(la) || Number.isNaN(lo)) return { kind: "error", messageKey: "coordsInvalid" };
  if (la < -90 || la > 90 || lo < -180 || lo > 180) return { kind: "error", messageKey: "coordsInvalid" };
  return { kind: "ok", coords: { latitude: la, longitude: lo } };
}

export default function HomePage() {
  const { t } = useLocale();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PredictionResult | null>(null);
  const [recommendation, setRecommendation] = useState<Recommendation | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const [weatherMode, setWeatherMode] = useState<WeatherLocMode>("gps");
  const [manualLat, setManualLat] = useState("");
  const [manualLon, setManualLon] = useState("");

  const [lastGeo, setLastGeo] = useState<{ lat: number; lon: number } | null>(null);
  const [geoFailed, setGeoFailed] = useState(false);
  const [lastGeoSource, setLastGeoSource] = useState<"gps" | "manual" | null>(null);

  const handleImageSelected = async (file: File) => {
    setLoading(true);
    setError(null);
    setResult(null);
    setRecommendation(null);
    setLastGeo(null);
    setGeoFailed(false);
    setLastGeoSource(null);

    try {
      let coords: { latitude: number; longitude: number } | null = null;
      let source: "gps" | "manual" | null = null;

      if (weatherMode === "manual") {
        const parsed = parseManualCoords(manualLat, manualLon);
        if (parsed.kind === "error") {
          setError(t(parsed.messageKey));
          setLoading(false);
          return;
        }
        if (parsed.kind === "ok") {
          coords = parsed.coords;
          source = "manual";
          setLastGeo({ lat: coords.latitude, lon: coords.longitude });
        }
      } else {
        coords = await getFieldCoords();
        if (coords) {
          source = "gps";
          setLastGeo({ lat: coords.latitude, lon: coords.longitude });
        } else {
          setGeoFailed(true);
        }
      }

      setLastGeoSource(source);
      const data = await predictDisease(file, coords);
      setResult(data.prediction);
      setRecommendation(data.recommendation);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setResult(null);
    setRecommendation(null);
    setError(null);
    setPreview(null);
    setLastGeo(null);
    setGeoFailed(false);
    setLastGeoSource(null);
    setWeatherMode("gps");
    setManualLat("");
    setManualLon("");
  };

  const stats = [
    { icon: "👁️", valueKey: "statVision" as const, labelKey: "statVisionLabel" as const },
    { icon: "🔎", valueKey: "statExa" as const, labelKey: "statExaLabel" as const },
    { icon: "🌦️", valueKey: "statLive" as const, labelKey: "statLiveLabel" as const },
    { icon: "⚡", valueKey: "statTime" as const, labelKey: "statTimeLabel" as const },
  ];

  const steps = [
    { step: "01", icon: "📸", titleKey: "how1Title" as const, descKey: "how1Desc" as const },
    { step: "02", icon: "🧠", titleKey: "how2Title" as const, descKey: "how2Desc" as const },
    { step: "03", icon: "💡", titleKey: "how3Title" as const, descKey: "how3Desc" as const },
  ];

  return (
    <>
      <div className="bg-mesh" />

      <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
        <Header />

        <main className="app-main" style={{ flex: 1, padding: "0 20px 40px" }}>
          <div className="app-main__inner">

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
                  {t("heroBadge")}
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
                  {t("heroTitle")}
                  <br />
                  <span
                    style={{
                      background: "linear-gradient(135deg, #4ade80, #22c55e)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                    }}
                  >
                    {t("heroTitleHighlight")}
                  </span>
                </h2>
                <p
                  style={{
                    fontSize: 15,
                    color: "var(--text-muted)",
                    maxWidth: 440,
                    margin: "0 auto",
                    lineHeight: 1.7,
                  }}
                >
                  {t("heroSubtitle")}
                </p>
              </section>
            )}

            {!result && (
              <div
                className="animate-fade-in-up delay-100"
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(4, 1fr)",
                  gap: 10,
                  marginBottom: 20,
                }}
              >
                {stats.map(({ icon, valueKey, labelKey }) => (
                  <div key={labelKey} className="stat-card" style={{ textAlign: "center" }}>
                    <div style={{ fontSize: 20, marginBottom: 4 }}>{icon}</div>
                    <div
                      style={{
                        fontSize: 17,
                        fontWeight: 800,
                        color: "var(--green-400)",
                        letterSpacing: "-0.02em",
                      }}
                    >
                      {t(valueKey)}
                    </div>
                    <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>
                      {t(labelKey)}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <FarmCopilot />

            <div className="animate-fade-in-up delay-200">
              {!result ? (
                <div className="glass-card" style={{ padding: 24 }}>
                  <p
                    style={{
                      fontSize: 12,
                      color: "var(--text-muted)",
                      lineHeight: 1.55,
                      marginBottom: 16,
                      paddingBottom: 14,
                      borderBottom: "1px solid var(--border)",
                    }}
                  >
                    📍 {t("geoNotice")}
                  </p>
                  <ImageUploader
                    onImageSelected={handleImageSelected}
                    loading={loading}
                    preview={preview}
                    setPreview={setPreview}
                  />

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
                        type="button"
                        onClick={() => setError(null)}
                        style={{
                          marginInlineStart: "auto",
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
                  geo={{
                    coords: lastGeo,
                    failed: geoFailed,
                    source: lastGeoSource,
                  }}
                />
              )}
            </div>

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
                    {t("howWorksTitle")}
                  </h3>
                  <p style={{ fontSize: 13, color: "var(--text-muted)" }}>
                    {t("howWorksSubtitle")}
                  </p>
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(3, 1fr)",
                    gap: 14,
                  }}
                >
                  {steps.map(({ step, icon, titleKey, descKey }) => (
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
                        {t(titleKey)}
                      </h4>
                      <p style={{ fontSize: 12, color: "var(--text-muted)", lineHeight: 1.6 }}>
                        {t(descKey)}
                      </p>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>
        </main>

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
            <span style={{ fontSize: 12, color: "var(--text-dim)" }}>{t("footerLeft")}</span>
            <span style={{ fontSize: 12, color: "var(--text-dim)" }}>{t("footerRight")}</span>
          </div>
        </footer>
      </div>
    </>
  );
}
