'use client'

import { useLanguage, Language, languageNames, languageFlags } from '@/contexts/LanguageContext'
import { useState } from 'react'
import { Globe, ChevronDown } from 'lucide-react'

export function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage()
  const [isOpen, setIsOpen] = useState(false)

  const languages: Language[] = ['nl', 'en', 'fr']

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/10 transition"
      >
        <Globe size={18} />
        <span className="text-sm font-medium">{languageFlags[language]} {language.toUpperCase()}</span>
        <ChevronDown size={14} className={`transition ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)} 
          />
          <div className="absolute right-0 top-full mt-2 bg-white rounded-lg shadow-lg border z-50 min-w-[150px] overflow-hidden">
            {languages.map((lang) => (
              <button
                key={lang}
                onClick={() => {
                  setLanguage(lang)
                  setIsOpen(false)
                }}
                className={`w-full px-4 py-2 text-left flex items-center gap-3 hover:bg-slate-50 transition ${
                  language === lang ? 'bg-slate-100 font-medium' : ''
                }`}
              >
                <span>{languageFlags[lang]}</span>
                <span className="text-slate-700">{languageNames[lang]}</span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
