"use client";

import { useState } from "react";
import Image from "next/image";
import { useLocale } from "@/contexts/LocaleContext";
import type { MessageKey } from "@/lib/i18n";
import type {
  AirQuality,
  PredictionResult,
  Recommendation,
  FieldConditions,
} from "@/lib/types";
import { 
  CheckCircle, 
  AlertCircle, 
  TrendingUp, 
  Wind, 
  Thermometer, 
  Droplets, 
  RotateCcw, 
  Info,
  Waves,
  Sun,
  Dna,
  Share2,
  Activity,
  Sprout,
  Loader2,
  Download
} from "lucide-react";
import { downloadPdfFromHtml } from "@/lib/downloadPdf";
import { generateReportHtml } from "@/lib/pdfGenerator";

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
  const { t, isRtl } = useLocale();

  const confidencePercent = Math.round(prediction.confidence * 100);
  const isHealthy = prediction.disease.toLowerCase().includes("healthy");
  const [activeTab, setActiveTab] = useState<"treatment" | "prevention" | "fertilizer">("treatment");
  const [copied, setCopied] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

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
      `drCrop Analysis Report`,
      `=======================`,
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
    navigator.clipboard.writeText(lines.join("\n"));
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownloadPdf = async () => {
    setIsDownloading(true);
    try {
      let html = "";
      html += `<strong>${t("cropType")}:</strong> ${prediction.crop}<br/>`;
      html += `<strong>${t("condition")}:</strong> ${isHealthy ? t("noDisease") : prediction.disease}<br/>`;
      html += `<strong>${t("confidenceLabel")}:</strong> ${confidencePercent}%<br/><br/>`;
      
      if (geo?.coords) {
        html += `<strong>Location:</strong> ${t("geoLatLon", { lat: geo.coords.lat.toFixed(2), lon: geo.coords.lon.toFixed(2) })}<br/><br/>`;
      }
      
      if (recommendation && !isHealthy) {
        html += `<h3 style="color:#1c6d25;">${t("tabTreatment")}</h3><p>${recommendation.treatment}</p>`;
      }

      await downloadPdfFromHtml(generateReportHtml("Diagnosis & Recommendation Report", html), "DrCrop-Diagnosis-Report.pdf");
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      {/* Primary Diagnosis Card */}
      <div className={`bg-surface-container-lowest rounded-2xl p-6 border shadow-sm ${isHealthy ? 'border-primary/20' : 'border-error/20'}`}>
        <div className="flex flex-col md:flex-row gap-6">
          {preview && (
            <div className="w-full md:w-48 h-48 rounded-xl overflow-hidden shadow-sm border border-outline-variant/15 relative shrink-0">
              <Image src={preview} alt="Scan source" fill className="object-cover" unoptimized />
            </div>
          )}
          
          <div className="flex-1 space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-2xl font-bold tracking-tight text-on-surface">{t("resultTitle")}</h3>
                <p className="text-sm text-on-surface-variant font-medium">Scan ID: #DC-{Date.now().toString().slice(-6)}</p>
              </div>
              <div className={`flex items-center gap-2 px-4 py-1.5 rounded-full font-bold text-xs uppercase tracking-wider ${isHealthy ? 'bg-primary-container text-on-primary-container' : 'bg-error-container text-on-error-container'}`}>
                {isHealthy ? <CheckCircle size={14} /> : <AlertCircle size={14} />}
                {isHealthy ? t("resultHealthyBadge") : t("resultDiseaseBadge")}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-surface-container-low rounded-xl border border-outline-variant/10">
                <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-1">{t("cropType")}</p>
                <p className="text-lg font-bold text-on-surface">{prediction.crop}</p>
              </div>
              <div className="p-4 bg-surface-container-low rounded-xl border border-outline-variant/10">
                <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-1">{t("condition")}</p>
                <p className={`text-lg font-bold ${isHealthy ? 'text-primary' : 'text-error'}`}>{isHealthy ? t("noDisease") : prediction.disease}</p>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">{t("confidenceLabel")}</p>
                <p className="text-sm font-black text-primary">{confidencePercent}%</p>
              </div>
              <div className="w-full bg-surface-container-low h-2 rounded-full overflow-hidden">
                <div className="bg-primary h-full transition-all duration-1000" style={{ width: `${confidencePercent}%` }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Location Bar */}
      {geo?.coords && (
        <div className="bg-surface-container-high rounded-full px-6 py-2 flex items-center justify-between text-[11px] font-bold border border-outline-variant/15">
          <div className="flex items-center gap-2 text-primary">
            <span className="material-symbols-outlined text-[16px]">location_on</span>
            <span>{t("geoLatLon", { lat: geo.coords.lat.toFixed(4), lon: geo.coords.lon.toFixed(4) })}</span>
          </div>
          <div className="text-on-surface-variant uppercase tracking-widest">
            {geo.source === "manual" ? t("geoSourceManual") : t("geoSourceGps")}
          </div>
        </div>
      )}

      {/* Precision Metrics Bento */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {hasField && fc && (
          <div className="bg-surface-container-lowest rounded-2xl p-5 border border-outline-variant/15 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <Thermometer size={18} className="text-primary" />
              <h4 className="text-sm font-bold text-on-surface uppercase tracking-tight">{t("fieldTitle")}</h4>
            </div>
            <div className="space-y-3">
              {fc.temperature_c != null && <MetricRow label={t("airTemp")} value={`${fc.temperature_c.toFixed(1)}°C`} />}
              {fc.soil_moisture_0_7cm != null && <MetricRow label="Soil Moisture" value={`${(fc.soil_moisture_0_7cm * 100).toFixed(1)}%`} />}
            </div>
          </div>
        )}
        {recommendation && showAirSection && (
          <div className="bg-surface-container-lowest rounded-2xl p-5 border border-outline-variant/15 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <Wind size={18} className="text-primary" />
              <h4 className="text-sm font-bold text-on-surface uppercase tracking-tight">Air Intelligence</h4>
            </div>
            <div className="space-y-3">
              {aq?.us_aqi != null && <MetricRow label="AQI (US)" value={Math.round(aq.us_aqi).toString()} />}
              <p className="text-[11px] text-on-surface-variant font-medium leading-relaxed mt-2">{yA}</p>
            </div>
          </div>
        )}
        {recommendation && (nonEmpty(yU) || isHealthy) && (
          <div className="bg-primary-container/20 rounded-2xl p-5 border border-primary/20 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp size={18} className="text-primary" />
              <h4 className="text-sm font-bold text-primary uppercase tracking-tight">Yield Forecast</h4>
            </div>
            <p className="text-[13px] text-on-surface-variant font-medium leading-relaxed italic">{yU || "Ecosystem optimized for maximum seasonal yield."}</p>
          </div>
        )}
      </div>

      {/* Recommendations Tabs */}
      {recommendation && !isHealthy && (
        <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/15 shadow-sm overflow-hidden">
          <div className="flex border-b border-outline-variant/10 bg-surface-container-low p-1">
             <TabBtn active={activeTab === 'treatment'} onClick={() => setActiveTab('treatment')} label={t("tabTreatment")} />
             <TabBtn active={activeTab === 'prevention'} onClick={() => setActiveTab('prevention')} label={t("tabPrevention")} />
             <TabBtn active={activeTab === 'fertilizer'} onClick={() => setActiveTab('fertilizer')} label={t("tabFertilizer")} />
          </div>
          <div className="p-6">
            <p className="text-on-surface-variant text-[15px] leading-relaxed font-medium">
              {activeTab === 'treatment' && recommendation.treatment}
              {activeTab === 'prevention' && recommendation.prevention}
              {activeTab === 'fertilizer' && recommendation.fertilizer}
            </p>
          </div>
        </div>
      )}

      {/* Global Actions */}
      <div className="flex flex-col sm:flex-row gap-4 pt-4">
        <button onClick={onReset} className="flex-1 h-14 bg-primary text-on-primary rounded-full font-bold flex items-center justify-center gap-3 shadow-lg hover:bg-primary-dim transition-all">
          <RotateCcw size={20} />
          {t("scanAnother")}
        </button>
        <div className="flex gap-4 flex-1">
          <button onClick={handleDownloadPdf} disabled={isDownloading} className="flex-1 h-14 bg-surface-container-high text-on-surface rounded-full font-bold flex items-center justify-center gap-3 border border-outline-variant/15 hover:bg-surface-container-highest transition-all">
            {isDownloading ? <Loader2 size={20} className="animate-spin" /> : <Download size={20} />}
            PDF
          </button>
          <button onClick={handleCopyReport} className="flex-1 h-14 bg-surface-container-high text-on-surface rounded-full font-bold flex items-center justify-center gap-3 border border-outline-variant/15 hover:bg-surface-container-highest transition-all">
            {copied ? <CheckCircle size={20} className="text-primary" /> : <Share2 size={20} />}
            {copied ? "Copied" : "Share"}
          </button>
        </div>
      </div>
    </div>
  );
}

function MetricRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center text-[12px]">
      <span className="text-on-surface-variant font-medium">{label}</span>
      <span className="text-on-surface font-bold">{value}</span>
    </div>
  );
}

function TabBtn({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return (
    <button 
      onClick={onClick}
      className={`flex-1 py-3 px-4 rounded-xl font-bold text-xs uppercase tracking-wider transition-all ${
        active 
          ? 'bg-surface-container-lowest text-primary shadow-sm' 
          : 'text-on-surface-variant hover:text-on-surface'
      }`}
    >
      {label}
    </button>
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
    <dl style={{ display: "grid", gap: 10, fontSize: 13 }}>
      {rows.map((r) => (
        <div key={r.label} style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
          <dt style={{ color: "var(--text-muted)", fontWeight: 500 }}>{r.label}</dt>
          <dd style={{ fontWeight: 700, textAlign: "right", color: "var(--text-primary)" }}>{r.value}</dd>
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
  const rows: { label: string; value: string; icon: React.ReactNode }[] = [];
  if (conditions.temperature_c != null) {
    rows.push({ label: t("airTemp"), value: `${conditions.temperature_c.toFixed(1)} °C`, icon: <Thermometer size={14} /> });
  }
  if (conditions.relative_humidity_pct != null) {
    rows.push({ label: t("humidity"), value: `${Math.round(conditions.relative_humidity_pct)}%`, icon: <Waves size={14} /> });
  }
  if (conditions.soil_moisture_0_7cm != null) {
    rows.push({ label: t("soilMoist07"), value: `${conditions.soil_moisture_0_7cm.toFixed(3)} m³/m³`, icon: <Droplets size={14} /> });
  }
  
  if (rows.length === 0) return null;

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
      {rows.map((r) => (
        <div key={r.label} style={{ background: "rgba(255,255,255,0.02)", padding: 12, borderRadius: 12, border: "1px solid var(--border)" }}>
           <div style={{ color: "var(--text-muted)", fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6, display: "flex", alignItems: "center", gap: 6 }}>
            {r.icon} {r.label}
          </div>
          <div style={{ color: "var(--text-primary)", fontSize: 13, fontWeight: 700 }}>
            {r.value}
          </div>
        </div>
      ))}
    </div>
  );
}

function YieldBlock({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) {
  return (
    <div>
      <div style={{ fontSize: 13, fontWeight: 800, marginBottom: 8, display: "flex", alignItems: "center", gap: 8, color: "var(--emerald-500)" }}>
        {icon} <span style={{ textTransform: "uppercase", letterSpacing: "0.05em" }}>{title}</span>
      </div>
      <p style={{ fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.7, margin: 0, fontWeight: 500 }}>
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
      <span style={{ fontSize: 12, color: "var(--text-muted)", fontWeight: 500 }}>{label}</span>
      <span
        style={{
          fontSize: 14,
          fontWeight: 700,
          color: highlight ? "var(--danger)" : "var(--emerald-400)",
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

function ActivityIcon() {
  return <Activity size={12} strokeWidth={3} />;
}
