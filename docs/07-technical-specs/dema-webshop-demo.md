# DEMA Webshop Demo - Technical Prototype

## Overview

The DEMA Webshop project serves as the **technical foundation** for the unified industrial platform. It demonstrates key capabilities that will be extended to support all 5 companies.

---

## Project Location

```
c:\Users\nicol\Projects\dema-webshop\
```

**Live Demo:** Deployed on Vercel (check deployment status)

---

## Current Capabilities

### ✅ Implemented Features

| Feature | Status | Description |
|---------|--------|-------------|
| **Product Catalog** | ✅ Complete | 1,177 product groups, 50,000+ variants |
| **Multi-language** | ✅ Complete | Dutch, English, French |
| **Product Search** | ✅ Complete | Full-text search with fuzzy matching |
| **Category Navigation** | ✅ Complete | Hierarchical categories |
| **AI Chatbot** | ✅ Complete | Product assistant with NLP |
| **Quote Request** | ✅ Complete | Add to quote basket |
| **Responsive Design** | ✅ Complete | Mobile-friendly |
| **Property Display** | ✅ Complete | Technical specs with icons |

### 🔄 In Progress / Planned

| Feature | Status | Notes |
|---------|--------|-------|
| Customer Accounts | Planned | Authentication system |
| Order Management | Planned | Full checkout flow |
| ERP Integration | Planned | Backend sync |
| Multi-company Support | Planned | Extend for group |

---

## Technology Stack

### Frontend
- **Framework:** Next.js 14 (React)
- **Styling:** Tailwind CSS
- **UI Components:** shadcn/ui
- **Icons:** Lucide React
- **State Management:** Zustand

### Backend
- **API:** Next.js API Routes
- **AI:** OpenAI GPT-4
- **Database:** JSON files (to be migrated to PostgreSQL)
- **Hosting:** Vercel

### Data Pipeline
- **PDF Extraction:** Python scripts
- **Product Grouping:** Node.js scripts
- **Image Processing:** Automated from PDFs

---

## Key Components

### AI Chatbot (`src/components/chat/ProductAssistant.tsx`)

The chatbot provides:
- Natural language product search
- Multi-language responses (NL/EN/FR)
- Product recommendations based on use case
- Industry-specific advice
- Quote assistance

**Knowledge Base:** `src/config/productKnowledgeBase.ts`
- Product term dictionary
- Use case patterns
- Industry profiles
- Quick responses

### Product Display (`src/components/ProductGroupCard.tsx`)

Features:
- Product images from PDF extraction
- Technical property badges with icons
- Variant selection
- Add to quote functionality
- Price display (where available)

### Property Icons (`src/config/propertyIcons.ts`)

Unified property display system:
- 50+ property type mappings
- Category-based coloring
- Icon selection based on keywords
- Supports all product types

---

## Data Structure

### Product Group Schema

```typescript
interface ProductGroup {
  group_id: string;
  name: string;
  series_id: string;
  series_name: string;
  catalog: string;
  brand: string;
  category: string;
  media: {
    images: string[];
    pdfs: string[];
  };
  variants: ProductVariant[];
}

interface ProductVariant {
  sku: string;
  label: string;
  page: number;
  properties: Record<string, any>;
  attributes: Record<string, any>;
}
```

### Catalog Coverage

| Catalog | Products | Groups | Status |
|---------|----------|--------|--------|
| Makita | 1,100+ | 94 | ✅ |
| Bronpompen | 200+ | 45 | ✅ |
| Dompelpompen | 150+ | 38 | ✅ |
| RVS Fittingen | 500+ | 120 | ✅ |
| PE Buizen | 300+ | 65 | ✅ |
| Rubber Slangen | 400+ | 85 | ✅ |
| ... | ... | ... | ✅ |
| **Total** | **13,000+** | **1,177** | ✅ |

---

## Extension Plan for Group Platform

### Phase 1: Multi-Company Support

```typescript
// Current: Single company
const products = await loadProducts('dema');

// Extended: Multi-company
const products = await loadProducts(['dema', 'fluxer', 'beltz247']);

// With company filter
interface ProductGroup {
  // ... existing fields
  source_company: 'dema' | 'fluxer' | 'beltz247' | 'devisschere' | 'accu';
}
```

### Phase 2: Unified Category Hierarchy

```typescript
// Merge categories from all companies
const unifiedCategories = {
  'pumps': {
    companies: ['dema'],
    subcategories: ['submersible', 'centrifugal', 'well']
  },
  'valves': {
    companies: ['fluxer', 'dema'],
    subcategories: ['ball', 'gate', 'butterfly', 'control']
  },
  'conveyors': {
    companies: ['beltz247'],
    subcategories: ['food-grade', 'industrial']
  }
};
```

### Phase 3: Customer Accounts

```typescript
interface Customer {
  id: string;
  company_name: string;
  vat_number: string;
  pricing_tier: string;
  source_company: string; // Original relationship
  addresses: Address[];
  users: User[];
}
```

---

## Running the Demo

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

```bash
cd c:\Users\nicol\Projects\dema-webshop
npm install
```

### Development Server

```bash
npm run dev
```

Access at: http://localhost:3000

### Key Pages

| Page | URL | Description |
|------|-----|-------------|
| Home | `/` | Landing page |
| Products | `/products` | Full catalog |
| Makita | `/makita` | Brand page |
| Catalog | `/catalog/[id]` | Catalog view |

---

## Deployment

### Current Setup
- **Platform:** Vercel
- **Domain:** Auto-generated Vercel URL
- **CI/CD:** GitHub push triggers deploy

### Deployment Commands

```bash
# Push to deploy
git push origin main

# Check status
vercel --prod
```

---

## Next Steps for Group Platform

1. **Fork/extend DEMA webshop codebase**
2. **Add multi-company data loading**
3. **Implement customer authentication**
4. **Integrate ERP for inventory/pricing**
5. **Add checkout flow**
6. **Deploy as unified platform**

---

## Contact

For technical questions about the DEMA webshop prototype:
- Repository: `c:\Users\nicol\Projects\dema-webshop`
- See README.md in project root

---

*Document Version: 1.0*
*Date: December 2024*
