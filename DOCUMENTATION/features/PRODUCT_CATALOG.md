# Product Catalog System

## Overview

The DEMA webshop uses a JSON-based product catalog system with 13,000+ products organized into 1,177 product groups across 26+ catalogs.

## Data Structure

### Product Group Schema

```typescript
interface ProductGroup {
  group_id: string;           // Unique identifier
  name: string;               // Product name
  series_id: string;          // Series identifier
  series_name: string;        // Series name
  catalog: string;            // Source catalog
  brand: string;              // Brand name
  category: string;           // Product category
  media: {
    images: string[];         // Image URLs
    pdfs: string[];           // PDF URLs
  };
  variants: ProductVariant[];
}

interface ProductVariant {
  sku: string;                // Stock keeping unit
  label: string;              // Display label
  page: number;               // PDF page reference
  properties: Record<string, any>;  // Technical specs
  attributes: Record<string, any>;  // Additional attributes
}
```

### File Locations

```
public/data/
├── products_all_grouped.json     # All products combined
├── bronpompen_grouped.json       # Well pumps
├── dompelpompen_grouped.json     # Submersible pumps
├── makita_grouped.json           # Makita tools
├── rvs_fittingen_grouped.json    # Stainless fittings
└── ... (26+ catalog files)
```

## Catalogs

| Catalog | Products | Category |
|---------|----------|----------|
| Makita | 1,100+ | Power Tools |
| Bronpompen | 200+ | Well Pumps |
| Dompelpompen | 150+ | Submersible Pumps |
| Centrifugaalpompen | 100+ | Centrifugal Pumps |
| RVS Fittingen | 500+ | Stainless Fittings |
| PE Buizen | 300+ | PE Pipes |
| PVC Buizen | 250+ | PVC Pipes |
| Rubber Slangen | 400+ | Rubber Hoses |
| Bauer Koppelingen | 150+ | Bauer Couplings |
| Airpress | 300+ | Compressors |
| ... | ... | ... |

## Property Display System

### Property Icons (`src/config/propertyIcons.ts`)

Maps property keys to icons and colors:

```typescript
const PROPERTY_ICON_MAPPINGS = {
  FLOW: {
    keywords: ['debiet', 'flow', 'capaciteit', 'l/min', 'm³/h'],
    icon: '💧',
    category: 'flow'
  },
  PRESSURE: {
    keywords: ['druk', 'pressure', 'bar', 'psi'],
    icon: '🔵',
    category: 'pressure'
  },
  // ... 50+ mappings
}
```

### Category Colors

```typescript
const CATEGORY_COLORS = {
  flow: { bg: 'bg-blue-100', text: 'text-blue-700' },
  pressure: { bg: 'bg-cyan-100', text: 'text-cyan-700' },
  power: { bg: 'bg-yellow-100', text: 'text-yellow-700' },
  dimensions: { bg: 'bg-purple-100', text: 'text-purple-700' },
  // ...
}
```

## Components

### ProductGroupCard

Main product display component:

```tsx
<ProductGroupCard
  group={productGroup}
  onAddToQuote={handleAddToQuote}
/>
```

Features:
- Product image display
- Property badges
- Variant selection
- Add to quote button

### PropertyBadges

Displays technical specifications:

```tsx
<PropertyBadges
  properties={variant.properties}
  maxDisplay={6}
  showLabels={false}
/>
```

## Data Pipeline

### Generation Script

```bash
node scripts/generate_grouped_catalogs.js
```

Process:
1. Read raw product JSON from PDFs
2. Group by series/product family
3. Extract properties
4. Generate images list
5. Output grouped JSON

### Property Extraction

```javascript
const propertyFields = [
  'type', 'materiaal', 'diameter', 'lengte',
  'aansluiting', 'druk', 'debiet', 'vermogen',
  // ... 50+ fields
];
```

## Search & Filtering

### Client-Side Search

Products are filtered client-side using:
- Text matching on name, SKU, brand
- Category filtering
- Property filtering

### AI-Powered Search

The chatbot uses the product knowledge base:
- Natural language queries
- Multilingual (NL/EN/FR)
- Use-case recommendations

## Adding New Catalogs

1. **Add PDF** to `documents/Product_pdfs/`
2. **Extract data** using Python script:
   ```bash
   python scripts/analyze_product_pdfs.py
   ```
3. **Generate grouped JSON**:
   ```bash
   node scripts/generate_grouped_catalogs.js
   ```
4. **Add catalog page** in `src/app/catalog/[name]/`
5. **Update knowledge base** in `src/config/productKnowledgeBase.ts`

---

*Last Updated: December 2024*
