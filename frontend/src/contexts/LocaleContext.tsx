"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  LOCALE_STORAGE_KEY,
  RTL_LOCALES,
  SPEECH_LANG,
  detectBrowserLocale,
  formatMessage,
  messages,
  type Locale,
  type MessageKey,
} from "@/lib/i18n";

type LocaleContextValue = {
  locale: Locale;
  setLocale: (l: Locale) => void;
  t: (key: MessageKey, vars?: Record<string, string | number>) => string;
  speechLang: string;
  isRtl: boolean;
};

const LocaleContext = createContext<LocaleContextValue | null>(null);

function readInitialLocale(): Locale {
  if (typeof window === "undefined") return "en";
  try {
    const saved = localStorage.getItem(LOCALE_STORAGE_KEY) as Locale | null;
    if (saved && messages[saved]) return saved;
  } catch {
    /* ignore */
  }
  return detectBrowserLocale();
}

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(readInitialLocale);

  const setLocale = useCallback((l: Locale) => {
    setLocaleState(l);
    try {
      localStorage.setItem(LOCALE_STORAGE_KEY, l);
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = RTL_LOCALES.includes(locale) ? "rtl" : "ltr";
  }, [locale]);

  const t = useCallback(
    (key: MessageKey, vars?: Record<string, string | number>) => {
      const raw = messages[locale][key] ?? messages.en[key] ?? key;
      return vars ? formatMessage(raw, vars) : raw;
    },
    [locale]
  );

  const value = useMemo<LocaleContextValue>(
    () => ({
      locale,
      setLocale,
      t,
      speechLang: SPEECH_LANG[locale],
      isRtl: RTL_LOCALES.includes(locale),
    }),
    [locale, setLocale, t]
  );

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useLocale() {
  const ctx = useContext(LocaleContext);
  if (!ctx) {
    throw new Error("useLocale must be used within LocaleProvider");
  }
  return ctx;
}
