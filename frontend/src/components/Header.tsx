"use client";

import { useState } from "react";
import { useLocale } from "@/contexts/LocaleContext";
import { LOCALES, type Locale } from "@/lib/i18n";
import { Sprout, Activity, Menu, X } from "lucide-react";

const LOCALE_LABELS: Record<Locale, string> = {
  en: "EN",
  hi: "हि",
  ur: "اردو",
};

export default function Header() {
  const { locale, setLocale, t, isRtl } = useLocale();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  const navLinks = (
    <>
      <div className="locale-segment" role="group" aria-label="Language">
        {LOCALES.map((loc) => (
          <button
            key={loc}
            type="button"
            className="locale-btn"
            aria-current={locale === loc ? "true" : undefined}
            onClick={() => {
              setLocale(loc);
              if (isMenuOpen) setIsMenuOpen(false);
            }}
          >
            {LOCALE_LABELS[loc]}
          </button>
        ))}
      </div>

      <a href="#farm-copilot" className="app-header__link" onClick={() => setIsMenuOpen(false)}>
        {t("navCopilot")}
      </a>
      <a href="#how-it-works" className="app-header__link" onClick={() => setIsMenuOpen(false)}>
        {t("navHow")}
      </a>
      <a href="#crops" className="app-header__link" onClick={() => setIsMenuOpen(false)}>
        {t("navDiseases")}
      </a>
      
      <div className="app-header__status desktop-only">
        <span className="app-header__divider" aria-hidden />
        <div className="badge badge-success app-header__badge">
          <Activity size={12} strokeWidth={3} />
          {t("badgeOnline")}
        </div>
      </div>
    </>
  );

  return (
    <header className="app-header">
      <div className="app-header__inner">
        <div className="app-header__brand">
          <div className="app-header__logo animate-pulse-glow" aria-hidden>
            <Sprout size={32} strokeWidth={2.5} />
          </div>
          <div className="app-header__text">
            <h1 className="app-header__title">{t("headerTitle")}</h1>
            <p className="app-header__subtitle">{t("headerSubtitle")}</p>
          </div>
        </div>

        {/* Desktop Nav */}
        <nav className="app-header__nav desktop-only">
          {navLinks}
        </nav>

        {/* Hamburger Button */}
        <button 
          className="mobile-toggle" 
          onClick={toggleMenu}
          aria-label="Toggle menu"
        >
          {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
        </button>

        {/* Mobile Nav Overlay */}
        {isMenuOpen && (
          <div className="mobile-nav-overlay animate-fade-in" dir={isRtl ? "rtl" : "ltr"}>
            <div className="mobile-nav-content">
              {navLinks}
              <div className="badge badge-success app-header__badge" style={{ marginTop: 20 }}>
                <Activity size={12} strokeWidth={3} />
                {t("badgeOnline")}
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
