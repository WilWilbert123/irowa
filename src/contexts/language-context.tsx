// src/contexts/language-context.tsx
"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react";
import { Language, TRANSLATIONS, TranslationDict } from "@/lib/i18n/translations";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  t: TranslationDict;
  isTagalog: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const STORAGE_KEY = "irowa_user_language";

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  // Default is strictly Tagalog ("tl") as requested
  const [language, setLanguageState] = useState<Language>("tl");

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY) as Language | null;
      if (stored === "tl" || stored === "en") {
        setLanguageState(stored);
      }
    } catch {
      // Storage access error fallback
    }
  }, []);

  const setLanguage = useCallback((newLang: Language) => {
    setLanguageState(newLang);
    try {
      localStorage.setItem(STORAGE_KEY, newLang);
    } catch {
      // Ignore
    }
  }, []);

  const toggleLanguage = useCallback(() => {
    setLanguageState((prev) => {
      const next = prev === "tl" ? "en" : "tl";
      try {
        localStorage.setItem(STORAGE_KEY, next);
      } catch {
        // Ignore
      }
      return next;
    });
  }, []);

  const value = useMemo(
    () => ({
      language,
      setLanguage,
      toggleLanguage,
      t: TRANSLATIONS[language] || TRANSLATIONS["tl"],
      isTagalog: language === "tl",
    }),
    [language, setLanguage, toggleLanguage]
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    // Graceful fallback if rendered outside provider
    return {
      language: "tl" as Language,
      setLanguage: () => {},
      toggleLanguage: () => {},
      t: TRANSLATIONS["tl"],
      isTagalog: true,
    };
  }
  return context;
}
