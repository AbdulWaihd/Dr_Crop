"use client";

import React from 'react';
import Link from 'next/link';
import { useLocale } from "@/contexts/LocaleContext";

const LOCALE_LABELS: Record<string, string> = {
  en: "EN",
  hi: "हि",
  ur: "اردو",
};

export default function LandingPage() {
  const { t, locale, setLocale, isRtl } = useLocale();
  const LOCALES = ["en", "hi", "ur"] as const;

  return (
    <div className={`bg-surface text-on-surface font-body antialiased min-h-screen flex flex-col ${isRtl ? 'rtl' : 'ltr'}`} dir={isRtl ? 'rtl' : 'ltr'}>
      {/* TopNavBar */}
      <nav className="fixed top-0 w-full z-50 bg-[#f8faf8]/80 backdrop-blur-xl shadow-sm font-manrope antialiased tracking-tight">
        <div className="flex justify-between items-center h-20 px-6 md:px-12 w-full max-w-[1440px] mx-auto">
          <div className="text-2xl font-extrabold tracking-tighter text-primary">drCrop</div>
          <div className="hidden md:flex space-x-8 items-center">
            <a className="text-on-surface-variant font-medium hover:text-primary transition-colors duration-300" href="#">{t("navTechnology")}</a>
            <a className="text-on-surface-variant font-medium hover:text-primary transition-colors duration-300" href="#">{t("navHow")}</a>
            <a className="text-on-surface-variant font-medium hover:text-primary transition-colors duration-300" href="#">{t("navResearch")}</a>
            
            {/* Language Switcher */}
            <div className="flex bg-surface-container-low p-1 rounded-full border border-outline-variant/15 scale-90 ml-4">
               {LOCALES.map((loc) => (
                 <button
                   key={loc}
                   onClick={() => setLocale(loc)}
                   className={`px-3 py-1.5 rounded-full text-[10px] font-black transition-all ${locale === loc ? "bg-primary text-on-primary shadow-sm" : "text-on-surface-variant hover:text-on-surface"}`}
                 >
                   {LOCALE_LABELS[loc]}
                 </button>
               ))}
             </div>
          </div>
          <div className="flex items-center space-x-4">
            <Link href="/auth">
              <button className="px-5 py-2.5 rounded-full text-on-surface bg-surface-container-highest hover:bg-surface-variant transition-colors font-medium text-sm">{t("navLogin")}</button>
            </Link>
            <Link href="/auth">
              <button className="px-5 py-2.5 rounded-full text-on-primary bg-gradient-to-br from-primary to-primary-dim hover:opacity-90 transition-opacity font-medium shadow-sm text-sm">{t("navSignUp")}</button>
            </Link>
          </div>
        </div>
      </nav>

      <main className="flex-grow pt-20">
        {/* Hero Section */}
        <section className="relative w-full max-w-[1440px] mx-auto px-6 md:px-12 py-24 md:py-32 flex flex-col md:flex-row items-center gap-12 bg-gradient-to-b from-surface to-surface-container-low rounded-b-[2rem]">
          <div className={`flex-1 space-y-8 z-10 ${isRtl ? 'text-right' : 'text-left'}`}>
            <h1 className="font-headline text-5xl md:text-7xl font-extrabold text-on-surface tracking-tight leading-[1.1]">
              {t("landingHeroTitle")}
            </h1>
            <p className="font-body text-xl text-on-surface-variant leading-relaxed max-w-2xl">
              {t("landingHeroDesc")}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Link href="/diagnosis">
                <button className="px-8 py-4 rounded-full text-on-primary bg-gradient-to-br from-primary to-primary-dim hover:opacity-90 transition-opacity font-semibold text-lg shadow-lg flex items-center justify-center gap-2">
                  <span className="material-symbols-outlined" style={{fontVariationSettings: "'FILL' 1"}}>add_a_photo</span>
                  {t("landingStartDiagnosis")}
                </button>
              </Link>
              <button className="px-8 py-4 rounded-full text-on-surface bg-surface-container-highest hover:bg-surface-variant transition-colors font-semibold text-lg flex items-center justify-center gap-2">
                <span className="material-symbols-outlined">play_circle</span>
                {t("landingWatchDemo")}
              </button>
            </div>
          </div>
          <div className="flex-1 w-full relative">
            <div className="absolute inset-0 bg-gradient-to-tr from-surface to-transparent z-10 rounded-[2rem]"></div>
            <img 
              alt="Farmer scanning a healthy plant in a sunlit field with a tablet" 
              className="w-full h-[500px] object-cover rounded-[2rem] shadow-xl relative z-0" 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuDaC-XZQWKpGdjud74yTpwPeNAP2ehIB3nwjWUp9OvrI4cd7yEcNaVznlvfb-mi0XX9qqGKnpWnOr97MqlcnJrtr4jHfDqcobWFSjY5VGAnOqr56mrYPRK8fjp4R_5it6j8cX9B4iIgUEc26_SA-WgyJPKiDZYaGYI03-6uOrUn-GoM1JsjuETU9bBe672P2ng0RDBdDWJvTMbnP4WvVVy5nZuz56r2f3lTEP0sTt0Hb1c0g99jw9KfpXXAqbFFTjuX0MRB09_svogw" 
            />
          </div>
        </section>

        {/* Feature Highlights */}
        <section className="w-full max-w-[1440px] mx-auto px-6 md:px-12 py-24">
          <div className="text-center mb-16">
            <h2 className="font-headline text-3xl md:text-4xl font-bold text-on-surface tracking-tight">{t("landingFeaturesTitle")}</h2>
            <p className="font-body text-lg text-on-surface-variant mt-4">{t("landingFeaturesSubtitle")}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Card 1 */}
            <div className="bg-surface-container-lowest rounded-[1.5rem] p-8 shadow-sm border border-outline-variant/10 relative overflow-hidden group">
              <div className={`absolute top-0 opacity-10 transform group-hover:scale-110 transition-transform duration-500 ${isRtl ? 'left-0 -translate-x-4 -translate-y-4' : 'right-0 translate-x-4 -translate-y-4'}`}>
                <span className="material-symbols-outlined text-8xl text-primary">biotech</span>
              </div>
              <div className="w-14 h-14 rounded-full bg-surface-container-low flex items-center justify-center mb-6">
                <span className="material-symbols-outlined text-primary text-2xl" style={{fontVariationSettings: "'FILL' 1"}}>biotech</span>
              </div>
              <h3 className="font-headline text-xl font-bold text-on-surface mb-3">{t("landingCard1Title")}</h3>
              <p className="font-body text-on-surface-variant leading-relaxed">{t("landingCard1Desc")}</p>
            </div>
            {/* Card 2 */}
            <div className="bg-surface-container-lowest rounded-[1.5rem] p-8 shadow-sm border border-outline-variant/10 relative overflow-hidden group">
              <div className={`absolute top-0 opacity-10 transform group-hover:scale-110 transition-transform duration-500 ${isRtl ? 'left-0 -translate-x-4 -translate-y-4' : 'right-0 translate-x-4 -translate-y-4'}`}>
                <span className="material-symbols-outlined text-8xl text-primary">prescriptions</span>
              </div>
              <div className="w-14 h-14 rounded-full bg-surface-container-low flex items-center justify-center mb-6">
                <span className="material-symbols-outlined text-primary text-2xl" style={{fontVariationSettings: "'FILL' 1"}}>prescriptions</span>
              </div>
              <h3 className="font-headline text-xl font-bold text-on-surface mb-3">{t("landingCard2Title")}</h3>
              <p className="font-body text-on-surface-variant leading-relaxed">{t("landingCard2Desc")}</p>
            </div>
            {/* Card 3 */}
            <div className="bg-surface-container-lowest rounded-[1.5rem] p-8 shadow-sm border border-outline-variant/10 relative overflow-hidden group">
              <div className={`absolute top-0 opacity-10 transform group-hover:scale-110 transition-transform duration-500 ${isRtl ? 'left-0 -translate-x-4 -translate-y-4' : 'right-0 translate-x-4 -translate-y-4'}`}>
                <span className="material-symbols-outlined text-8xl text-primary">monitoring</span>
              </div>
              <div className="w-14 h-14 rounded-full bg-surface-container-low flex items-center justify-center mb-6">
                <span className="material-symbols-outlined text-primary text-2xl" style={{fontVariationSettings: "'FILL' 1"}}>monitoring</span>
              </div>
              <h3 className="font-headline text-xl font-bold text-on-surface mb-3">{t("landingCard3Title")}</h3>
              <p className="font-body text-on-surface-variant leading-relaxed">{t("landingCard3Desc")}</p>
            </div>
          </div>
        </section>

        {/* How it Works */}
        <section className="w-full bg-surface-container-low py-24 rounded-[2rem] mx-auto max-w-[calc(100%-2rem)] md:max-w-[calc(100%-6rem)]">
          <div className="max-w-[1200px] mx-auto px-6 md:px-12">
            <div className={`mb-16 ${isRtl ? 'text-right' : 'text-left'}`}>
              <h2 className="font-headline text-3xl md:text-4xl font-bold text-on-surface tracking-tight">{t("landingProtocolTitle")}</h2>
              <p className="font-body text-lg text-on-surface-variant mt-4 max-w-2xl">{t("landingProtocolDesc")}</p>
            </div>
            <div className="space-y-24">
              {/* Step 1 */}
              <div className="flex flex-col md:flex-row items-center gap-12">
                <div className={`flex-1 order-2 md:order-1 ${isRtl ? 'text-right' : 'text-left'}`}>
                  <div className="text-primary font-bold text-6xl opacity-20 mb-4 font-headline">01</div>
                  <h3 className="font-headline text-2xl font-bold text-on-surface mb-4">{t("landingStep1Title")}</h3>
                  <p className="font-body text-on-surface-variant text-lg leading-relaxed">{t("landingStep1Desc")}</p>
                </div>
                <div className="flex-1 order-1 md:order-2 w-full">
                  <div className={`bg-surface-container-lowest rounded-[2rem] p-4 shadow-sm transform ${isRtl ? '-rotate-2' : 'rotate-2'}`}>
                    <img 
                      alt="Person taking photo of a plant leaf" 
                      className="w-full h-[300px] object-cover rounded-[1.5rem]" 
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuDXQdiygdxIIV3v7KeVmJ2rSe8UoHenvO-PQyUhV4G1qtPQkT3u7JvIcpFoJbJ4pLvC0ddRkzPgMnr_I1Jn6PKmL9k65E2mFIKgRYiNoEZ7d3WnG2I-LuqTPsm1BBED2TJrHD1TCOUqYIaKKd6omcnaxNXJ2TQv7Py5s_aZ_OvOSI7Ac4NkoDM4nJMLY81bSuNJgOZrE5YrR0wTnPrsZVSgPAR_yi7mASdAbSwTZ-lw0RR9gjiDJJBCT9GNKuKjaEvfWgBIFRHCNItv" 
                    />
                  </div>
                </div>
              </div>
              {/* Step 2 */}
              <div className="flex flex-col md:flex-row items-center gap-12">
                <div className="flex-1 w-full relative">
                  <div className={`bg-surface-container-lowest rounded-[2rem] p-4 shadow-sm transform ${isRtl ? 'rotate-2' : '-rotate-2'}`}>
                    <img alt="AI Analysis visualization" className="w-full h-[300px] object-cover rounded-[1.5rem]" src="/ai_analysis.png" />
                  </div>
                </div>
                <div className={`flex-1 ${isRtl ? 'text-right' : 'text-left'}`}>
                  <div className="text-primary font-bold text-6xl opacity-20 mb-4 font-headline">02</div>
                  <h3 className="font-headline text-2xl font-bold text-on-surface mb-4">{t("landingStep2Title")}</h3>
                  <p className="font-body text-on-surface-variant text-lg leading-relaxed">{t("landingStep2Desc")}</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Trust Section */}
        <section className="w-full max-w-[1440px] mx-auto px-6 md:px-12 py-24 text-center">
          <h3 className="font-headline text-xl text-on-surface-variant mb-12 uppercase tracking-widest font-semibold">{t("landingTrustTitle")}</h3>
          <div className="flex flex-wrap justify-center gap-12 md:gap-24">
            <div className="flex flex-col items-center">
              <span className="font-headline text-5xl font-extrabold text-primary mb-2">{t("landingStat1Val")}</span>
              <span className="font-body text-on-surface-variant font-medium">{t("landingStat1Label")}</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="font-headline text-5xl font-extrabold text-primary mb-2">{t("landingStat2Val")}</span>
              <span className="font-body text-on-surface-variant font-medium">{t("landingStat2Label")}</span>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-surface-container-low w-full mt-auto rounded-t-[2rem] font-manrope text-sm py-12">
        <div className="flex flex-col md:flex-row justify-between items-center px-8 md:px-16 gap-8 w-full max-w-[1440px] mx-auto">
          <div className="text-xl font-bold text-on-surface">drCrop</div>
          <div className="flex flex-wrap justify-center gap-6">
            <a className="text-on-surface-variant hover:text-primary transition-all" href="#">{t("landingFooterPrivacy")}</a>
            <a className="text-on-surface-variant hover:text-primary transition-all" href="#">{t("landingFooterTerms")}</a>
            <a className="text-on-surface-variant hover:text-primary transition-all" href="#">{t("landingFooterContact")}</a>
          </div>
          <div className="text-on-surface-variant text-center md:text-right">
            {t("landingFooterCopyright")}
          </div>
        </div>
      </footer>
    </div>
  );
}
