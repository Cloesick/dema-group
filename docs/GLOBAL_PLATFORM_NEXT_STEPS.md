# Global DEMA Group Platform — Next Steps

## Purpose
This document turns the current strategy documentation and monorepo scaffold into an actionable plan to deliver a unified, multi-company platform for DEMA Group.

## Current Snapshot (from repo)
- DEMA webshop is live in a separate repository and this repo contains the unified platform strategy + scaffolds.
- `apps/portal` exists as the master portal scaffold.
- `apps/api` exists as a dedicated API service concept for inventory, delivery tracking, and ERP/carrier integrations.
- The strategy documentation is marked complete (December 2024), and the next step is execution alignment + platform foundation.

## Guiding Principles
1. Prefer repeatable onboarding over one-off implementations.
2. Standardize data contracts early.
3. Keep operational continuity: each company can onboard incrementally.
4. Measure progress with a single shared status dashboard.

## Key Decisions to Make (Blockers)
These decisions should be made explicitly and recorded (ADR-style).

### 1) Brand & Store Architecture
- Option A: Single group store (one storefront, company divisions)
- Option B: Multi-store/multi-brand storefronts with shared backend

Outputs:
- Decision document
- Customer-facing navigation model

### 2) Customer Identity Model
- Single customer account across all companies
- Separate accounts per company with linking

Outputs:
- Authentication/identity approach
- Customer migration approach

### 3) Commercial Operating Rules
- Invoicing model (per company vs centralized)
- Quote workflow ownership
- Pricing ownership and exception handling

Outputs:
- Commercial rules v1
- Process owner per rule

### 4) SKU and Product Master Model
- SKU uniqueness rule: global SKU vs `(companyId, sku)` with mapping
- Canonical taxonomy and attribute schema

Outputs:
- Product Master Spec v1
- Mapping approach per company

## Workstreams (Execution)

### Workstream A — Governance & Operating Model
Goal: create the group “engine” that can prioritize and execute.

Deliverables:
- Integration steering committee cadence
- RACI for platform, data, and integrations
- Weekly status reporting format

### Workstream B — Shared Platform Spine (Portal + API)
Goal: establish the shared services that every company uses.

Deliverables:
- Multi-company/tenant model (`companyId` everywhere)
- API contracts (`api/v1`) for:
  - products
  - inventory
  - pricing (if in scope)
  - quotes/orders (as decided)
  - delivery/shipments
  - inbound webhooks
- Audit logging for inbound/outbound integrations

### Workstream C — Data Unification (The Hard Part)
Goal: consistent catalog/search across companies.

Deliverables:
- Canonical product schema + category tree
- Mapping tables per company
- Normalization pipeline (import + validation)
- Search readiness spec (fields, synonyms, language)

### Workstream D — Integrations (ERP + Carriers)
Goal: stable, secure integrations with clear SLAs.

Deliverables:
- Signed webhooks standard per company
- One reference ERP integration implemented end-to-end
- Carrier abstraction and tracking ingestion

### Workstream E — Rollout / Onboarding Playbook
Goal: onboard companies without reinventing the approach.

Deliverables:
- Company onboarding checklist
- Definition of done for a new company
- Training + support model

## Recommended Onboarding Sequence
1. DEMA as reference tenant (even if current production webshop remains separate initially)
2. Fluxer as second tenant (strong test of taxonomy + technical attribute differences)
3. Beltz247
4. De Visschere Technics
5. Accu Components

## 30/60/90 Day Roadmap

### 0–30 Days (Foundation)
Outcomes:
- Decisions finalized: brand/store architecture, identity model, SKU/product master model
- API contracts drafted and agreed (v1)
- First “single source of truth” status dashboard created

Deliverables:
- Platform Charter (scope, KPIs, governance)
- Product Master Spec v1 (schema + mapping rules)
- `docs/STATUS.md` created and maintained weekly

### 31–60 Days (Pilot Company End-to-End)
Outcomes:
- One company integrated end-to-end into the shared platform spine

Deliverables:
- Inbound ERP inventory webhook working with signature verification
- Portal can browse unified catalog for the pilot company
- Logging/monitoring baseline

### 61–90 Days (Second Company + Scale Pattern)
Outcomes:
- Second company onboarded using the same approach
- Repeatable playbook exists

Deliverables:
- Fluxer onboarded (taxonomy mapping + import + stock updates)
- Quote flow and multi-language baseline validated (if in scope)
- “How to onboard company N” documented

## Questions to Ask (All Companies + Per Company)

Use both styles below during interviews:
- **Business wording (simple)**: safe for non-IT stakeholders.
- **Implementation wording (technical)**: for IT/ops follow-up.

### Core Questions (Ask Every Company)

#### A) Company Context & Goals
- **Business wording (simple)**
  - What do you hope will get better if we build one group platform?
  - If this works perfectly, what changes for you day-to-day?
  - What is the biggest pain today (too much manual work, wrong stock, slow quotes, too many calls)?
  - What should never change because customers love it?
- **Implementation wording (technical)**
  - What are the top 3 objectives (growth, efficiency, cross-sell, new markets)?
  - Which customer segments matter most?
  - What are the top 5 product categories by revenue and margin?
  - What are the top operational bottlenecks?
  - What does success look like in 6/12/24 months (KPIs)?
- **Subquestions**
  - Which 3 KPIs do you already track weekly?
  - What is currently “slow” (hours, days) and what target do you want?
  - What is the #1 complaint you hear from customers?

#### B) Catalog & Product Data
- **Business wording (simple)**
  - Where do you keep the list of products you sell?
  - If I pick one product, where do I find its name, price, stock, and picture?
  - What information must customers see to choose the right product?
- **Implementation wording (technical)**
  - Where is product master data maintained (ERP, PIM, Excel, supplier feeds)?
  - How many active SKUs are there, and how many are non-stock/order-only?
  - What identifiers exist (internal SKU, supplier part number, EAN/UPC, manufacturer code)?
  - How are variants modeled (size/material/voltage/diameter)?
  - Which attributes are critical for filtering/search?
  - Do you have documents (datasheets/manuals) and how are they linked?
  - Where are product images stored and what is the completeness/quality?
  - What is your category structure and does it match customer behavior?
- **Subquestions**
  - Can you export a full catalog today? In which format (Excel/CSV)? How often?
  - Who is responsible for product data quality?
  - What percentage of products have:
    - a picture
    - a datasheet
    - correct specs
  - What are the top 10 “messy data” examples you already know?

#### C) Pricing & Commercial Rules
- **Business wording (simple)**
  - If two customers ask for the same product, do they always get the same price?
  - When do you say: “I need to make a quote for that”?
  - Who can change prices, and who must approve?
- **Implementation wording (technical)**
  - How is pricing determined (fixed list, discount matrices, customer-specific, project pricing)?
  - Are there multiple price lists by customer type or region?
  - What is the approval flow for special prices/quotes?
  - What are margin rules and exception handling?
  - VAT rules and any special invoicing requirements?
- **Subquestions**
  - Which customers have special pricing? How is it stored?
  - Are prices time-based (promotions, contracts with start/end dates)?

#### D) Customers & Accounts
- **Business wording (simple)**
  - Do your customers have “accounts” today? How do they log in or order?
  - Can one customer have multiple people ordering (buyer, manager, accountant)?
  - Do customers buy from more than one group company today?
- **Implementation wording (technical)**
  - Approximate number of active customers and key accounts.
  - Where is customer master data managed (ERP/CRM) and who owns data quality?
  - Cross-company purchasing today: which customers, what experience?
  - Authentication needs (shared accounts, role-based access, SSO if required).
  - Credit limits, payment terms, credit checks.
- **Subquestions**
  - What fields are mandatory for a customer account (VAT number, delivery addresses, cost centers)?
  - How do you handle new customer onboarding and approval?
  - Are there blocked customers, and how is that enforced?

#### E) Orders, Quotes, and After-Sales
- **Business wording (simple)**
  - What happens from the moment a customer asks for something until it is delivered?
  - When do you need to talk to the customer before you can confirm the order?
  - What problems happen after delivery (returns, wrong items, damage)?
- **Implementation wording (technical)**
  - Quote vs order ratio and typical quote turnaround time.
  - Common reasons quotes are needed (technical validation, pricing approval, delivery promise).
  - Return policy, RMA workflows, warranty rules.
  - Support channels and expected SLAs.
- **Subquestions**
  - What are the top 10 quote “must ask” questions today?
  - What are the most common return reasons and their cost?
  - Do you need partial deliveries/backorders? How is it communicated?

#### F) Inventory & Logistics
- **Business wording (simple)**
  - Where are the products physically located?
  - How do you know if something is in stock right now?
  - If it’s not in stock, how do you know when it can arrive?
- **Implementation wording (technical)**
  - Stock location model (single warehouse, multi-site, drop-ship suppliers).
  - Stock accuracy issues and update frequency.
  - Lead time logic and delivery promise rules.
  - Picking/packing process and constraints.
  - Carriers used and tracking integration availability.
- **Subquestions**
  - What are the top 5 causes of stock mismatch?
  - What is your cut-off time for same-day shipping?
  - Do you ship hazardous/oversized goods with special rules?

#### G) Systems & Integrations
- **Business wording (simple)**
  - What software do you use to run the business every day?
  - If that system is “down” for a day, what breaks first?
  - Who do you call when something is wrong?
- **Implementation wording (technical)**
  - Which ERP is used (version, hosting, customization level)?
  - Integration capabilities (APIs/webhooks/export jobs) and formats (REST/SOAP/CSV/SFTP).
  - Who maintains integrations (internal IT/vendor/partner)?
  - Refresh expectations (real-time vs batch) for stock/prices/orders.
  - Existing e-commerce platform(s) and decommission timeline.
- **Subquestions**
  - What is the current data export schedule?
  - Do you have a test environment/sandbox?
  - Who can approve changes/releases?

#### H) Legal, Compliance, and Security
- **Business wording (simple)**
  - Are there things we are not allowed to show online (prices, suppliers, customer names)?
  - Are there customer data rules we must follow?
- **Implementation wording (technical)**
  - Supplier constraints (pricing visibility, territories).
  - GDPR: where customer data is stored and controller/processor roles.
  - Access control and audit logging needs.
- **Subquestions**
  - Which roles need access (sales, support, warehouse, external partners)?
  - Any contractual obligations to delete data after X time?

#### I) Migration & Change Readiness
- **Business wording (simple)**
  - How big of a change can your team handle this year?
  - When is your busiest season (when we should not change things)?
  - Who will be the “go-to person” in your company for this project?
- **Implementation wording (technical)**
  - Appetite for standardization vs maintaining current processes.
  - Business owners and data stewards.
  - Blackout periods and risk windows.
  - Training needs (sales/support/warehouse).
- **Subquestions**
  - What is the minimum training package you need (1 hour / 1 day / ongoing)?
  - Who must sign off before go-live?
  - What is your fallback plan if launch week goes wrong?

### Deep-Dive Questions (Per Company)

#### DEMA (Reference Tenant)
- **Business wording (simple)**
  - What parts of today’s webshop do customers love and must stay the same?
  - What are the top complaints you hear weekly?
- **Implementation wording (technical)**
  1. Which parts of the current DEMA webshop are considered “must keep” vs “can change”?
  2. What data model assumptions exist today (SKU uniqueness, categories, pricing rules)?
  3. What are the top 10 recurring issues (data, UX, performance, operations)?
  4. What is the plan for coexistence/migration with the current production webshop?
- **Subquestions**
  - Which integrations exist today (ERP, carriers, payments) and where do they fail?
  - What is the current release process and who approves it?

#### Fluxer (Valves / Instrumentation)
- **Business wording (simple)**
  - What details do customers always ask before they buy a valve or instrument?
  - Do customers often need help choosing the correct model?
- **Implementation wording (technical)**
  1. Which technical attributes are non-negotiable for search/filter (pressure rating, material, connection type, diameter, certificates)?
  2. Do you need configuration or compatibility checking (e.g., actuator + valve pairing)?
  3. How do you handle certificates, compliance docs, and revision/versioned datasheets?
  4. Are there complex supplier lead times or made-to-order flows?
- **Subquestions**
  - Which certificates are required (ATEX, FDA, WRAS, etc.) and how are they stored?
  - Do you need unit conversions (bar/psi, DN/inch) and localization?

#### Beltz247 (Conveyor Belts)
- **Business wording (simple)**
  - Do you mostly sell “standard products” or “made-to-measure” belts?
  - When a customer calls, what questions do you ask to identify the right belt?
- **Implementation wording (technical)**
  1. Are products cut-to-length/custom (dimensions, thickness, material, splices) and how is that priced?
  2. Do you need a configurator or quoting workflow for custom belts?
  3. How are replacements identified (OEM references, machine models, historical installs)?
  4. Any service component (installation/maintenance) that must be quoted with products?
- **Subquestions**
  - What is the minimum data needed for an RFQ to be “complete”?
  - Do you store customer machine history and should it be searchable?

#### De Visschere Technics (Irrigation)
- **Business wording (simple)**
  - What time of year is the busiest, and what must work perfectly then?
  - Do customers buy single items, or complete “projects/kits”?
- **Implementation wording (technical)**
  1. Is seasonality critical (inventory peaks, lead times, promotions)?
  2. Do customers require project-based BOMs (sprinkler layouts, kits)?
  3. Do you sell to both professional and prosumer segments (pricing/UX differences)?
  4. What installation guidance content is needed (how-tos, manuals, video, kits)?
- **Subquestions**
  - Do you need product bundling and kit assembly stock logic?
  - Are there regional regulations/standards to show on product pages?

#### Accu Components (Precision Components)
- **Business wording (simple)**
  - Do customers buy directly online, or do they nearly always ask for a quote first?
  - How important are technical drawings and certificates for a sale?
- **Implementation wording (technical)**
  1. Do you sell to OEMs with strict specs/tolerances and revision-controlled drawings?
  2. Do you require RFQ-first flows rather than direct purchase?
  3. Are there minimum order quantities, batch/lot tracking, or quality certificates?
  4. How do you handle long-tail catalogs and cross-references?
- **Subquestions**
  - Do you need revision control on product docs (drawing rev A/B/C)?
  - Do you need lot/batch traceability surfaced to customers?

### Cross-Company Synergy Questions (Ask as a Group)
- **Business wording (simple)**
  - Which customers already buy from more than one of the companies?
  - What should we be able to sell together in one visit/call?
  - What information is “private” and must not be visible to other companies?
- **Implementation wording (technical)**
  1. Which customers buy from multiple companies already? List the top 50.
  2. Which categories create the biggest cross-sell opportunities?
  3. Can we unify delivery promises (ship-from-where logic) without harming service?
  4. Do we want group-level procurement leverage (shared suppliers/contracts)?
  5. What data should be shared across companies vs remain private (pricing, customers, margin)?
- **Subquestions**
  - Define data sharing rules per domain:
    - customers
    - pricing
    - margin
    - supplier terms
    - stock
  - What is the approval process to change these rules later?

## Metrics (Execution-Level)
- Time-to-onboard a new company (target: decreasing over time)
- Catalog quality score (validation pass rate)
- Integration reliability (webhook success rate, retries)
- Portal adoption (active accounts, quotes/orders)

## Immediate Next Actions
1. Create `docs/STATUS.md` as a single weekly-updated dashboard.
2. Create ADRs for: brand/store model, identity model, SKU model.
3. Freeze `api/v1` contracts and implement one reference integration.
4. Use the company questionnaire: [Company Questionnaire](COMPANY_QUESTIONNAIRE.md).

---

*Last Updated: 2025-12-21*
