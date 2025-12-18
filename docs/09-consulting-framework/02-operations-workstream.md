# Workstream 2: Operations & Supply Chain
## Operational Excellence Advisory

---

```
╔══════════════════════════════════════════════════════════════════════════════╗
║  WORKSTREAM 2: OPERATIONS & SUPPLY CHAIN                                     ║
║  Lead: Operations Excellence Practice                                        ║
╚══════════════════════════════════════════════════════════════════════════════╝
```

---

## 1. Executive Summary

### Workstream Objective
Design and implement an integrated operations model that enables DEMA Group to fulfill B2B dealer orders with industry-leading service levels while achieving operational cost efficiencies through consolidation.

### Key Deliverables
- Target Operating Model for Operations
- Warehouse consolidation plan
- Logistics network design
- Inventory management framework
- Process standardization playbook

---

## 2. Current State Assessment

### Operations Landscape

| Company | Warehouse | Size (est.) | Inventory | Logistics |
|---------|-----------|-------------|-----------|-----------|
| **DEMA** | Waregem | 500m² | €200K | Own + carriers |
| **Fluxer** | Unknown | TBD | TBD | TBD |
| **Beltz247** | Unknown | TBD | TBD | TBD |
| **De Visschere** | Unknown | TBD | TBD | TBD |
| **Accu** | Unknown | TBD | TBD | TBD |

### Pain Points Identified

| Issue | Impact | Root Cause |
|-------|--------|------------|
| **Fragmented inventory** | Stock-outs, excess | No visibility across companies |
| **Duplicate SKUs** | Working capital waste | No master data management |
| **Inconsistent processes** | Quality variation | No standardization |
| **Manual operations** | High labor cost | Limited automation |
| **Limited visibility** | Poor decisions | No integrated systems |

---

## 3. Target Operating Model

### Future State Operations

```
                         DEMA GROUP OPERATIONS MODEL
                         
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                              │
│                          CENTRAL OPERATIONS HUB                              │
│                              (Waregem)                                       │
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                         WAREHOUSE (2,000m²)                          │   │
│  │                                                                      │   │
│  │   ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐           │   │
│  │   │ RECEIVING│  │  STORAGE │  │ PICKING  │  │ SHIPPING │           │   │
│  │   │          │  │          │  │          │  │          │           │   │
│  │   │ • QC     │  │ • 10,000 │  │ • Pick   │  │ • Pack   │           │   │
│  │   │ • Put-   │  │   SKUs   │  │   to     │  │ • Label  │           │   │
│  │   │   away   │  │ • ABC    │  │   light  │  │ • Ship   │           │   │
│  │   │          │  │   zones  │  │ • Batch  │  │          │           │   │
│  │   └──────────┘  └──────────┘  └──────────┘  └──────────┘           │   │
│  │                                                                      │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                    │                                        │
│                                    ▼                                        │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                      LOGISTICS NETWORK                               │   │
│  │                                                                      │   │
│  │   ┌──────────────┐    ┌──────────────┐    ┌──────────────┐         │   │
│  │   │   PARCELS    │    │   PALLETS    │    │   EXPRESS    │         │   │
│  │   │   <30kg      │    │   >30kg      │    │   Same-day   │         │   │
│  │   │              │    │              │    │              │         │   │
│  │   │  PostNL/     │    │  Kuehne+     │    │  Own van +   │         │   │
│  │   │  DPD/GLS     │    │  Nagel       │    │  Local taxi  │         │   │
│  │   └──────────────┘    └──────────────┘    └──────────────┘         │   │
│  │                                                                      │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Service Level Targets

| Metric | Current (est.) | Target Y1 | Target Y3 | Benchmark |
|--------|----------------|-----------|-----------|-----------|
| **Order accuracy** | 95% | 98% | 99.5% | TVH: 99% |
| **Same-day ship** | 70% | 85% | 95% | Kramp: 95% |
| **Stock availability** | 85% | 90% | 95% | TVH: 97% |
| **Delivery time (BE)** | 2-3 days | Next-day | Next-day | Kramp: Next-day |
| **Returns rate** | Unknown | <3% | <2% | Industry: 3% |

---

## 4. Warehouse Strategy

### Consolidation Recommendation

| Option | Description | Investment | Savings | Recommendation |
|--------|-------------|------------|---------|----------------|
| **A: Status quo** | Keep separate warehouses | €0 | €0 | ❌ No synergies |
| **B: Hub + spoke** | Central hub + local stock | €200K | €50K/yr | 🟡 Complex |
| **C: Full consolidation** | Single central warehouse | €300K | €100K/yr | ✅ Recommended |

### Central Warehouse Design

**Location:** Waregem (existing DEMA site or nearby)

**Rationale:**
- Central to West Flanders customer base
- Near E17 motorway
- Existing infrastructure
- Staff availability

**Space Requirements:**

| Zone | Size | Purpose |
|------|------|---------|
| **Receiving** | 200m² | Inbound, QC, put-away |
| **Storage - Fast** | 400m² | A-items, high velocity |
| **Storage - Medium** | 600m² | B-items |
| **Storage - Slow** | 400m² | C-items, bulk |
| **Picking** | 200m² | Order assembly |
| **Packing/Shipping** | 150m² | Outbound |
| **Returns** | 50m² | Returns processing |
| **Total** | **2,000m²** | |

**Investment:**

| Item | Cost |
|------|------|
| Lease (5yr) or purchase | €150K setup + €80K/yr |
| Racking & equipment | €80K |
| WMS software | €30K + €12K/yr |
| Material handling | €40K |
| **Total Setup** | **€300K** |
| **Annual Operating** | **€92K** |

---

## 5. Inventory Management

### Inventory Strategy

```
                         INVENTORY PYRAMID
                         
                              ┌───┐
                              │ A │  5% SKUs = 70% revenue
                              │   │  Target: 98% availability
                              ├───┤  Reorder: Daily
                              │   │
                              │ B │  15% SKUs = 20% revenue
                              │   │  Target: 95% availability
                              │   │  Reorder: Weekly
                              ├───┤
                              │   │
                              │   │
                              │ C │  80% SKUs = 10% revenue
                              │   │  Target: 90% availability
                              │   │  Reorder: Monthly / On-demand
                              │   │
                              └───┘
```

### Inventory Investment

| Category | SKUs | Avg. Value | Total Investment |
|----------|------|------------|------------------|
| **A-items** | 500 | €200 | €100,000 |
| **B-items** | 1,500 | €100 | €150,000 |
| **C-items** | 8,000 | €50 | €400,000 |
| **Safety stock** | - | - | €150,000 |
| **Total** | **10,000** | | **€800,000** |

### Inventory KPIs

| KPI | Definition | Target |
|-----|------------|--------|
| **Inventory turns** | COGS / Avg. Inventory | >4x/year |
| **Stock-out rate** | Orders with stock-out / Total orders | <5% |
| **Dead stock** | Items with no movement >12 months | <3% of value |
| **Fill rate** | Lines shipped complete / Total lines | >95% |
| **Days inventory** | Avg. Inventory / Daily COGS | <90 days |

---

## 6. Logistics Network

### Carrier Strategy

| Segment | Volume | Carrier | SLA | Cost |
|---------|--------|---------|-----|------|
| **Parcel (<5kg)** | 60% | PostNL/DPD | Next-day | €4-6 |
| **Parcel (5-30kg)** | 25% | DPD/GLS | Next-day | €7-12 |
| **Pallet** | 10% | Kuehne+Nagel | 2-day | €25-50 |
| **Express** | 5% | Own van / Taxi | Same-day | €15-30 |

### Delivery Zones

```
                         DELIVERY ZONES (from Waregem)
                         
                    ┌─────────────────────────────────────┐
                    │                                     │
                    │            NETHERLANDS              │
                    │              Zone C                 │
                    │            (2-day)                  │
                    │                                     │
          ┌─────────┼─────────────────────────────────────┤
          │         │                                     │
          │  FRANCE │      BELGIUM                        │
          │  Zone C │                                     │
          │ (2-day) │   ┌─────────────────────┐          │
          │         │   │      Zone A         │          │
          │         │   │    (Same-day)       │          │
          │         │   │   West-Vlaanderen   │          │
          │         │   │      ★ DEMA         │          │
          │         │   └─────────────────────┘          │
          │         │                                     │
          │         │         Zone B                      │
          │         │       (Next-day)                    │
          │         │    Rest of Belgium                  │
          │         │                                     │
          └─────────┴─────────────────────────────────────┘
```

### Logistics Cost Model

| Zone | Orders/Month | Avg. Cost | Monthly Cost |
|------|--------------|-----------|--------------|
| **Zone A (Same-day)** | 200 | €8 | €1,600 |
| **Zone B (Next-day)** | 600 | €10 | €6,000 |
| **Zone C (2-day)** | 200 | €15 | €3,000 |
| **Total** | **1,000** | **€10.60** | **€10,600** |

---

## 7. Process Design

### Core Processes

#### Order-to-Cash Process

```
┌─────────┐    ┌─────────┐    ┌─────────┐    ┌─────────┐    ┌─────────┐
│  ORDER  │    │ CREDIT  │    │  PICK   │    │  SHIP   │    │ INVOICE │
│ RECEIPT │───►│  CHECK  │───►│  PACK   │───►│         │───►│         │
└─────────┘    └─────────┘    └─────────┘    └─────────┘    └─────────┘
     │              │              │              │              │
     ▼              ▼              ▼              ▼              ▼
  Portal/       Automated      WMS-guided    Carrier API    Auto-gen
  EDI/Phone     credit limit   pick lists    integration    from ship
```

**Target Cycle Times:**

| Step | Current (est.) | Target | Automation |
|------|----------------|--------|------------|
| Order entry | 5 min | 0 min | Portal/EDI |
| Credit check | 10 min | 0 min | Automated |
| Pick | 15 min | 8 min | WMS optimization |
| Pack | 10 min | 5 min | Standard boxes |
| Ship | 10 min | 3 min | Carrier integration |
| Invoice | 5 min | 0 min | Auto-generate |
| **Total** | **55 min** | **16 min** | **70% reduction** |

#### Procure-to-Pay Process

```
┌─────────┐    ┌─────────┐    ┌─────────┐    ┌─────────┐    ┌─────────┐
│ DEMAND  │    │   PO    │    │ RECEIVE │    │   QC    │    │   PAY   │
│ FORECAST│───►│ CREATE  │───►│         │───►│         │───►│         │
└─────────┘    └─────────┘    └─────────┘    └─────────┘    └─────────┘
     │              │              │              │              │
     ▼              ▼              ▼              ▼              ▼
  Reorder       Automated      Barcode       Sample        3-way
  points        from ERP       scanning      check         match
```

### Process Standardization

| Process | Standard | Documentation |
|---------|----------|---------------|
| **Receiving** | Barcode scan, QC sample, put-away within 4 hours | SOP-OPS-001 |
| **Storage** | ABC zoning, FIFO, location management | SOP-OPS-002 |
| **Picking** | Batch picking, pick-to-light for A-items | SOP-OPS-003 |
| **Packing** | Standard box sizes, branded packaging | SOP-OPS-004 |
| **Shipping** | Carrier selection rules, label printing | SOP-OPS-005 |
| **Returns** | RMA process, inspection, restock/dispose | SOP-OPS-006 |

---

## 8. Technology Requirements

### Operations Technology Stack

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         OPERATIONS TECHNOLOGY                                │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                              ERP                                     │   │
│  │                    (Odoo / Exact Online)                            │   │
│  │         Inventory │ Purchasing │ Sales │ Finance                    │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                 │                                           │
│                                 ▼                                           │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                              WMS                                     │   │
│  │                   (Warehouse Management)                            │   │
│  │       Receiving │ Put-away │ Picking │ Packing │ Shipping           │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                 │                                           │
│         ┌───────────────────────┼───────────────────────┐                  │
│         │                       │                       │                  │
│         ▼                       ▼                       ▼                  │
│  ┌─────────────┐        ┌─────────────┐        ┌─────────────┐            │
│  │   CARRIER   │        │   BARCODE   │        │  REPORTING  │            │
│  │    APIs     │        │   SCANNERS  │        │  DASHBOARD  │            │
│  │             │        │             │        │             │            │
│  │ PostNL/DPD  │        │ Zebra/      │        │ Power BI/   │            │
│  │ GLS/K+N     │        │ Honeywell   │        │ Metabase    │            │
│  └─────────────┘        └─────────────┘        └─────────────┘            │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### WMS Selection Criteria

| Criterion | Weight | Options |
|-----------|--------|---------|
| **ERP integration** | 25% | Native Odoo WMS, or standalone |
| **Scalability** | 20% | Cloud-based, multi-warehouse |
| **Ease of use** | 20% | Mobile-first, intuitive |
| **Cost** | 20% | <€30K setup, <€15K/year |
| **Features** | 15% | Batch picking, wave planning |

### Recommended: Odoo Inventory + Barcode

| Aspect | Assessment |
|--------|------------|
| **Pros** | Native ERP integration, included in Odoo, mobile app |
| **Cons** | Less advanced than dedicated WMS |
| **Cost** | €0 additional (part of Odoo) |
| **Fit** | Good for <5,000 orders/month |

---

## 9. Organization Design

### Operations Team Structure

```
                         OPERATIONS ORGANIZATION
                         
                         ┌─────────────────┐
                         │   OPERATIONS    │
                         │    MANAGER      │
                         │    (1 FTE)      │
                         └────────┬────────┘
                                  │
              ┌───────────────────┼───────────────────┐
              │                   │                   │
              ▼                   ▼                   ▼
       ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
       │  WAREHOUSE  │    │  LOGISTICS  │    │  INVENTORY  │
       │   TEAM      │    │  COORD.     │    │  PLANNER    │
       │  (3 FTE)    │    │  (1 FTE)    │    │  (1 FTE)    │
       └─────────────┘    └─────────────┘    └─────────────┘
              │
              ▼
       • Receiving
       • Picking
       • Packing
       • Shipping
```

### Headcount Plan

| Role | Year 1 | Year 2 | Year 3 |
|------|--------|--------|--------|
| **Operations Manager** | 1 | 1 | 1 |
| **Warehouse Staff** | 2 | 3 | 4 |
| **Logistics Coordinator** | 0.5 | 1 | 1 |
| **Inventory Planner** | 0.5 | 1 | 1 |
| **Total FTE** | **4** | **6** | **7** |
| **Annual Cost** | **€160K** | **€240K** | **€280K** |

---

## 10. Implementation Roadmap

### Phase 1: Foundation (Months 1-6)

| Milestone | Activities | Deliverables |
|-----------|------------|--------------|
| **M1-2** | Current state mapping, process documentation | As-is process maps |
| **M3-4** | WMS selection, warehouse design | Vendor contract, layout |
| **M5-6** | WMS implementation, staff training | Go-live ready |

### Phase 2: Consolidation (Months 7-12)

| Milestone | Activities | Deliverables |
|-----------|------------|--------------|
| **M7-8** | Inventory consolidation from Company 2 | Single inventory |
| **M9-10** | Process standardization, KPI tracking | SOPs, dashboards |
| **M11-12** | Carrier optimization, cost reduction | Improved SLAs |

### Phase 3: Optimization (Months 13-18)

| Milestone | Activities | Deliverables |
|-----------|------------|--------------|
| **M13-14** | Remaining companies consolidated | Full integration |
| **M15-16** | Advanced WMS features (wave planning) | Efficiency gains |
| **M17-18** | Continuous improvement program | Sustained performance |

---

## 11. Financial Impact

### Cost-Benefit Analysis

| Category | Current (est.) | Target Y3 | Savings |
|----------|----------------|-----------|---------|
| **Warehouse rent** | €120K (5 sites) | €80K (1 site) | €40K |
| **Labor** | €200K | €280K | -€80K (growth) |
| **Inventory carrying** | €100K | €80K | €20K |
| **Logistics** | €150K | €130K | €20K |
| **Total Operating** | **€570K** | **€570K** | **€0** |

**Note:** Costs remain flat while handling 3x volume growth. Effective cost per order decreases 60%.

### Efficiency Gains

| Metric | Current | Target Y3 | Improvement |
|--------|---------|-----------|-------------|
| **Orders/FTE/day** | 20 | 50 | +150% |
| **Cost per order** | €15 | €6 | -60% |
| **Inventory turns** | 3x | 5x | +67% |
| **Perfect order rate** | 90% | 98% | +8pp |

---

## 12. Recommendations

### Quick Wins (0-90 Days)

| Action | Impact | Effort | Owner |
|--------|--------|--------|-------|
| Implement barcode scanning | High | Low | Operations |
| Standardize packaging | Medium | Low | Operations |
| Carrier rate negotiation | Medium | Low | Procurement |
| ABC inventory analysis | High | Medium | Finance |

### Strategic Initiatives

| Initiative | Investment | Payback | Priority |
|------------|------------|---------|----------|
| **WMS implementation** | €30K | 12 months | 1 |
| **Warehouse consolidation** | €150K | 24 months | 2 |
| **Carrier integration** | €15K | 6 months | 3 |
| **Inventory optimization** | €20K | 12 months | 4 |

---

*Document Classification: Confidential*
*Workstream: Operations*
*Version: 1.0*
*Last Updated: December 2024*
