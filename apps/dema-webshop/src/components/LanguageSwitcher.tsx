'use client';

import { useState } from 'react';
import { useLocale } from '@/contexts/LocaleContext';

const LANGUAGE_NAMES = {
  nl: 'Nederlands',
  en: 'English',
  fr: 'Français',
};

const LANGUAGE_FLAGS = {
  nl: '🇳🇱',
  en: '🇬🇧',
  fr: '🇫🇷',
};

export default function LanguageSwitcher() {
  const { locale, setLocale } = useLocale();
  const [isOpen, setIsOpen] = useState(false);

  const languages: Array<'nl' | 'en' | 'fr'> = ['nl', 'en', 'fr'];

  return (
    <div className="relative">
      {/* Current Language Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 rounded-md bg-white border border-gray-300 hover:bg-gray-50 transition-colors"
        aria-label="Change language"
      >
        <span className="text-xl">{LANGUAGE_FLAGS[locale]}</span>
        <span className="hidden sm:inline font-medium">{LANGUAGE_NAMES[locale]}</span>
        <svg
          className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Menu */}
          <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 z-20">
            <div className="py-1">
              {languages.map((lang) => (
                <button
                  key={lang}
                  onClick={() => {
                    setLocale(lang);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-2 text-left hover:bg-gray-100 transition-colors ${
                    locale === lang ? 'bg-blue-50 text-blue-600' : 'text-gray-700'
                  }`}
                >
                  <span className="text-xl">{LANGUAGE_FLAGS[lang]}</span>
                  <span className="font-medium">{LANGUAGE_NAMES[lang]}</span>
                  {locale === lang && (
                    <svg
                      className="w-5 h-5 ml-auto text-blue-600"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
