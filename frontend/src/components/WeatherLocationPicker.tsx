"use client";

import { useLocale } from "@/contexts/LocaleContext";
import { CloudSun, MapPin, Navigation } from "lucide-react";

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
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-primary-container/30 flex items-center justify-center text-primary">
          <CloudSun size={20} />
        </div>
        <div>
          <h4 className="font-bold text-on-surface text-base leading-tight">{t("weatherLocTitle")}</h4>
          <p className="text-xs text-on-surface-variant font-medium mt-0.5">{t("weatherLocHint")}</p>
        </div>
      </div>

      <div className="flex bg-surface-container-low rounded-full p-1 border border-outline-variant/10">
        <button
          type="button"
          onClick={() => onModeChange("gps")}
          disabled={disabled}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-full text-xs font-bold transition-all ${
            mode === "gps" 
              ? "bg-surface-container-lowest text-primary shadow-sm" 
              : "text-on-surface-variant hover:text-on-surface"
          }`}
        >
          <Navigation size={14} className={mode === "gps" ? "text-primary" : ""} />
          {t("weatherLocGps")}
        </button>
        <button
          type="button"
          onClick={() => onModeChange("manual")}
          disabled={disabled}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-full text-xs font-bold transition-all ${
            mode === "manual" 
              ? "bg-surface-container-lowest text-primary shadow-sm" 
              : "text-on-surface-variant hover:text-on-surface"
          }`}
        >
          <MapPin size={14} className={mode === "manual" ? "text-primary" : ""} />
          {t("weatherLocManual")}
        </button>
      </div>

      {mode === "manual" && (
        <div className="grid grid-cols-2 gap-4 animate-fade-in">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-widest text-secondary px-1" htmlFor="lat">{t("weatherLat")}</label>
            <input
              id="lat"
              type="text"
              inputMode="decimal"
              disabled={disabled}
              placeholder="e.g. 28.61"
              value={manualLat}
              onChange={(e) => onManualLat(e.target.value)}
              className="w-full bg-surface-container-low border border-outline-variant/15 rounded-xl py-3 px-4 text-on-surface font-medium text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-widest text-secondary px-1" htmlFor="lon">{t("weatherLon")}</label>
            <input
              id="lon"
              type="text"
              inputMode="decimal"
              disabled={disabled}
              placeholder="e.g. 77.23"
              value={manualLon}
              onChange={(e) => onManualLon(e.target.value)}
              className="w-full bg-surface-container-low border border-outline-variant/15 rounded-xl py-3 px-4 text-on-surface font-medium text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
            />
          </div>
        </div>
      )}
    </div>
  );
}
