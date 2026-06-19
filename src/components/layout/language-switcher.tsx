"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Check } from "lucide-react";
import { useLocale } from "@/context/locale-context";
import { LOCALES } from "@/i18n/types";
import { cn } from "@/lib/utils";

interface LanguageSwitcherProps {
  /** 'navbar' = compact pill, 'footer' = full list */
  variant?: "navbar" | "footer";
}

export function LanguageSwitcher({
  variant = "navbar",
}: LanguageSwitcherProps) {
  const { locale, setLocale } = useLocale();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const current = LOCALES.find((l) => l.code === locale) ?? LOCALES[0];

  // Close on outside click
  useEffect(() => {
    function onOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node))
        setOpen(false);
    }
    document.addEventListener("mousedown", onOutside);
    return () => document.removeEventListener("mousedown", onOutside);
  }, []);

  // Close on Escape
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  if (variant === "footer") {
    return (
      <div className="flex flex-wrap gap-2">
        {LOCALES.map((l) => (
          <button
            key={l.code}
            onClick={() => setLocale(l.code)}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-medium transition-all",
              locale === l.code
                ? "bg-(--green-mid) text-white"
                : "bg-white/8 text-white/50 hover:bg-white/15 hover:text-white",
            )}
            aria-pressed={locale === l.code}
            lang={l.code}
          >
            <span>{l.flag}</span>
            {l.label}
          </button>
        ))}
      </div>
    );
  }

  return (
    <div ref={ref} className="relative">
      {/* Trigger */}
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label={`Language: ${current.english}. Click to change.`}
        aria-expanded={open}
        aria-haspopup="listbox"
        className={cn(
          "flex items-center gap-1.5 px-3 h-9 rounded-full border transition-all duration-200",
          "text-[13px] font-medium select-none",
          open
            ? "bg-(--green-deep) text-white border-(--green-deep)"
            : "bg-white border-(--cream-dark) text-(--text-body) hover:border-(--green-mid) hover:text-(--green-deep)",
        )}
      >
        <span className="text-[15px]" role="img" aria-hidden>
          {current.flag}
        </span>
        <span className="hidden sm:inline">{current.label}</span>
        <ChevronDown
          size={13}
          className={cn(
            "transition-transform duration-200",
            open && "rotate-180",
          )}
        />
      </button>

      {/* Dropdown */}
      <AnimatePresence>
        {open && (
          <motion.div
            role="listbox"
            aria-label="Select language"
            initial={{ opacity: 0, y: 6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.97 }}
            transition={{ duration: 0.14 }}
            className={cn(
              "absolute right-0 top-full mt-2 z-50",
              "bg-white rounded-2xl shadow-[0_8px_32px_rgba(26,58,42,0.14)]",
              "border border-(--cream-dark) py-2 min-w-45",
            )}
          >
            {/* Label */}
            <p className="px-4 pt-1 pb-2 text-[10px] uppercase tracking-[0.12em] text-(--text-muted) font-medium border-b border-(--cream-dark) mb-1">
              Choose Language
            </p>

            {LOCALES.map((l) => {
              const isActive = locale === l.code;
              return (
                <button
                  key={l.code}
                  role="option"
                  aria-selected={isActive}
                  lang={l.code}
                  onClick={() => {
                    setLocale(l.code);
                    setOpen(false);
                  }}
                  className={cn(
                    "w-full flex items-center gap-3 px-4 py-2.5 text-[13px] transition-colors",
                    isActive
                      ? "bg-(--green-pale)/40 text-(--green-deep) font-semibold"
                      : "text-(--text-body) hover:bg-(--cream) hover:text-(--green-deep)",
                  )}
                >
                  <span className="text-[18px] shrink-0">{l.flag}</span>
                  <span className="flex-1 text-left">
                    {l.label}
                    <span className="block text-[10px] text-(--text-muted) font-normal">
                      {l.english}
                    </span>
                  </span>
                  {isActive && (
                    <Check size={13} className="text-(--green-mid) shrink-0" />
                  )}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
