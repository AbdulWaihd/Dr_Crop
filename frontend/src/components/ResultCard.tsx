"use client";

import { useState } from "react";
import { useLocale } from "@/contexts/LocaleContext";
import type { MessageKey } from "@/lib/i18n";
import type {
  AirQuality,
  PredictionResult,
  Recommendation,
  FieldConditions,
} from "@/lib/types";

interface Props {
  prediction: PredictionResult;
  recommendation: Recommendation | null;
  onReset: () => void;
  preview: string | null;
  geo?: {
    coords: { lat: number; lon: number } | null;
    failed: boolean;
    source?: "gps" | "manual" | null;
  };
}

function nonEmpty(s: string | undefined | null): boolean {
  return typeof s === "string" && s.trim().length > 0;
}

function hasAirMetrics(aq: AirQuality | null | undefined): boolean {
  if (!aq) return false;
  return [
    aq.us_aqi,
    aq.european_aqi,
    aq.pm2_5,
    aq.pm10,
    aq.ozone,
    aq.nitrogen_dioxide,
    aq.sulphur_dioxide,
    aq.carbon_monoxide,
  ].some((v) => v != null && !Number.isNaN(Number(v)));
}

export default function ResultCard({
  prediction,
  recommendation,
  onReset,
  preview,
  geo,
}: Props) {
  const { t } = useLocale();

  const confidencePercent = Math.round(prediction.confidence * 100);
  const isHealthy = prediction.disease.toLowerCase().includes("healthy");
  const [activeTab, setActiveTab] = useState<"treatment" | "prevention" | "fertilizer">("treatment");
  const [copied, setCopied] = useState(false);

  const fc = recommendation?.field_conditions;
  const hasField =
    fc &&
    (fc.temperature_c != null ||
      fc.soil_moisture_0_7cm != null ||
      fc.soil_temperature_0_7cm_c != null);

  const yI = recommendation?.irrigation_water;
  const yS = recommendation?.soil_health_yield;
  const yC = recommendation?.crop_practices_yield;
  const yA = recommendation?.air_quality_advice;
  const yU = recommendation?.yield_uplift_comparison;
  const aq = recommendation?.air_quality;
  const hasYieldPlan = nonEmpty(yI) || nonEmpty(yS) || nonEmpty(yC);
  const showAirSection = hasAirMetrics(aq) || nonEmpty(yA);

  const severityLabel =
    confidencePercent >= 80 ? t("severityHigh") : confidencePercent >= 50 ? t("severityMedium") : t("severityLow");

  const handleCopyReport = () => {
    const lines = [
      `Dr. Crop`,
      `${t("cropType")}: ${prediction.crop}`,
      `${t("condition")}: ${isHealthy ? t("noDisease") : prediction.disease}`,
      `${t("confidenceLabel")}: ${confidencePercent}%`,
      ``,
    ];
    if (geo?.coords) {
      lines.splice(
        4,
        0,
        `${t("geoLatLon", { lat: geo.coords.lat.toFixed(2), lon: geo.coords.lon.toFixed(2) })} (${geo.source === "manual" ? t("geoSourceManual") : t("geoSourceGps")})`
      );
    }
    if (recommendation && !isHealthy) {
      lines.push(
        `${recommendation.treatment}`,
        ``,
        `${recommendation.prevention}`,
        ``,
        `${recommendation.fertilizer}`
      );
    }
    if (recommendation && (hasYieldPlan || nonEmpty(yA))) {
      lines.push(``);
      if (nonEmpty(yI)) lines.push(`${yI}`, ``);
      if (nonEmpty(yS)) lines.push(`${yS}`, ``);
      if (nonEmpty(yC)) lines.push(`${yC}`, ``);
      if (nonEmpty(yA)) lines.push(`${yA}`);
    }
    navigator.clipboard.writeText(lines.join("\n"));
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const severityColor =
    confidencePercent >= 80 ? "var(--danger)" : confidencePercent >= 50 ? "var(--warning)" : "var(--success)";

  return (
    <div className="animate-fade-in-up" style={{ width: "100%", display: "flex", flexDirection: "column", gap: 16 }}>
      <div className="glass-card glow-green-sm" style={{ padding: 20 }}>
        <div style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
          {preview && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={preview}
              alt=""
              style={{
                width: 80,
                height: 80,
                borderRadius: 12,
                objectFit: "cover",
                border: "2px solid var(--border-bright)",
                flexShrink: 0,
              }}
            />
          )}

          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: "var(--text-primary)" }}>
                {t("resultTitle")}
              </h3>
              <span className={`badge ${isHealthy ? "badge-success" : "badge-danger"}`}>
                {isHealthy ? t("resultHealthyBadge") : t("resultDiseaseBadge")}
              </span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <InfoRow label={t("cropType")} value={prediction.crop} />
              <InfoRow
                label={t("condition")}
                value={isHealthy ? t("noDisease") : prediction.disease}
                highlight={!isHealthy}
              />
            </div>
          </div>
        </div>

        {geo?.coords && (
          <p style={{ fontSize: 11, color: "var(--green-400)", marginTop: 10 }}>
            {t("geoLatLon", { lat: geo.coords.lat.toFixed(2), lon: geo.coords.lon.toFixed(2) })} — {t("geoStatusUsed")}{" "}
            ({geo.source === "manual" ? t("geoSourceManual") : t("geoSourceGps")})
          </p>
        )}
        {geo?.failed && !geo.coords && (
          <p style={{ fontSize: 11, color: "var(--warning)", marginTop: 10 }}>{t("geoStatusDenied")}</p>
        )}

        <div style={{ marginTop: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
            <span style={{ fontSize: 12, color: "var(--text-muted)" }}>{t("confidenceLabel")}</span>
            <span style={{ fontSize: 12, fontWeight: 700, color: "var(--green-400)" }}>
              {confidencePercent}%
            </span>
          </div>
          <div className="confidence-track">
            <div className="confidence-fill" style={{ width: `${confidencePercent}%` }} />
          </div>
        </div>

        {!isHealthy && (
          <div style={{ marginTop: 14, display: "flex", gap: 8, flexWrap: "wrap" }}>
            <div className="feature-pill" style={{ fontSize: 12 }}>
              <span
                style={{ width: 8, height: 8, borderRadius: "50%", background: severityColor, display: "inline-block" }}
              />
              {t("matchLabel")}: <strong style={{ color: severityColor }}>{severityLabel}</strong>
            </div>
            <div className="feature-pill" style={{ fontSize: 12 }}>
              {t("pipelineBadge")}
            </div>
          </div>
        )}
      </div>

      {recommendation && nonEmpty(yU) && (
        <div
          className="glass-card animate-fade-in-up"
          style={{
            padding: 20,
            borderColor: "rgba(250, 204, 21, 0.3)",
            background: "rgba(250, 204, 21, 0.04)",
          }}
        >
          <h3 style={{ fontSize: 15, fontWeight: 700, color: "var(--warning)", marginBottom: 8 }}>
            📈 {t("yieldUpliftTitle")}
          </h3>
          <p style={{ fontSize: 11, color: "var(--text-dim)", marginBottom: 12, lineHeight: 1.5 }}>
            {t("yieldUpliftHint")}
          </p>
          <p style={{ fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.75, margin: 0 }}>
            {yU}
          </p>
        </div>
      )}

      {hasField && fc && (
        <div className="glass-card" style={{ padding: 20 }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary)", marginBottom: 8 }}>
            {t("fieldTitle")}
          </h3>
          <p style={{ fontSize: 11, color: "var(--text-dim)", marginBottom: 12 }}>{t("fieldHint")}</p>
          <FieldGrid conditions={fc} t={t} />
        </div>
      )}

      {recommendation && showAirSection && (
        <div
          className="glass-card"
          style={{ padding: 20, borderColor: "rgba(96, 165, 250, 0.22)" }}
        >
          <h3 style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary)", marginBottom: 8 }}>
            {t("airTitle")}
          </h3>
          <p style={{ fontSize: 11, color: "var(--text-dim)", marginBottom: 12 }}>{t("airHint")}</p>
          {hasAirMetrics(aq) && <AirQualityGrid aq={aq!} t={t} />}
          {nonEmpty(yA) && (
            <div style={{ marginTop: hasAirMetrics(aq) ? 14 : 0 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "var(--green-400)", marginBottom: 8 }}>
                {t("airAdviceTitle")}
              </div>
              <p style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.7, margin: 0 }}>
                {yA}
              </p>
            </div>
          )}
        </div>
      )}

      {recommendation && !isHealthy && (
        <div className="glass-card" style={{ padding: 20 }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary)", marginBottom: 14 }}>
            {t("diseaseMgmt")}
          </h3>

          <div
            style={{
              display: "flex",
              gap: 6,
              marginBottom: 18,
              background: "rgba(255,255,255,0.03)",
              padding: 4,
              borderRadius: 12,
            }}
          >
            {(["treatment", "prevention", "fertilizer"] as const).map((tab) => (
              <button
                key={tab}
                id={`tab-${tab}`}
                type="button"
                onClick={() => setActiveTab(tab)}
                style={{
                  flex: 1,
                  padding: "8px 10px",
                  borderRadius: 8,
                  fontSize: 12,
                  fontWeight: 600,
                  border: "none",
                  cursor: "pointer",
                  transition: "all 0.2s",
                  background: activeTab === tab ? "var(--green-600)" : "transparent",
                  color: activeTab === tab ? "#fff" : "var(--text-muted)",
                }}
              >
                {tab === "treatment" ? t("tabTreatment") : tab === "prevention" ? t("tabPrevention") : t("tabFertilizer")}
              </button>
            ))}
          </div>

          <div
            className="animate-fade-in"
            key={activeTab}
            style={{
              background: "rgba(255,255,255,0.02)",
              border: "1px solid var(--border)",
              borderRadius: 14,
              padding: 16,
              fontSize: 13,
              color: "var(--text-secondary)",
              lineHeight: 1.7,
            }}
          >
            {activeTab === "treatment" && recommendation.treatment}
            {activeTab === "prevention" && recommendation.prevention}
            {activeTab === "fertilizer" && recommendation.fertilizer}
          </div>

          {recommendation.confidence_note && (
            <p style={{ marginTop: 10, fontSize: 11, color: "var(--text-dim)", fontStyle: "italic", lineHeight: 1.5 }}>
              ℹ️ {recommendation.confidence_note}
            </p>
          )}
        </div>
      )}

      {recommendation && hasYieldPlan && (
        <div className="glass-card" style={{ padding: 20, borderColor: "rgba(74,222,128,0.2)" }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: "var(--green-400)", marginBottom: 10 }}>
            {t("yieldTitle")}
          </h3>
          <p style={{ fontSize: 11, color: "var(--text-dim)", marginBottom: 14 }}>{t("yieldHint")}</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {nonEmpty(yI) && <YieldBlock icon="💧" title={t("yieldWater")} text={yI!} />}
            {nonEmpty(yS) && <YieldBlock icon="🌍" title={t("yieldSoil")} text={yS!} />}
            {nonEmpty(yC) && <YieldBlock icon="🌾" title={t("yieldCrop")} text={yC!} />}
          </div>
        </div>
      )}

      {isHealthy && (
        <div
          className="glass-card animate-fade-in-up delay-100"
          style={{
            padding: 24,
            textAlign: "center",
            borderColor: "rgba(74,222,128,0.25)",
          }}
        >
          <div style={{ fontSize: 48, marginBottom: 10 }}>🎉</div>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: "var(--green-400)", marginBottom: 6 }}>
            {t("healthyCardTitle")}
          </h3>
          <p style={{ fontSize: 13, color: "var(--text-muted)", lineHeight: 1.6 }}>
            {t("healthyCardDesc")}
          </p>
        </div>
      )}

      <div className="result-actions">
        <button id="btn-scan-another" type="button" onClick={onReset} className="btn-primary" style={{ flex: 2 }}>
          <ScanIcon />
          {t("scanAnother")}
        </button>
        <button id="btn-copy-report" type="button" onClick={handleCopyReport} className="btn-ghost" style={{ flex: 1 }}>
          {copied ? t("copied") : <><CopyIcon /> {t("copyReport")}</>}
        </button>
      </div>
    </div>
  );
}

function AirQualityGrid({
  aq,
  t,
}: {
  aq: AirQuality;
  t: (key: MessageKey) => string;
}) {
  const rows: { label: string; value: string }[] = [];
  const u = t("airUgm3");
  if (aq.us_aqi != null) rows.push({ label: t("airUsAqi"), value: `${Math.round(aq.us_aqi)}` });
  if (aq.european_aqi != null)
    rows.push({ label: t("airEuAqi"), value: `${Math.round(aq.european_aqi)}` });
  if (aq.pm2_5 != null) rows.push({ label: t("airPm25"), value: `${aq.pm2_5.toFixed(1)} ${u}` });
  if (aq.pm10 != null) rows.push({ label: t("airPm10"), value: `${aq.pm10.toFixed(1)} ${u}` });
  if (aq.ozone != null) rows.push({ label: t("airOzone"), value: `${aq.ozone.toFixed(1)} ${u}` });
  if (aq.nitrogen_dioxide != null)
    rows.push({ label: t("airNo2"), value: `${aq.nitrogen_dioxide.toFixed(1)} ${u}` });
  if (aq.sulphur_dioxide != null)
    rows.push({ label: t("airSo2"), value: `${aq.sulphur_dioxide.toFixed(1)} ${u}` });
  if (aq.carbon_monoxide != null)
    rows.push({ label: t("airCo"), value: `${aq.carbon_monoxide.toFixed(1)} ${u}` });
  if (aq.time_utc) rows.push({ label: t("timeUtc"), value: aq.time_utc });

  if (rows.length === 0) return null;

  return (
    <dl style={{ display: "grid", gap: 8, fontSize: 12 }}>
      {rows.map((r) => (
        <div key={r.label} style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
          <dt style={{ color: "var(--text-muted)" }}>{r.label}</dt>
          <dd style={{ fontWeight: 600, textAlign: "right" }}>{r.value}</dd>
        </div>
      ))}
    </dl>
  );
}

function FieldGrid({
  conditions,
  t,
}: {
  conditions: FieldConditions;
  t: (key: MessageKey) => string;
}) {
  const rows: { label: string; value: string }[] = [];
  if (conditions.temperature_c != null) {
    rows.push({ label: t("airTemp"), value: `${conditions.temperature_c.toFixed(1)} °C` });
  }
  if (conditions.relative_humidity_pct != null) {
    rows.push({ label: t("humidity"), value: `${Math.round(conditions.relative_humidity_pct)}%` });
  }
  if (conditions.precipitation_mm != null) {
    rows.push({ label: t("precipitation"), value: `${conditions.precipitation_mm.toFixed(1)} mm` });
  }
  if (conditions.wind_speed_kmh != null) {
    rows.push({ label: t("wind"), value: `${conditions.wind_speed_kmh.toFixed(1)} km/h` });
  }
  if (conditions.soil_moisture_0_7cm != null) {
    rows.push({ label: t("soilMoist07"), value: `${conditions.soil_moisture_0_7cm.toFixed(3)} m³/m³` });
  }
  if (conditions.soil_moisture_7_28cm != null) {
    rows.push({ label: t("soilMoist728"), value: `${conditions.soil_moisture_7_28cm.toFixed(3)} m³/m³` });
  }
  if (conditions.soil_temperature_0_7cm_c != null) {
    rows.push({ label: t("soilTemp"), value: `${conditions.soil_temperature_0_7cm_c.toFixed(1)} °C` });
  }
  if (conditions.time_utc) {
    rows.push({ label: t("timeUtc"), value: conditions.time_utc });
  }

  return (
    <dl style={{ display: "grid", gap: 8, fontSize: 12 }}>
      {rows.map((r) => (
        <div key={r.label} style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
          <dt style={{ color: "var(--text-muted)" }}>{r.label}</dt>
          <dd style={{ fontWeight: 600, textAlign: "right" }}>{r.value}</dd>
        </div>
      ))}
    </dl>
  );
}

function YieldBlock({ icon, title, text }: { icon: string; title: string; text: string }) {
  return (
    <div>
      <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 6 }}>
        {icon} {title}
      </div>
      <p style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.65, margin: 0 }}>
        {text}
      </p>
    </div>
  );
}

function InfoRow({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      <span style={{ fontSize: 12, color: "var(--text-muted)" }}>{label}</span>
      <span
        style={{
          fontSize: 13,
          fontWeight: 600,
          color: highlight ? "var(--danger)" : "var(--text-primary)",
          maxWidth: "60%",
          textAlign: "right",
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}
      >
        {value}
      </span>
    </div>
  );
}

function ScanIcon() {
  return (
    <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} style={{ display: "inline", marginRight: 6 }}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 4h4M4 20h4M16 4h4M16 20h4M4 4v4M4 20v-4M20 4v4M20 20v-4M9 12h6" />
    </svg>
  );
}

function CopyIcon() {
  return (
    <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} style={{ display: "inline", marginRight: 6 }}>
      <rect x="9" y="9" width="13" height="13" rx="2" strokeLinecap="round" strokeLinejoin="round" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
    </svg>
  );
}
