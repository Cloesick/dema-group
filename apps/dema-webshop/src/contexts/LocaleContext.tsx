"use client";

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import en from "@/locales/en.json";
import nl from "@/locales/nl.json";
import fr from "@/locales/fr.json";

type Locale = "en" | "nl" | "fr";

type Messages = Record<string, string>;

const MESSAGES: Record<Locale, Messages> = { en, nl, fr } as const;

function getCookie(name: string): string | undefined {
  if (typeof document === "undefined") return undefined;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(";").shift();
}

function setCookie(name: string, value: string, days = 365) {
  if (typeof document === "undefined") return;
  const date = new Date();
  date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
  const expires = `expires=${date.toUTCString()}`;
  document.cookie = `${name}=${value}; ${expires}; path=/`;
}

export type LocaleContextValue = {
  locale: Locale;
  setLocale: (l: Locale) => void;
  t: (key: string) => string;
  translations: Messages;
};

const LocaleContext = createContext<LocaleContextValue | undefined>(undefined);

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("en");

  useEffect(() => {
    const fromCookie = (getCookie("locale") as Locale | undefined);
    if (fromCookie && ["en", "nl", "fr"].includes(fromCookie)) {
      setLocaleState(fromCookie);
    }
  }, []);

  const setLocale = useCallback((l: Locale) => {
    setLocaleState(l);
    setCookie("locale", l);
  }, []);

  const messages = useMemo(() => MESSAGES[locale] ?? MESSAGES.en, [locale]);

  const warnedKeysRef = React.useRef<Set<string>>(new Set());

  const t = useCallback((key: string) => {
    const val = messages[key];
    if (val === undefined) {
      if (!warnedKeysRef.current.has(key)) {
        console.warn(`[i18n] Missing translation for key: ${key}`);
        warnedKeysRef.current.add(key);
      }
      return key;
    }
    return val;
  }, [messages]);

  // Keep <html lang> in sync on the client during SPA navigation
  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.lang = locale;
    }
  }, [locale]);

  const value = useMemo(() => ({ locale, setLocale, t, translations: messages }), [locale, setLocale, t, messages]);

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useLocale() {
  const ctx = useContext(LocaleContext);
  if (!ctx) throw new Error("useLocale must be used within a LocaleProvider");
  return ctx;
}
