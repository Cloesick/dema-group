# Multilingual Support (i18n)

## Overview

The DEMA webshop supports three languages:
- **Dutch (NL)** - Primary
- **English (EN)** - Secondary
- **French (FR)** - Secondary

## Implementation

### Language Context

`src/contexts/LanguageContext.tsx`:

```typescript
type Language = 'nl' | 'en' | 'fr';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}
```

### Usage

```tsx
import { useLanguage } from '@/contexts/LanguageContext';

function MyComponent() {
  const { language, setLanguage, t } = useLanguage();
  
  return (
    <div>
      <p>{t('welcome')}</p>
      <button onClick={() => setLanguage('en')}>EN</button>
    </div>
  );
}
```

## Translation Files

### Location
`src/locales/`

### Structure
```
src/locales/
├── nl.json
├── en.json
└── fr.json
```

### Example

```json
// nl.json
{
  "welcome": "Welkom bij DEMA",
  "products": "Producten",
  "cart": "Winkelwagen",
  "quote": "Offerte aanvragen"
}

// en.json
{
  "welcome": "Welcome to DEMA",
  "products": "Products",
  "cart": "Shopping Cart",
  "quote": "Request Quote"
}

// fr.json
{
  "welcome": "Bienvenue chez DEMA",
  "products": "Produits",
  "cart": "Panier",
  "quote": "Demander un devis"
}
```

## Product Data

Product names and descriptions are stored per language:

```typescript
interface Product {
  name_nl: string;
  name_en?: string;
  name_fr?: string;
  description_nl?: string;
  description_en?: string;
  description_fr?: string;
}
```

## AI Chatbot

The chatbot automatically detects and responds in the user's language:

1. **Detection** - Analyzes message for language indicators
2. **Response** - Uses language-specific templates
3. **UI** - Adapts interface to selected language

See [AI Chatbot](ai-chatbot.md) for details.

## Language Switcher

Located in header navigation:

```tsx
<LanguageSwitcher />
```

Persists selection to localStorage.

## Adding Translations

1. Add key to all locale files:
   ```json
   // nl.json
   { "new_key": "Nederlandse tekst" }
   
   // en.json
   { "new_key": "English text" }
   
   // fr.json
   { "new_key": "Texte français" }
   ```

2. Use in component:
   ```tsx
   const { t } = useLanguage();
   return <span>{t('new_key')}</span>;
   ```

---

*Last Updated: December 2024*
