import en from '@/translations/en.json';
import nl from '@/translations/nl.json';
import fr from '@/translations/fr.json';
import { Translations } from '@/types/translations';

export type Language = 'en' | 'nl' | 'fr';

const translations: Record<Language, Translations> = {
  en,
  nl,
  fr
};

export function getTranslations(language: Language): Translations {
  return translations[language];
}

export function isValidLanguage(language: string): language is Language {
  return ['en', 'nl', 'fr'].includes(language);
}

export const defaultLanguage: Language = 'nl';
