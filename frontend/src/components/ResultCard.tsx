"use client";

import { useState } from "react";
import type { PredictionResult, Recommendation } from "@/lib/types";

interface Props {
  prediction: PredictionResult;
  recommendation: Recommendation | null;
  onReset: () => void;
  preview: string | null;
}

export default function ResultCard({ prediction, recommendation, onReset, preview }: Props) {
  const confidencePercent = Math.round(prediction.confidence * 100);
  const isHealthy = prediction.disease.toLowerCase().includes("healthy");
  const [activeTab, setActiveTab] = useState<"ipm_plan" | "irrigation_schedule" | "vulnerability">(
    "ipm_plan"
  );
  const [copied, setCopied] = useState(false);

  const handleCopyReport = () => {
    const report = `Dr. Crop Diagnosis Report
========================
Crop: ${prediction.crop}
Disease: ${isHealthy ? "Healthy" : prediction.disease}
Confidence: ${confidencePercent}%

${recommendation && !isHealthy ? `IPM Plan: 
${recommendation.ipm_plan.join("\n")}

Irrigation Schedule:
${recommendation.irrigation_schedule.join("\n")}

Vulnerability Analysis:
${recommendation.vulnerability_analysis}` : ""}`;
    navigator.clipboard.writeText(report);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const severity = confidencePercent >= 80 ? "High" : confidencePercent >= 50 ? "Medium" : "Low";
  const severityColor =
    confidencePercent >= 80 ? "var(--danger)" : confidencePercent >= 50 ? "var(--warning)" : "var(--success)";

  return (
    <div className="animate-fade-in-up" style={{ width: "100%", display: "flex", flexDirection: "column", gap: 16 }}>

      {/* Top summary card */}
      <div className="glass-card glow-green-sm" style={{ padding: 20 }}>
        <div style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>

          {/* Thumbnail */}
          {preview && (
            <img
              src={preview}
              alt="Scanned leaf"
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

          {/* Diagnosis info */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: "var(--text-primary)" }}>
                Diagnosis Result
              </h3>
              <span className={`badge ${isHealthy ? "badge-success" : "badge-danger"}`}>
                {isHealthy ? "✓ Healthy" : "⚠ Disease Found"}
              </span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <InfoRow label="Crop Type" value={prediction.crop} />
              <InfoRow
                label="Condition"
                value={isHealthy ? "No disease detected" : prediction.disease}
                highlight={!isHealthy}
              />
            </div>
          </div>
        </div>

        {/* Confidence bar */}
        <div style={{ marginTop: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
            <span style={{ fontSize: 12, color: "var(--text-muted)" }}>Model confidence</span>
            <span style={{ fontSize: 12, fontWeight: 700, color: "var(--green-400)" }}>
              {confidencePercent}%
            </span>
          </div>
          <div className="confidence-track">
            <div className="confidence-fill" style={{ width: `${confidencePercent}%` }} />
          </div>
        </div>

        {/* Severity badge (if disease) */}
        {!isHealthy && (
          <div style={{ marginTop: 14, display: "flex", gap: 8, flexWrap: "wrap" }}>
            <div className="feature-pill" style={{ fontSize: 12 }}>
              <span
                style={{ width: 8, height: 8, borderRadius: "50%", background: severityColor, display: "inline-block" }}
              />
              Severity: <strong style={{ color: severityColor }}>{severity}</strong>
            </div>
            <div className="feature-pill" style={{ fontSize: 12 }}>
              🧬 AI-powered analysis
            </div>
            <div className="feature-pill" style={{ fontSize: 12 }}>
              🔬 PlantVillage model
            </div>
          </div>
        )}
      </div>

      {/* Recommendations card */}
      {recommendation && !isHealthy && (
        <div className="glass-card" style={{ padding: 20 }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary)", marginBottom: 14 }}>
            Recommendations
          </h3>

          {/* Tab buttons */}
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
            {(["ipm_plan", "irrigation_schedule", "vulnerability"] as const).map((tab) => (
              <button
                key={tab}
                id={`tab-${tab}`}
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
                {tab === "ipm_plan" ? "🛡️ IPM Plan" : tab === "irrigation_schedule" ? "💧 Irrigation" : "⚠️ Analysis"}
              </button>
            ))}
          </div>

          {/* Tab content */}
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
            {activeTab === "ipm_plan" && (
              <ul style={{ paddingLeft: 16 }}>
                {recommendation.ipm_plan.map((step, i) => <li key={i} style={{ marginBottom: 6 }}>{step}</li>)}
              </ul>
            )}
            {activeTab === "irrigation_schedule" && (
              <ul style={{ paddingLeft: 16 }}>
                {recommendation.irrigation_schedule.map((step, i) => <li key={i} style={{ marginBottom: 6 }}>{step}</li>)}
              </ul>
            )}
            {activeTab === "vulnerability" && recommendation.vulnerability_analysis}
          </div>

          {recommendation.confidence_note && (
            <p
              style={{
                marginTop: 10,
                fontSize: 11,
                color: "var(--text-dim)",
                fontStyle: "italic",
                lineHeight: 1.5,
              }}
            >
              ℹ️ {recommendation.confidence_note}
            </p>
          )}
        </div>
      )}

      {/* Healthy message */}
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
            Your crop looks healthy!
          </h3>
          <p style={{ fontSize: 13, color: "var(--text-muted)", lineHeight: 1.6 }}>
            No signs of disease detected. Keep maintaining good agricultural practices to preserve your crop&apos;s health.
          </p>
        </div>
      )}

      {/* Action buttons */}
      <div style={{ display: "flex", gap: 10 }}>
        <button
          id="btn-scan-another"
          onClick={onReset}
          className="btn-primary"
          style={{ flex: 2 }}
        >
          <ScanIcon />
          Scan Another Leaf
        </button>
        <button
          id="btn-copy-report"
          onClick={handleCopyReport}
          className="btn-ghost"
          style={{ flex: 1 }}
        >
          {copied ? (
            <>✓ Copied!</>
          ) : (
            <>
              <CopyIcon />
              Copy Report
            </>
          )}
        </button>
      </div>
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
    <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round"
        d="M4 4h4M4 20h4M16 4h4M16 20h4M4 4v4M4 20v-4M20 4v4M20 20v-4M9 12h6" />
    </svg>
  );
}

function CopyIcon() {
  return (
    <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <rect x="9" y="9" width="13" height="13" rx="2" strokeLinecap="round" strokeLinejoin="round" />
      <path strokeLinecap="round" strokeLinejoin="round"
        d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
    </svg>
  );
}
