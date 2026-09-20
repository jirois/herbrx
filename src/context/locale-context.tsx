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
  // Always start from DEFAULT_LOCALE on the very first render, on both
  // server and client — localStorage doesn't exist during SSR, so reading
  // it inside this initializer meant the server always rendered
  // DEFAULT_LOCALE while the client's first paint (during hydration) could
  // immediately pick up a different saved locale, before any effect had a
  // chance to run. That mismatch between server and client text on the
  // very first render is exactly what React's hydration check caught.
  // Reading the saved locale is moved into the effect below instead, which
  // only ever runs on the client, after hydration has already succeeded.
  const [locale, setLocaleState] = useState<Locale>(DEFAULT_LOCALE);

  useEffect(() => {
    const valid: Locale[] = ["en", "pcm", "ig", "ha", "yo"];
    const frame = requestAnimationFrame(() => {
      try {
        const stored = localStorage.getItem(
          LOCALE_STORAGE_KEY,
        ) as Locale | null;
        if (stored && valid.includes(stored) && stored !== DEFAULT_LOCALE) {
          setLocaleState(stored);
        }
      } catch {}
    });

    return () => {
      cancelAnimationFrame(frame);
    };
  }, []);

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
