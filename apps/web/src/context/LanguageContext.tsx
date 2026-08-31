"use client";

import {
  createContext,
  useContext,
  useEffect,
  type ReactNode,
} from "react";
import {
  getDocumentLang,
  normalizeLang,
  translate,
  type Lang,
  type TranslationKey,
} from "@/lib/i18n";

interface LanguageContextValue {
  lang: Lang;
  t: (key: TranslationKey) => string;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({
  language,
  children,
}: {
  language?: string;
  children: ReactNode;
}) {
  const lang = normalizeLang(language);

  useEffect(() => {
    document.documentElement.lang = getDocumentLang(lang);
  }, [lang]);

  const value: LanguageContextValue = {
    lang,
    t: (key) => translate(lang, key),
  };

  return (
    <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
  );
}

export function useLanguage(): LanguageContextValue {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within LanguageProvider");
  return ctx;
}
