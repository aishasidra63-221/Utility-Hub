import { createContext, useContext, useState, useCallback, useEffect, useMemo } from "react";
import { type LangCode, RTL_LANGS, translate } from "@/lib/i18n";

const LANG_KEY = "toolhub_lang";

interface LangContextValue {
  lang: LangCode;
  setLang: (l: LangCode) => void;
  t: (key: string) => string;
  isRTL: boolean;
}

const LangContext = createContext<LangContextValue | null>(null);

export function LangProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<LangCode>(() => {
    const saved = localStorage.getItem(LANG_KEY);
    return (saved as LangCode) || "en";
  });

  const setLang = useCallback((l: LangCode) => {
    setLangState(l);
    localStorage.setItem(LANG_KEY, l);
  }, []);

  const isRTL = RTL_LANGS.includes(lang);

  useEffect(() => {
    const el = document.documentElement;
    el.dir = isRTL ? "rtl" : "ltr";
    el.lang = lang;
  }, [lang, isRTL]);

  const t = useCallback((key: string) => translate(lang, key), [lang]);

  const value = useMemo(() => ({ lang, setLang, t, isRTL }), [lang, setLang, t, isRTL]);

  return <LangContext.Provider value={value}>{children}</LangContext.Provider>;
}

export function useLang(): LangContextValue {
  const ctx = useContext(LangContext);
  if (!ctx) throw new Error("useLang must be used within LangProvider");
  return ctx;
}
