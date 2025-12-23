'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import type { Translations } from '@/types/translations'
import en from '@/locales/en.json'
import nl from '@/locales/nl.json'
import fr from '@/locales/fr.json'

export type { Translations } from '@/types/translations'

export type Language = 'en' | 'nl' | 'fr'

interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: Translations
}

const translations: Record<Language, Translations> = {
  en: en as unknown as Translations,
  nl: nl as unknown as Translations,
  fr: fr as unknown as Translations
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>('nl')

  useEffect(() => {
    const stored = localStorage.getItem('dema-language') as Language
    if (stored && translations[stored]) {
      setLanguageState(stored)
    }
  }, [])

  const setLanguage = (lang: Language) => {
    setLanguageState(lang)
    localStorage.setItem('dema-language', lang)
  }

  const t = translations[language]

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return context
}

export const languageNames: Record<Language, string> = {
  en: 'English',
  nl: 'Nederlands',
  fr: 'Français',
}

export const languageFlags: Record<Language, string> = {
  en: '🇬🇧',
  nl: '🇳🇱',
  fr: '🇫🇷',
}
