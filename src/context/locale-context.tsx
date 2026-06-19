"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from "react";
import { translations, interpolate } from "@/i18n/translations";
import type { TranslationKey } from "@/i18n/translations";
import type { Locale } from "@/i18n/types";
import { DEFAULT_LOCALE, LOCALE_STORAGE_KEY } from "@/i18n/types";

// ── Context value ─────────────────────────────────────────────────────────
interface LocaleContextValue {
  locale: Locale;
  setLocale: (l: Locale) => void;
  t: (key: TranslationKey, vars?: Record<string, string | number>) => string;
  dir: "ltr";
}

const LocaleContext = createContext<LocaleContextValue | null>(null);

// ── Provider ──────────────────────────────────────────────────────────────
export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(() => {
    const valid: Locale[] = ["en", "pcm", "ig", "ha", "yo"];
    try {
      const stored = localStorage.getItem(LOCALE_STORAGE_KEY) as Locale | null;
      return stored && valid.includes(stored) ? stored : DEFAULT_LOCALE;
    } catch {
      return DEFAULT_LOCALE;
    }
  });

  useEffect(() => {
    document.documentElement.lang = locale === "pcm" ? "pcm" : locale;
  }, [locale]);

  // Persist + update <html lang>
  const setLocale = useCallback((l: Locale) => {
    setLocaleState(l);
    try {
      localStorage.setItem(LOCALE_STORAGE_KEY, l);
    } catch {}
  }, []);

  // Translation function
  const t = useCallback(
    (key: TranslationKey, vars?: Record<string, string | number>): string => {
      const dict = translations[locale as keyof typeof translations] as Record<
        string,
        string
      >;
      const fallback = translations.en as Record<string, string>;
      const raw = dict[key] ?? fallback[key] ?? key;
      return vars ? interpolate(raw, vars) : raw;
    },
    [locale],
  );

  return (
    <LocaleContext.Provider value={{ locale, setLocale, t, dir: "ltr" }}>
      {children}
    </LocaleContext.Provider>
  );
}

// ── Hooks ─────────────────────────────────────────────────────────────────
export function useLocale(): LocaleContextValue {
  const ctx = useContext(LocaleContext);
  if (!ctx) throw new Error("useLocale must be used inside <LocaleProvider>");
  return ctx;
}

/** Shorthand — most components only need t() */
export function useT() {
  return useLocale().t;
}
