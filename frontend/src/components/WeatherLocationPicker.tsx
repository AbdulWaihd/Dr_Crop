"use client";

import { useLocale } from "@/contexts/LocaleContext";

export type WeatherLocMode = "gps" | "manual";

type Props = {
  mode: WeatherLocMode;
  onModeChange: (m: WeatherLocMode) => void;
  manualLat: string;
  manualLon: string;
  onManualLat: (v: string) => void;
  onManualLon: (v: string) => void;
  disabled?: boolean;
};

export default function WeatherLocationPicker({
  mode,
  onModeChange,
  manualLat,
  manualLon,
  onManualLat,
  onManualLon,
  disabled,
}: Props) {
  const { t } = useLocale();

  return (
    <div
      className="glass-card"
      style={{
        padding: 16,
        marginBottom: 16,
        borderColor: "rgba(74, 222, 128, 0.2)",
      }}
    >
      <div style={{ fontWeight: 700, fontSize: 14, color: "var(--text-primary)", marginBottom: 6 }}>
        🌦️ {t("weatherLocTitle")}
      </div>
      <p style={{ fontSize: 12, color: "var(--text-muted)", lineHeight: 1.5, marginBottom: 12 }}>
        {t("weatherLocHint")}
      </p>

      <div className="locale-segment" style={{ marginBottom: 12, width: "100%", maxWidth: 360 }}>
        <button
          type="button"
          aria-current={mode === "gps" ? "true" : undefined}
          disabled={disabled}
          onClick={() => onModeChange("gps")}
        >
          {t("weatherLocGps")}
        </button>
        <button
          type="button"
          aria-current={mode === "manual" ? "true" : undefined}
          disabled={disabled}
          onClick={() => onModeChange("manual")}
        >
          {t("weatherLocManual")}
        </button>
      </div>

      {mode === "manual" && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 10, alignItems: "flex-end" }}>
          <label style={{ flex: "1 1 120px", display: "flex", flexDirection: "column", gap: 4 }}>
            <span style={{ fontSize: 11, color: "var(--text-dim)" }}>{t("weatherLat")}</span>
            <input
              type="text"
              inputMode="decimal"
              disabled={disabled}
              placeholder="e.g. 28.61"
              value={manualLat}
              onChange={(e) => onManualLat(e.target.value)}
              style={{
                padding: "10px 12px",
                borderRadius: 12,
                border: "1px solid var(--border-bright)",
                background: "rgba(255,255,255,0.04)",
                color: "var(--text-primary)",
                fontSize: 14,
                width: "100%",
              }}
            />
          </label>
          <label style={{ flex: "1 1 120px", display: "flex", flexDirection: "column", gap: 4 }}>
            <span style={{ fontSize: 11, color: "var(--text-dim)" }}>{t("weatherLon")}</span>
            <input
              type="text"
              inputMode="decimal"
              disabled={disabled}
              value={manualLon}
              placeholder="e.g. 77.21"
              onChange={(e) => onManualLon(e.target.value)}
              style={{
                padding: "10px 12px",
                borderRadius: 12,
                border: "1px solid var(--border-bright)",
                background: "rgba(255,255,255,0.04)",
                color: "var(--text-primary)",
                fontSize: 14,
                width: "100%",
              }}
            />
          </label>
        </div>
      )}
    </div>
  );
}
