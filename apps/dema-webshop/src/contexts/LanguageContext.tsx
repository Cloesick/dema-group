'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'nl' | 'en' | 'fr';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (translations: { nl?: string; en?: string; fr?: string }) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>('nl'); // Default Dutch

  // Load language from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('language') as Language;
    if (saved && ['nl', 'en', 'fr'].includes(saved)) {
      setLanguageState(saved);
    }
  }, []);

  // Save language to localStorage when changed
  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('language', lang);
  };

  // Translation helper
  const t = (translations: { nl?: string; en?: string; fr?: string }) => {
    return translations[language] || translations.nl || translations.en || Object.values(translations)[0] || '';
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}

// Language names for display
export const LANGUAGE_NAMES = {
  nl: 'Nederlands',
  en: 'English',
  fr: 'Français',
};

// Language flags (emoji)
export const LANGUAGE_FLAGS = {
  nl: '🇳🇱',
  en: '🇬🇧',
  fr: '🇫🇷',
};
