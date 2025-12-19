# AI Product Assistant (Chatbot)

## Overview

The DEMA webshop includes an AI-powered product assistant that helps customers find products using natural language queries in Dutch, English, and French.

## Features

- **Natural language search** - "I need a pump for my garden"
- **Multilingual** - NL, EN, FR support
- **Product recommendations** - Based on use case
- **Technical advice** - Specifications guidance
- **Quote assistance** - Add products to quote

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    ProductAssistant.tsx                      │
│                    (Chat UI Component)                       │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│              /api/chat/product-assistant                     │
│                    (API Route)                               │
└─────────────────────────────────────────────────────────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        ▼                     ▼                     ▼
┌───────────────┐   ┌───────────────┐   ┌───────────────┐
│  OpenAI API   │   │  Knowledge    │   │   Product     │
│   (GPT-4)     │   │    Base       │   │    Data       │
└───────────────┘   └───────────────┘   └───────────────┘
```

## Components

### ProductAssistant (`src/components/chat/ProductAssistant.tsx`)

Main chat interface component:

```tsx
<ProductAssistant language="nl" />
```

Props:
- `language`: 'nl' | 'en' | 'fr' - UI language

Features:
- Floating chat button
- Expandable chat window
- Message history
- Quick question suggestions
- Product cards in responses

### API Route (`src/app/api/chat/product-assistant/route.ts`)

Handles chat requests:

1. **Language detection** - Detects message language
2. **Context extraction** - Identifies product terms, use cases
3. **Product search** - Finds relevant products
4. **Response generation** - GPT-4 or rule-based fallback

## Knowledge Base

### Location
`src/config/productKnowledgeBase.ts`

### Components

#### Product Term Dictionary
Maps terms to catalog IDs:

```typescript
export const PRODUCT_TERM_DICTIONARY = {
  pump: {
    nl: ['pomp', 'pompen', 'bronpomp'],
    en: ['pump', 'pumps', 'well pump'],
    fr: ['pompe', 'pompes'],
    catalogs: ['bronpompen', 'dompelpompen', 'centrifugaalpompen']
  },
  // ...
}
```

#### Use Case Patterns
Maps scenarios to product recommendations:

```typescript
export const USE_CASE_PATTERNS = {
  garden_irrigation: {
    keywords: ['tuin', 'garden', 'jardin', 'besproeien'],
    products: ['bronpompen', 'tuinslangen', 'sproeiers'],
    response: {
      nl: 'Voor tuinberegening raad ik aan...',
      en: 'For garden irrigation I recommend...',
      fr: 'Pour l\'irrigation du jardin...'
    }
  },
  // ...
}
```

#### Quick Responses
Pre-defined responses:

```typescript
export const QUICK_RESPONSES = {
  greeting: {
    nl: 'Hallo! Ik ben de DEMA Product Assistent...',
    en: 'Hello! I am the DEMA Product Assistant...',
    fr: 'Bonjour! Je suis l\'Assistant Produits DEMA...'
  },
  // ...
}
```

## Language Detection

```typescript
function detectLanguage(message: string): 'nl' | 'en' | 'fr' {
  const frenchWords = ['bonjour', 'pompe', 'cherche', 'besoin'];
  const dutchWords = ['hallo', 'pomp', 'zoek', 'nodig'];
  const englishWords = ['hello', 'pump', 'looking', 'need'];
  
  // Count matches and return dominant language
}
```

## Response Flow

1. **User sends message**
2. **Detect language** from message content
3. **Extract context** (products, use case, specs)
4. **Search products** in relevant catalogs
5. **Generate response**:
   - If OpenAI available → GPT-4 response
   - Else → Rule-based response
6. **Format with product cards**
7. **Return to UI**

## Configuration

### Environment Variables

```env
OPENAI_API_KEY=sk-xxx  # Required for AI responses
```

### Fallback Behavior

Without OpenAI key:
- Uses rule-based responses
- Still searches products
- Returns structured results

## Customization

### Adding New Product Terms

Edit `productKnowledgeBase.ts`:

```typescript
export const PRODUCT_TERM_DICTIONARY = {
  // Add new term
  newProduct: {
    nl: ['dutch terms'],
    en: ['english terms'],
    fr: ['french terms'],
    catalogs: ['relevant_catalog_ids']
  }
}
```

### Adding Use Cases

```typescript
export const USE_CASE_PATTERNS = {
  new_use_case: {
    keywords: ['trigger', 'words'],
    products: ['catalog1', 'catalog2'],
    response: {
      nl: 'Dutch response...',
      en: 'English response...',
      fr: 'French response...'
    }
  }
}
```

## UI Translations

Located in `ProductAssistant.tsx`:

```typescript
const translations = {
  nl: {
    title: 'Product Assistent',
    placeholder: 'Stel een vraag over onze producten...',
    // ...
  },
  en: { /* ... */ },
  fr: { /* ... */ }
}
```

## Testing

```bash
# Test chatbot API
curl -X POST http://localhost:3000/api/chat/product-assistant \
  -H "Content-Type: application/json" \
  -d '{"message": "I need a pump for my garden", "language": "en"}'
```

---

*Last Updated: December 2024*
