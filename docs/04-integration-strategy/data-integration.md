# Data Integration Strategy

## Overview

Unifying product, customer, and operational data from 5 companies into a single coherent platform.

---

## Current State Assessment

### Data Sources by Company

| Company | Primary Systems | Data Format | Quality |
|---------|----------------|-------------|---------|
| DEMA | ERP + Excel + PDFs | Mixed | Medium |
| Fluxer | ERP + Website | Structured | Good |
| Beltz247 | Excel + Manual | Unstructured | Low |
| De Visschere | Manual/Paper | Minimal | Low |
| Accu Components | Modern ERP | Structured | High |

### Data Volume Estimates

| Data Type | DEMA | Fluxer | Beltz247 | DVT | Accu | Total |
|-----------|------|--------|----------|-----|------|-------|
| Products (SKUs) | 15,000 | 8,000 | 500 | 200 | 500,000 | 523,700 |
| Customers | 2,000 | 800 | 300 | 150 | 5,000 | 8,250 |
| Orders/year | 10,000 | 3,000 | 500 | 200 | 50,000 | 63,700 |
| Documents | 5,000 | 2,000 | 200 | 50 | 10,000 | 17,250 |

---

## Data Unification Strategy

### Product Data

#### Unified Product Schema

```
┌─────────────────────────────────────────────────────────────┐
│                 UNIFIED PRODUCT DATA MODEL                   │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌─────────────────────────────────────────────────────┐   │
│  │                 PRODUCT GROUP                        │   │
│  │  • Unified ID (UUID)                                │   │
│  │  • Name (NL/EN/FR)                                  │   │
│  │  • Description (NL/EN/FR)                           │   │
│  │  • Category (unified hierarchy)                     │   │
│  │  • Brand                                            │   │
│  │  • Source company                                   │   │
│  │  • Media (images, PDFs)                             │   │
│  └─────────────────────────────────────────────────────┘   │
│                           │                                  │
│                           │ 1:N                              │
│                           ▼                                  │
│  ┌─────────────────────────────────────────────────────┐   │
│  │                    VARIANT                           │   │
│  │  • SKU (original + unified)                         │   │
│  │  • Properties (normalized)                          │   │
│  │  • Price (excl/incl BTW)                           │   │
│  │  • Stock (per warehouse)                            │   │
│  │  • Weight/dimensions                                │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

#### Property Normalization

| Original Field | Normalized Field | Unit | Type |
|----------------|------------------|------|------|
| diameter, ø, dia | diameter_mm | mm | number |
| lengte, length, longueur | length_mm | mm | number |
| druk, pressure, pression | pressure_bar | bar | number |
| gewicht, weight, poids | weight_kg | kg | number |
| spanning, voltage | voltage_v | V | number |
| vermogen, power, puissance | power_w | W | number |
| debiet, flow, débit | flow_lpm | L/min | number |

#### Category Mapping

```
DEMA Categories          →  Unified Categories
─────────────────────────────────────────────────
Pompen                   →  Pumps & Accessories
Kunststof leidingen      →  Piping > Plastic
Metalen leidingen        →  Piping > Metal
Slangen & koppelingen    →  Hoses & Couplings
Beregening               →  Irrigation
Gereedschap              →  Power Tools

Fluxer Categories        →  Unified Categories
─────────────────────────────────────────────────
Afsluiters               →  Valves > Ball/Gate/etc
Appendages               →  Valves > Accessories
Meet- & regeltechniek    →  Instrumentation
Aandrijvingen            →  Actuators

Beltz247 Categories      →  Unified Categories
─────────────────────────────────────────────────
Transportbanden          →  Conveyor Systems
FDA/HACCP banden         →  Conveyor Systems > Food Grade

Accu Categories          →  Unified Categories
─────────────────────────────────────────────────
Screws                   →  Precision Components > Fasteners
Standoffs                →  Precision Components > Standoffs
Washers                  →  Precision Components > Washers
```

---

### Customer Data

#### Customer Deduplication Strategy

```
┌─────────────────────────────────────────────────────────────┐
│              CUSTOMER DEDUPLICATION PROCESS                  │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Step 1: Extract all customers from 5 systems               │
│          ↓                                                   │
│  Step 2: Normalize company names, addresses                 │
│          ↓                                                   │
│  Step 3: Match on VAT number (primary key)                  │
│          ↓                                                   │
│  Step 4: Fuzzy match on name + address (secondary)          │
│          ↓                                                   │
│  Step 5: Manual review of uncertain matches                 │
│          ↓                                                   │
│  Step 6: Create unified customer records                    │
│          ↓                                                   │
│  Step 7: Link historical data to unified records            │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

#### Expected Deduplication Results

| Metric | Before | After | Reduction |
|--------|--------|-------|-----------|
| Total customer records | 8,250 | ~5,500 | 33% |
| Duplicate rate | ~33% | 0% | - |
| Data completeness | 60% | 90% | +30% |

---

### Data Migration Process

#### Phase 1: DEMA (Foundation)

Already partially complete via dema-webshop project:
- [x] Product catalog extracted from PDFs
- [x] 1,177 product groups created
- [x] AI chatbot knowledge base built
- [ ] Customer data migration
- [ ] Order history migration

#### Phase 2: Fluxer + Beltz247

| Task | Effort | Timeline |
|------|--------|----------|
| Export product data | 2 days | Week 1 |
| Map to unified schema | 3 days | Week 1-2 |
| Clean and normalize | 5 days | Week 2-3 |
| Import to platform | 2 days | Week 3 |
| Validate and test | 3 days | Week 3-4 |

#### Phase 3: De Visschere Technics

| Task | Effort | Timeline |
|------|--------|----------|
| Catalog products manually | 5 days | Week 4-5 |
| Create product entries | 3 days | Week 5 |
| Add media (photos) | 2 days | Week 5-6 |

#### Phase 4: Accu Components

| Task | Effort | Timeline |
|------|--------|----------|
| API integration assessment | 3 days | Week 6 |
| Selective import (key products) | 5 days | Week 6-7 |
| Category mapping | 2 days | Week 7 |

---

## Data Quality Framework

### Quality Dimensions

| Dimension | Definition | Target | Measurement |
|-----------|------------|--------|-------------|
| **Completeness** | Required fields populated | 95% | Automated checks |
| **Accuracy** | Data matches reality | 98% | Sampling audits |
| **Consistency** | Same format across records | 100% | Validation rules |
| **Timeliness** | Data is current | <24h lag | Sync monitoring |
| **Uniqueness** | No duplicates | 100% | Dedup process |

### Data Validation Rules

```typescript
// Example validation rules
const productValidation = {
  sku: {
    required: true,
    unique: true,
    pattern: /^[A-Z0-9-]+$/
  },
  name: {
    required: true,
    minLength: 3,
    maxLength: 200
  },
  price_excl_btw: {
    required: true,
    type: 'number',
    min: 0
  },
  category_id: {
    required: true,
    exists: 'categories.id'
  },
  weight_kg: {
    type: 'number',
    min: 0
  }
};
```

### Data Stewardship

| Role | Responsibility | Company |
|------|----------------|---------|
| Data Owner (Products) | Final authority on product data | DEMA |
| Data Owner (Valves) | Valve category accuracy | Fluxer |
| Data Owner (Conveyors) | Conveyor data accuracy | Beltz247 |
| Data Steward | Day-to-day data quality | Shared role |
| Data Engineer | Technical implementation | IT team |

---

## Integration Patterns

### Real-time Sync (Orders, Stock)

```
┌─────────────┐         ┌─────────────┐         ┌─────────────┐
│  Platform   │────────►│   Message   │────────►│    ERP      │
│  (Order)    │  Event  │   Queue     │  Process│  (Update)   │
└─────────────┘         └─────────────┘         └─────────────┘
                               │
                               │ Acknowledgment
                               ▼
                        ┌─────────────┐
                        │   Status    │
                        │   Update    │
                        └─────────────┘
```

### Batch Sync (Products, Prices)

```
┌─────────────┐         ┌─────────────┐         ┌─────────────┐
│    ERP      │────────►│   ETL Job   │────────►│  Platform   │
│  (Source)   │  Export │  (Nightly)  │  Import │  (Target)   │
└─────────────┘         └─────────────┘         └─────────────┘
                               │
                               │ Logging
                               ▼
                        ┌─────────────┐
                        │   Audit     │
                        │   Trail     │
                        └─────────────┘
```

---

## Master Data Management

### Golden Record Concept

For each entity (product, customer), maintain a "golden record" that is:
- The single source of truth
- Enriched from multiple sources
- Versioned for audit trail
- Protected from unauthorized changes

### Data Governance Policies

| Policy | Description |
|--------|-------------|
| **Ownership** | Each data domain has a designated owner |
| **Access** | Role-based access to sensitive data |
| **Retention** | 7 years for financial, 3 years for operational |
| **Archival** | Inactive records archived after 2 years |
| **Privacy** | GDPR compliance for personal data |

---

## Success Metrics

### Data Integration KPIs

| KPI | Target | Measurement |
|-----|--------|-------------|
| Product data completeness | 95% | Weekly report |
| Customer match rate | 90% | Post-migration audit |
| Data sync latency | <5 min | Real-time monitoring |
| Data error rate | <1% | Error log analysis |
| User data quality score | 4.5/5 | User feedback |

---

*Document Version: 1.0*
*Date: December 2024*
