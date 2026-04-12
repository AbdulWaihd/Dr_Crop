"use client";

import { useLocale } from "@/contexts/LocaleContext";
import { LOCALES, type Locale } from "@/lib/i18n";
import { Sprout, Activity } from "lucide-react";

const LOCALE_LABELS: Record<Locale, string> = {
  en: "EN",
  hi: "हि",
  ur: "اردو",
};

export default function Header() {
  const { locale, setLocale, t } = useLocale();

  return (
    <header className="app-header">
      <div className="app-header__inner">
        <div className="app-header__brand">
          <div className="app-header__logo animate-pulse-glow" aria-hidden>
            <Sprout size={22} strokeWidth={2.5} />
          </div>
          <div>
            <h1 className="app-header__title">{t("headerTitle")}</h1>
            <p className="app-header__subtitle">{t("headerSubtitle")}</p>
          </div>
        </div>

        <nav className="app-header__nav">
          <div className="locale-segment" role="group" aria-label="Language">
            {LOCALES.map((loc) => (
              <button
                key={loc}
                type="button"
                aria-current={locale === loc ? "true" : undefined}
                onClick={() => setLocale(loc)}
              >
                {LOCALE_LABELS[loc]}
              </button>
            ))}
          </div>

          <a href="#farm-copilot" className="app-header__link">
            {t("navCopilot")}
          </a>
          <a href="#how-it-works" className="app-header__link">
            {t("navHow")}
          </a>
          <a href="#crops" className="app-header__link">
            {t("navDiseases")}
          </a>
          <span className="app-header__divider" aria-hidden />
          <div className="badge badge-success app-header__badge">
            <Activity size={12} strokeWidth={3} />
            {t("badgeOnline")}
          </div>
        </nav>
      </div>
    </header>
  );
}
