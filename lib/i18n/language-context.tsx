"use client";

import * as React from "react";
import { Language, translations, TranslationKey } from "./translations";

export interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  t: (key: TranslationKey) => string;
  isHydrated: boolean;
}

const LanguageContext = React.createContext<LanguageContextType | undefined>(
  undefined
);

const LANGUAGE_STORAGE_KEY = "tif_language";

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = React.useState<Language>("th");
  const [isHydrated, setIsHydrated] = React.useState(false);

  // Sync with localStorage safely after initial mount
  React.useEffect(() => {
    try {
      if (typeof window !== "undefined") {
        const savedLang = localStorage.getItem(LANGUAGE_STORAGE_KEY) as Language;
        if (savedLang === "th" || savedLang === "en") {
          setLanguageState(savedLang);
        }
      }
    } catch (error) {
      console.warn("Failed to load language from localStorage:", error);
    } finally {
      setIsHydrated(true);
    }
  }, []);

  // Memoized setLanguage action
  const setLanguage = React.useCallback((lang: Language) => {
    setLanguageState(lang);
    try {
      if (typeof window !== "undefined") {
        localStorage.setItem(LANGUAGE_STORAGE_KEY, lang);
      }
    } catch (error) {
      console.warn("Failed to save language to localStorage:", error);
    }
  }, []);

  // Memoized toggleLanguage action
  const toggleLanguage = React.useCallback(() => {
    setLanguageState((prev) => {
      const nextLang: Language = prev === "th" ? "en" : "th";
      try {
        if (typeof window !== "undefined") {
          localStorage.setItem(LANGUAGE_STORAGE_KEY, nextLang);
        }
      } catch (error) {
        console.warn("Failed to save language to localStorage:", error);
      }
      return nextLang;
    });
  }, []);

  // Memoized translation lookup function
  const t = React.useCallback(
    (key: TranslationKey): string => {
      return translations[language]?.[key] || translations.th[key] || key;
    },
    [language]
  );

  // Memoized context value according to Context7 best practices
  const value = React.useMemo<LanguageContextType>(
    () => ({
      language,
      setLanguage,
      toggleLanguage,
      t,
      isHydrated,
    }),
    [language, setLanguage, toggleLanguage, t, isHydrated]
  );

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage(): LanguageContextType {
  const context = React.useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
