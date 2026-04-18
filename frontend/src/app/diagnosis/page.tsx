"use client";

import { useState, useEffect } from "react";
import { 
  Eye, 
  Search, 
  CloudSun, 
  Zap, 
  Camera, 
  Cpu, 
  Lightbulb, 
  MapPin, 
  AlertTriangle,
  X,
  Sprout,
  Menu
} from "lucide-react";
import { useRouter } from "next/navigation";
import FarmCopilot from "@/components/FarmCopilot";
import ImageUploader from "@/components/ImageUploader";
import ResultCard from "@/components/ResultCard";
import WeatherLocationPicker, { type WeatherLocMode } from "@/components/WeatherLocationPicker";
import Header from "@/components/Header";
import { useLocale } from "@/contexts/LocaleContext";
import { predictDisease, fetchRecommendation } from "@/services/api";
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
  if (Number.isNaN(la) || Number.isNaN(lo)) return { kind: "error", messageKey: "coordsIncomplete" }; // Simplified for now
  if (la < -90 || la > 90 || lo < -180 || lo > 180) return { kind: "error", messageKey: "coordsInvalid" };
  return { kind: "ok", coords: { latitude: la, longitude: lo } };
}

export default function DiagnosisPage() {
  const { t, locale, setLocale, isRtl } = useLocale();
  const LOCALES = ["en", "hi", "ur"] as const;
  const LOCALE_LABELS: Record<string, string> = {
    en: "EN",
    hi: "हि",
    ur: "اردو",
  };
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  useEffect(() => {
    const auth = localStorage.getItem("dr-crop-auth");
    if (!auth) {
      router.replace("/auth");
    } else {
      setIsLoggedIn(true);
      setIsCheckingAuth(false);
    }
  }, [router]);
  const [loading, setLoading] = useState(false);
  const [loadingStatus, setLoadingStatus] = useState<any>("statusUploading");

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

  // Re-fetch recommendation when locale changes 
  useEffect(() => {
    if (result && !loading) {
      async function retranslateInfo() {
        setLoading(true);
        try {
          const coordsObj = lastGeo ? { latitude: lastGeo.lat, longitude: lastGeo.lon } : null;
          const rec = await fetchRecommendation(result!, coordsObj, locale);
          setRecommendation(rec);
        } catch (e) {
        } finally {
          setLoading(false);
        }
      }
      retranslateInfo();
    }
  }, [locale]);

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center flex-col gap-4">
        <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
        <p className="font-bold text-on-surface-variant animate-pulse">Authenticating...</p>
      </div>
    );
  }

  const handleLogout = () => {
    localStorage.removeItem("dr-crop-auth");
    router.replace("/auth");
  };

  const handleImageSelected = async (file: File) => {
    setLoading(true);
    setError(null);
    setResult(null);
    setRecommendation(null);
    setLastGeo(null);
    setGeoFailed(false);
    setLastGeoSource(null);

    try {
      setLoadingStatus("statusUploading");
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
      
      setLoadingStatus("statusAnalyzing");
      const data = await predictDisease(file, coords, locale);
      
      setLoadingStatus("statusFetching");
      setResult(data.prediction);
      setRecommendation(data.recommendation);
      setLoadingStatus("statusDone");
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

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"diagnosis" | "copilot" | "history">("diagnosis");

  return (
    <div className="bg-surface text-on-surface h-screen flex overflow-hidden relative">
      {/* SideNavBar - Responsive Drawer */}
      <nav 
        className={`bg-surface-container-low text-primary font-body text-sm h-screen w-64 fixed lg:static left-0 top-0 border-r border-outline-variant/15 flex flex-col p-4 gap-2 z-[60] transition-transform duration-300 ease-in-out ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="flex items-center justify-between mb-8 px-2 mt-4">
          <div>
            <h1 className="text-2xl font-black text-primary tracking-tighter">drCrop</h1>
            <p className="text-xs text-on-surface-variant uppercase tracking-wider mt-1">{t("navLaboratory")}</p>
          </div>
          <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden p-2 text-on-surface-variant hover:bg-surface-container rounded-full">
            <X size={20} />
          </button>
        </div>

        {/* Mobile Language Switcher */}
        <div className="flex lg:hidden bg-surface-container-highest p-1 rounded-full border border-outline-variant/10 mb-6 mx-2">
            {LOCALES.map((loc) => (
                <button
                key={loc}
                onClick={() => { setLocale(loc as any); setIsSidebarOpen(false); }}
                className={`flex-1 py-2 rounded-full text-[10px] font-black transition-all ${locale === loc ? "bg-primary text-on-primary shadow-sm" : "text-on-surface-variant"}`}
                >
                {LOCALE_LABELS[loc]}
                </button>
            ))}
        </div>
        <div className="flex flex-col gap-2 flex-grow">
          <button 
            onClick={() => { setActiveTab("diagnosis"); setIsSidebarOpen(false); }}
            className={`flex items-center gap-3 px-4 py-3 transition-all rounded-xl w-full text-left ${activeTab === "diagnosis" ? "bg-surface-container-lowest text-primary font-semibold shadow-sm" : "text-on-surface-variant hover:text-primary hover:bg-surface-container"}`}
          >
            <span className="material-symbols-outlined">grid_view</span>
            <span>{t("navDashboard")}</span>
          </button>
          
          <button 
            onClick={() => { setActiveTab("diagnosis"); setIsSidebarOpen(false); }}
            className={`flex items-center gap-3 px-4 py-3 transition-all rounded-xl w-full text-left ${activeTab === "diagnosis" ? "bg-surface-container-lowest text-primary font-semibold shadow-sm" : "text-on-surface-variant hover:text-primary hover:bg-surface-container"}`}
          >
            <span className="material-symbols-outlined" style={{fontVariationSettings: activeTab === "diagnosis" ? "'FILL' 1" : ""}}>camera_enhance</span>
            <span>{t("navDiagnosisHub")}</span>
          </button>

          <button 
            onClick={() => { setActiveTab("copilot"); setIsSidebarOpen(false); }}
            className={`flex items-center gap-3 px-4 py-3 transition-all rounded-xl w-full text-left ${activeTab === "copilot" ? "bg-surface-container-lowest text-primary font-semibold shadow-sm" : "text-on-surface-variant hover:text-primary hover:bg-surface-container"}`}
          >
            <span className="material-symbols-outlined" style={{fontVariationSettings: activeTab === "copilot" ? "'FILL' 1" : ""}}>smart_toy</span>
            <span>{t("navCopilot")}</span>
          </button>

          <button 
            onClick={() => { setActiveTab("history"); setIsSidebarOpen(false); }}
            className={`flex items-center gap-3 px-4 py-3 transition-all rounded-xl w-full text-left ${activeTab === "history" ? "bg-surface-container-lowest text-primary font-semibold shadow-sm" : "text-on-surface-variant hover:text-primary hover:bg-surface-container"}`}
          >
            <span className="material-symbols-outlined" style={{fontVariationSettings: activeTab === "history" ? "'FILL' 1" : ""}}>potted_plant</span>
            <span>{t("navFarmHistory")}</span>
          </button>
        </div>
        <div className="mt-auto mb-6">
          <button onClick={handleReset} className="w-full bg-gradient-to-br from-primary to-primary-dim text-on-primary py-3 rounded-full font-bold shadow-sm hover:opacity-90 transition-opacity">
            {t("btnNewDiagnosis")}
          </button>
        </div>
      </nav>

      {/* Overlay for mobile sidebar */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 lg:hidden animate-fade-in" 
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <main className="flex-1 flex flex-col h-screen overflow-hidden bg-surface-container-low relative">
        <header className="bg-surface-container-lowest/80 backdrop-blur-xl text-primary font-body text-sm font-medium tracking-tight sticky top-0 z-40 shadow-sm flex justify-between items-center w-full px-4 sm:px-6 py-3 border-b border-outline-variant/15">
          <div className="flex items-center gap-4 flex-1">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden p-2 -ml-2 text-on-surface-variant hover:bg-surface-container rounded-full"
            >
              <Menu size={24} />
            </button>
            <div className="relative w-full max-w-64 hidden sm:block">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-lg">search</span>
              <input className="w-full bg-surface-container-highest border-none rounded-full pl-10 pr-4 py-2 text-sm focus:ring-2 focus:ring-primary/20 transition-all text-on-surface placeholder-on-surface-variant" placeholder={t("searchPlaceholder")} type="text"/>
            </div>
          </div>
          <div className="flex items-center gap-4 sm:gap-6">
             {/* Language Switcher Component */}
             <div className="hidden md:flex bg-surface-container-low p-1 rounded-full border border-outline-variant/15 scale-90">
               {LOCALES.map((loc) => (
                 <button
                   key={loc}
                   onClick={() => setLocale(loc as any)}
                   className={`px-3 py-1.5 rounded-full text-[10px] font-black transition-all ${locale === loc ? "bg-primary text-on-primary shadow-sm" : "text-on-surface-variant hover:text-on-surface"}`}
                 >
                   {LOCALE_LABELS[loc]}
                 </button>
               ))}
             </div>

             <div className="flex items-center gap-2 sm:gap-4 border-l border-outline-variant/20 pl-4 sm:pl-6">
                <button className="p-2 text-on-surface-variant hover:bg-surface-container transition-colors duration-200 rounded-full relative">
                  <span className="material-symbols-outlined">notifications</span>
                  <span className="absolute top-2 right-2 w-2 h-2 bg-error rounded-full"></span>
                </button>
                  <button 
                    onClick={handleLogout}
                    className="px-4 py-1.5 rounded-full bg-surface-container-highest text-on-surface text-xs font-bold shadow-sm hover:bg-surface-variant transition-colors whitespace-nowrap"
                  >
                    Logout
                  </button>
              </div>
          </div>
        </header>

        <div className="flex-1 flex flex-col overflow-hidden">
          {activeTab === "diagnosis" && (
            <div className="flex-1 flex flex-col lg:flex-row overflow-hidden p-4 sm:p-6 gap-6">
              <div className="flex-1 flex flex-col gap-6 overflow-y-auto pr-0 lg:pr-2 pb-6 custom-scrollbar">
                <div className="px-2">
                  <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-on-surface mb-1">{t("navDiagnosisHub")}</h2>
                  <p className="text-on-surface-variant text-sm sm:text-base">{t("heroSubtitle")}</p>
                </div>

                <div className="bg-surface-container-lowest rounded-3xl border border-dashed border-outline/20 p-6 sm:p-12 flex flex-col items-center justify-center text-center transition-colors hover:bg-primary-container/10 group cursor-pointer relative overflow-hidden shadow-sm">
                  <div className="relative z-10 w-full max-w-2xl mx-auto">
                    {!result ? (
                      <>
                        <ImageUploader
                          onImageSelected={handleImageSelected}
                          loading={loading}
                          loadingStatus={loadingStatus}
                          preview={preview}
                          setPreview={setPreview}
                        />
                        {error && <p className="text-error text-sm mt-4 font-bold">{error}</p>}
                      </>
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
                </div>

                <div className="mt-4 px-2 pb-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-bold text-on-surface">{t("weatherLocTitle")}</h3>
                  </div>
                  <div className="bg-surface-container-lowest rounded-3xl p-6 shadow-sm border border-outline-variant/15">
                    <WeatherLocationPicker
                      mode={weatherMode}
                      onModeChange={setWeatherMode}
                      manualLat={manualLat}
                      manualLon={manualLon}
                      onManualLat={setManualLat}
                      onManualLon={setManualLon}
                      disabled={loading}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "copilot" && (
            <div className="flex-1 p-4 sm:p-6 flex flex-col overflow-hidden animate-fade-in">
               <div className="bg-surface-container-lowest rounded-3xl shadow-xl flex flex-col overflow-hidden border border-outline-variant/15 flex-1 max-w-4xl mx-auto w-full">
                  <FarmCopilot />
               </div>
            </div>
          )}

          {activeTab === "history" && (
            <div className="flex-1 p-6 flex flex-col items-center justify-center text-center animate-fade-in">
               <div className="w-24 h-24 bg-surface-container rounded-full flex items-center justify-center text-on-surface-variant/20 mb-6">
                  <span className="material-symbols-outlined text-5xl">inventory_2</span>
               </div>
               <h3 className="text-2xl font-bold text-on-surface mb-2">{t("historyEmpty")}</h3>
               <p className="text-on-surface-variant max-w-sm mx-auto font-medium">{t("historyEmptyDesc")}</p>
               <button 
                  onClick={() => setActiveTab("diagnosis")}
                  className="mt-8 px-8 py-3 bg-primary text-on-primary rounded-full font-bold shadow-lg hover:bg-primary-dim transition-all"
               >
                  {t("btnNewScan")}
               </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
