# Business Intelligence Strategy Framework
## DEMA Group - Greenfield BI Implementation

---

```
╔══════════════════════════════════════════════════════════════════════════════╗
║                    DEMA GROUP BI STRATEGY                                    ║
║                    From Zero to Data-Driven                                  ║
╚══════════════════════════════════════════════════════════════════════════════╝
```

---

## 1. Executive Summary

### Current State
- **No existing BI infrastructure**
- 5 companies with separate systems
- Manual reporting (Excel-based)
- No standardized KPIs across group

### Target State
- Unified Power BI platform via SSC
- Real-time operational dashboards
- Consolidated group reporting
- Self-service analytics for managers

### Investment Required
- **Phase 1 (Foundation):** €15,000-25,000
- **Phase 2 (Dashboards):** €20,000-35,000
- **Phase 3 (Advanced):** €15,000-25,000
- **Ongoing:** ~€1,500/month (licenses + maintenance)

---

## 2. Prerequisites Checklist

### 2.1 Data Foundation

Before building dashboards, these must be in place:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         BI PREREQUISITES                                     │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  CRITICAL (Must Have)                                                       │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │ ☐ 1. SINGLE ERP SYSTEM                                              │   │
│  │    All companies on same ERP (Odoo recommended)                     │   │
│  │    OR: Clear data extraction from each legacy system                │   │
│  │                                                                      │   │
│  │ ☐ 2. MASTER DATA MANAGEMENT                                         │   │
│  │    • Unified customer master (1 customer = 1 record)               │   │
│  │    • Unified product master (1 SKU = 1 record)                     │   │
│  │    • Unified chart of accounts (same GL structure)                 │   │
│  │                                                                      │   │
│  │ ☐ 3. DATA DEFINITIONS                                               │   │
│  │    • "Revenue" = same calculation everywhere                        │   │
│  │    • "Margin" = same formula everywhere                            │   │
│  │    • "Active customer" = same definition everywhere                │   │
│  │                                                                      │   │
│  │ ☐ 4. HISTORICAL DATA                                                │   │
│  │    • Minimum 2 years for trend analysis                            │   │
│  │    • Clean, validated, reconciled to financials                    │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
│  IMPORTANT (Should Have)                                                    │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │ ☐ 5. DATA REFRESH CAPABILITY                                        │   │
│  │    • ERP can export data automatically (API or scheduled)          │   │
│  │    • Minimum daily refresh for operational data                    │   │
│  │                                                                      │   │
│  │ ☐ 6. DATA OWNERSHIP                                                 │   │
│  │    • Each data domain has an owner                                 │   │
│  │    • Finance owns financial data, Sales owns sales data, etc.      │   │
│  │                                                                      │   │
│  │ ☐ 7. DATA QUALITY PROCESSES                                         │   │
│  │    • Regular data validation                                       │   │
│  │    • Error correction procedures                                   │   │
│  │    • Audit trail for changes                                       │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
│  NICE TO HAVE                                                               │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │ ☐ 8. REAL-TIME DATA                                                 │   │
│  │    • Live inventory levels                                         │   │
│  │    • Real-time order status                                        │   │
│  │                                                                      │   │
│  │ ☐ 9. EXTERNAL DATA INTEGRATION                                      │   │
│  │    • Market data, competitor pricing                               │   │
│  │    • Weather data (for seasonal products)                          │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 2.2 Organizational Readiness

| Requirement | Description | Owner |
|-------------|-------------|-------|
| **Executive Sponsor** | C-level champion for BI initiative | Group CEO/CFO |
| **BI Owner** | Person responsible for BI success | SSC Director |
| **Dashboard Owners** | One owner per dashboard | Department heads |
| **Data Stewards** | Responsible for data quality | Per company |
| **Training Plan** | Users trained on Power BI | HR/IT |

### 2.3 Technical Infrastructure

| Component | Requirement | Status |
|-----------|-------------|--------|
| **Power BI Service** | Microsoft 365 E3/E5 or standalone | ☐ |
| **Power BI Embedded** | A1 capacity for SSC portal | ☐ |
| **Azure AD** | User authentication | ☐ |
| **Data Gateway** | On-premise data connection | ☐ |
| **Azure SQL** | Data warehouse (optional Phase 2) | ☐ |

---

## 3. Data Governance Framework

### 3.1 Data Definitions (Business Glossary)

#### Financial Metrics

| Term | Definition | Calculation | Source |
|------|------------|-------------|--------|
| **Gross Revenue** | Total invoiced amount before discounts | SUM(Invoice.Amount) | ERP |
| **Net Revenue** | Revenue after discounts and returns | Gross Revenue - Discounts - Returns | ERP |
| **COGS** | Cost of Goods Sold | SUM(Invoice.CostPrice * Quantity) | ERP |
| **Gross Margin** | Profit after COGS | Net Revenue - COGS | Calculated |
| **Gross Margin %** | Margin as percentage | (Gross Margin / Net Revenue) × 100 | Calculated |
| **EBITDA** | Earnings before interest, tax, depreciation | Operating Profit + Depreciation | ERP |
| **DSO** | Days Sales Outstanding | (AR / Net Revenue) × Days in Period | Calculated |
| **DPO** | Days Payable Outstanding | (AP / COGS) × Days in Period | Calculated |

#### Sales Metrics

| Term | Definition | Calculation | Source |
|------|------------|-------------|--------|
| **Order Value** | Total value of order | SUM(OrderLine.Price × Quantity) | ERP |
| **Average Order Value (AOV)** | Mean order size | Total Revenue / Number of Orders | Calculated |
| **Order Count** | Number of orders | COUNT(Orders) | ERP |
| **Conversion Rate** | Quotes to orders | Orders / Quotes × 100 | ERP |
| **Active Customer** | Customer with order in last 12 months | Customer with Order.Date > Today - 365 | ERP |
| **New Customer** | First order in period | Customer with MIN(Order.Date) in period | ERP |
| **Repeat Rate** | Customers with >1 order | Repeat Customers / Total Customers × 100 | Calculated |

#### Inventory Metrics

| Term | Definition | Calculation | Source |
|------|------------|-------------|--------|
| **Stock Value** | Total inventory value | SUM(Product.Quantity × CostPrice) | ERP |
| **Stock Turnover** | Times inventory sold per year | COGS / Average Stock Value | Calculated |
| **Days of Stock** | Days of inventory on hand | 365 / Stock Turnover | Calculated |
| **Fill Rate** | Orders shipped complete | Complete Orders / Total Orders × 100 | ERP |
| **Backorder Rate** | Orders with backorders | Backorder Lines / Total Lines × 100 | ERP |
| **Dead Stock** | No movement in 12 months | Products with Last Sale > 365 days | ERP |

#### HR Metrics

| Term | Definition | Calculation | Source |
|------|------------|-------------|--------|
| **Headcount** | Total employees | COUNT(Employees WHERE Status = Active) | HR System |
| **FTE** | Full-Time Equivalent | SUM(Employee.ContractHours / 40) | HR System |
| **Turnover Rate** | Employee departures | Departures / Average Headcount × 100 | HR System |
| **Revenue per Employee** | Productivity measure | Net Revenue / FTE | Calculated |
| **Personnel Cost Ratio** | Labor as % of revenue | Personnel Costs / Net Revenue × 100 | Calculated |

### 3.2 Data Quality Rules

| Rule | Description | Action if Failed |
|------|-------------|------------------|
| **Completeness** | No NULL values in required fields | Block record, alert owner |
| **Uniqueness** | No duplicate customer/product records | Merge duplicates |
| **Consistency** | Same format across systems | Transform on load |
| **Timeliness** | Data refreshed within SLA | Alert, escalate |
| **Accuracy** | Matches source system | Reconciliation report |

### 3.3 Data Refresh Schedule

| Data Domain | Refresh Frequency | SLA | Owner |
|-------------|-------------------|-----|-------|
| **Sales Orders** | Every 15 minutes | 99.5% | Sales Ops |
| **Inventory** | Every 15 minutes | 99.5% | Warehouse |
| **Financial Transactions** | Daily (overnight) | 99% | Finance |
| **Customer Master** | Daily (overnight) | 99% | Sales Ops |
| **Product Master** | Daily (overnight) | 99% | Product Mgmt |
| **HR Data** | Weekly | 95% | HR |
| **Consolidated Financials** | Monthly | 95% | Finance |

---

## 4. KPI Framework by Department

### 4.1 Executive / Group Level

**Purpose:** Strategic oversight, investor reporting, M&A decisions

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         EXECUTIVE KPIs                                       │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  FINANCIAL HEALTH                                                           │
│  ┌──────────────────┐ ┌──────────────────┐ ┌──────────────────┐            │
│  │ Group Revenue    │ │ Group EBITDA     │ │ EBITDA Margin    │            │
│  │ YTD vs Budget    │ │ YTD vs Budget    │ │ % vs Target      │            │
│  │ vs Prior Year    │ │ vs Prior Year    │ │                  │            │
│  └──────────────────┘ └──────────────────┘ └──────────────────┘            │
│                                                                              │
│  OPERATIONAL EFFICIENCY                                                     │
│  ┌──────────────────┐ ┌──────────────────┐ ┌──────────────────┐            │
│  │ Working Capital  │ │ Cash Conversion  │ │ Revenue per FTE  │            │
│  │ (DSO + DIO - DPO)│ │ Cycle (days)     │ │ vs Target        │            │
│  └──────────────────┘ └──────────────────┘ └──────────────────┘            │
│                                                                              │
│  GROWTH                                                                     │
│  ┌──────────────────┐ ┌──────────────────┐ ┌──────────────────┐            │
│  │ Revenue Growth   │ │ New Customers    │ │ Market Share     │            │
│  │ % YoY            │ │ Acquired         │ │ (if available)   │            │
│  └──────────────────┘ └──────────────────┘ └──────────────────┘            │
│                                                                              │
│  COMPANY COMPARISON                                                         │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │ Company    │ Revenue │ Margin │ Growth │ EBITDA │ Headcount │ R/FTE │   │
│  │────────────────────────────────────────────────────────────────────│   │
│  │ DEMA       │ €X.XM   │ XX%    │ +X%    │ €XXK   │ XX        │ €XXK  │   │
│  │ Fluxer     │ €X.XM   │ XX%    │ +X%    │ €XXK   │ XX        │ €XXK  │   │
│  │ Beltz247   │ €X.XM   │ XX%    │ +X%    │ €XXK   │ XX        │ €XXK  │   │
│  │ Company4   │ €X.XM   │ XX%    │ +X%    │ €XXK   │ XX        │ €XXK  │   │
│  │ Company5   │ €X.XM   │ XX%    │ +X%    │ €XXK   │ XX        │ €XXK  │   │
│  │────────────────────────────────────────────────────────────────────│   │
│  │ GROUP      │ €X.XM   │ XX%    │ +X%    │ €XXK   │ XX        │ €XXK  │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

| KPI | Target | Frequency | Owner |
|-----|--------|-----------|-------|
| Group Revenue | Budget +5% | Monthly | Group CFO |
| Group EBITDA | Budget | Monthly | Group CFO |
| EBITDA Margin | >10% | Monthly | Group CFO |
| Working Capital Days | <60 days | Monthly | Group CFO |
| Revenue per FTE | >€150K | Quarterly | Group CEO |
| Customer Retention | >85% | Quarterly | Group CEO |

### 4.2 Finance Department

**Purpose:** Financial control, cash management, compliance

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         FINANCE KPIs                                         │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ACCOUNTS RECEIVABLE                                                        │
│  ┌──────────────────┐ ┌──────────────────┐ ┌──────────────────┐            │
│  │ AR Balance       │ │ DSO              │ │ Overdue %        │            │
│  │ Current vs 30d   │ │ Days vs Target   │ │ >30d, >60d, >90d │            │
│  └──────────────────┘ └──────────────────┘ └──────────────────┘            │
│                                                                              │
│  ACCOUNTS PAYABLE                                                           │
│  ┌──────────────────┐ ┌──────────────────┐ ┌──────────────────┐            │
│  │ AP Balance       │ │ DPO              │ │ Payment Schedule │            │
│  │ Due this week    │ │ Days vs Target   │ │ Next 7/14/30 days│            │
│  └──────────────────┘ └──────────────────┘ └──────────────────┘            │
│                                                                              │
│  CASH FLOW                                                                  │
│  ┌──────────────────┐ ┌──────────────────┐ ┌──────────────────┐            │
│  │ Cash Position    │ │ Cash Forecast    │ │ Free Cash Flow   │            │
│  │ Today            │ │ 30/60/90 days    │ │ MTD/YTD          │            │
│  └──────────────────┘ └──────────────────┘ └──────────────────┘            │
│                                                                              │
│  PROFITABILITY                                                              │
│  ┌──────────────────┐ ┌──────────────────┐ ┌──────────────────┐            │
│  │ Gross Margin     │ │ Operating Margin │ │ Cost Breakdown   │            │
│  │ by Company       │ │ by Company       │ │ by Category      │            │
│  └──────────────────┘ └──────────────────┘ └──────────────────┘            │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

| KPI | Target | Frequency | Owner |
|-----|--------|-----------|-------|
| DSO | <45 days | Weekly | AR Manager |
| DPO | 30-45 days | Weekly | AP Manager |
| AR Overdue >60 days | <5% | Weekly | AR Manager |
| Cash Forecast Accuracy | >90% | Monthly | Treasurer |
| Month-End Close | <5 working days | Monthly | Controller |
| Gross Margin | >25% | Monthly | Controller |

### 4.3 Sales Department

**Purpose:** Revenue growth, customer acquisition, sales performance

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         SALES KPIs                                           │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  REVENUE                                                                    │
│  ┌──────────────────┐ ┌──────────────────┐ ┌──────────────────┐            │
│  │ Revenue MTD/YTD  │ │ Revenue by       │ │ Revenue by       │            │
│  │ vs Budget        │ │ Product Category │ │ Customer Segment │            │
│  └──────────────────┘ └──────────────────┘ └──────────────────┘            │
│                                                                              │
│  ORDERS                                                                     │
│  ┌──────────────────┐ ┌──────────────────┐ ┌──────────────────┐            │
│  │ Order Count      │ │ Average Order    │ │ Quote Conversion │            │
│  │ Today/Week/Month │ │ Value (AOV)      │ │ Rate             │            │
│  └──────────────────┘ └──────────────────┘ └──────────────────┘            │
│                                                                              │
│  CUSTOMERS                                                                  │
│  ┌──────────────────┐ ┌──────────────────┐ ┌──────────────────┐            │
│  │ Active Customers │ │ New Customers    │ │ Customer         │            │
│  │ vs Prior Year    │ │ Acquired         │ │ Retention Rate   │            │
│  └──────────────────┘ └──────────────────┘ └──────────────────┘            │
│                                                                              │
│  DEALER PERFORMANCE (B2B Portal)                                            │
│  ┌──────────────────┐ ┌──────────────────┐ ┌──────────────────┐            │
│  │ Top 20 Dealers   │ │ Dealer Tier      │ │ Portal Adoption  │            │
│  │ by Revenue       │ │ Distribution     │ │ % Online Orders  │            │
│  └──────────────────┘ └──────────────────┘ └──────────────────┘            │
│                                                                              │
│  PRODUCT PERFORMANCE                                                        │
│  ┌──────────────────┐ ┌──────────────────┐ ┌──────────────────┐            │
│  │ Top 50 Products  │ │ Slow Movers      │ │ New Product      │            │
│  │ by Revenue       │ │ Bottom 10%       │ │ Performance      │            │
│  └──────────────────┘ └──────────────────┘ └──────────────────┘            │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

| KPI | Target | Frequency | Owner |
|-----|--------|-----------|-------|
| Revenue vs Budget | 100% | Daily | Sales Director |
| Average Order Value | +5% YoY | Weekly | Sales Director |
| Quote Conversion Rate | >30% | Weekly | Sales Manager |
| New Customer Acquisition | 10/month | Monthly | Sales Director |
| Customer Retention | >85% | Quarterly | Sales Director |
| Portal Adoption | >60% orders online | Monthly | Digital Manager |
| Top 20 Customer Revenue | Stable/Growing | Monthly | Key Account Mgr |

### 4.4 Operations / Warehouse

**Purpose:** Fulfillment efficiency, inventory optimization, cost control

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         OPERATIONS KPIs                                      │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ORDER FULFILLMENT                                                          │
│  ┌──────────────────┐ ┌──────────────────┐ ┌──────────────────┐            │
│  │ Orders Today     │ │ Fill Rate        │ │ On-Time Delivery │            │
│  │ Pending/Shipped  │ │ % Complete       │ │ % vs SLA         │            │
│  └──────────────────┘ └──────────────────┘ └──────────────────┘            │
│                                                                              │
│  INVENTORY                                                                  │
│  ┌──────────────────┐ ┌──────────────────┐ ┌──────────────────┐            │
│  │ Stock Value      │ │ Stock Turnover   │ │ Days of Stock    │            │
│  │ by Location      │ │ Times/Year       │ │ by Category      │            │
│  └──────────────────┘ └──────────────────┘ └──────────────────┘            │
│                                                                              │
│  STOCK HEALTH                                                               │
│  ┌──────────────────┐ ┌──────────────────┐ ┌──────────────────┐            │
│  │ Stockouts        │ │ Overstock        │ │ Dead Stock       │            │
│  │ SKUs at 0        │ │ >180 days supply │ │ No sale 12 months│            │
│  └──────────────────┘ └──────────────────┘ └──────────────────┘            │
│                                                                              │
│  PURCHASING                                                                 │
│  ┌──────────────────┐ ┌──────────────────┐ ┌──────────────────┐            │
│  │ Open POs         │ │ Supplier Lead    │ │ Supplier         │            │
│  │ Value/Count      │ │ Time Performance │ │ On-Time Rate     │            │
│  └──────────────────┘ └──────────────────┘ └──────────────────┘            │
│                                                                              │
│  WAREHOUSE EFFICIENCY                                                       │
│  ┌──────────────────┐ ┌──────────────────┐ ┌──────────────────┐            │
│  │ Pick Rate        │ │ Error Rate       │ │ Returns Rate     │            │
│  │ Lines/Hour       │ │ % Mispicks       │ │ % of Orders      │            │
│  └──────────────────┘ └──────────────────┘ └──────────────────┘            │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

| KPI | Target | Frequency | Owner |
|-----|--------|-----------|-------|
| Fill Rate | >95% | Daily | Warehouse Mgr |
| On-Time Delivery | >98% | Daily | Logistics Mgr |
| Stock Turnover | >4x/year | Monthly | Inventory Mgr |
| Stockout Rate | <2% SKUs | Daily | Inventory Mgr |
| Dead Stock | <5% of value | Monthly | Inventory Mgr |
| Supplier On-Time | >90% | Weekly | Procurement |
| Pick Accuracy | >99.5% | Daily | Warehouse Mgr |
| Returns Rate | <2% | Weekly | Quality Mgr |

### 4.5 Procurement

**Purpose:** Cost optimization, supplier management, risk mitigation

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         PROCUREMENT KPIs                                     │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  SPEND ANALYSIS                                                             │
│  ┌──────────────────┐ ┌──────────────────┐ ┌──────────────────┐            │
│  │ Total Spend      │ │ Spend by         │ │ Spend by         │            │
│  │ YTD vs Budget    │ │ Category         │ │ Supplier         │            │
│  └──────────────────┘ └──────────────────┘ └──────────────────┘            │
│                                                                              │
│  SUPPLIER PERFORMANCE                                                       │
│  ┌──────────────────┐ ┌──────────────────┐ ┌──────────────────┐            │
│  │ Supplier         │ │ Quality Rate     │ │ Price Variance   │            │
│  │ On-Time %        │ │ % Defects        │ │ vs Contract      │            │
│  └──────────────────┘ └──────────────────┘ └──────────────────┘            │
│                                                                              │
│  COST SAVINGS                                                               │
│  ┌──────────────────┐ ┌──────────────────┐ ┌──────────────────┐            │
│  │ Savings Achieved │ │ Contract         │ │ Consolidation    │            │
│  │ vs Target        │ │ Compliance %     │ │ Opportunities    │            │
│  └──────────────────┘ └──────────────────┘ └──────────────────┘            │
│                                                                              │
│  RISK                                                                       │
│  ┌──────────────────┐ ┌──────────────────┐ ┌──────────────────┐            │
│  │ Single Source    │ │ Supplier         │ │ Contract         │            │
│  │ Dependencies     │ │ Concentration    │ │ Expiring Soon    │            │
│  └──────────────────┘ └──────────────────┘ └──────────────────┘            │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

| KPI | Target | Frequency | Owner |
|-----|--------|-----------|-------|
| Supplier On-Time | >90% | Weekly | Procurement Mgr |
| Supplier Quality | >98% | Monthly | Procurement Mgr |
| Cost Savings | 3% of spend | Quarterly | Procurement Mgr |
| Contract Compliance | >95% | Monthly | Procurement Mgr |
| Single Source Risk | <10% of spend | Quarterly | Procurement Mgr |

### 4.6 Human Resources

**Purpose:** Workforce planning, cost control, employee engagement

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         HR KPIs                                              │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  HEADCOUNT                                                                  │
│  ┌──────────────────┐ ┌──────────────────┐ ┌──────────────────┐            │
│  │ Total Headcount  │ │ FTE              │ │ Headcount by     │            │
│  │ by Company       │ │ by Department    │ │ Contract Type    │            │
│  └──────────────────┘ └──────────────────┘ └──────────────────┘            │
│                                                                              │
│  COSTS                                                                      │
│  ┌──────────────────┐ ┌──────────────────┐ ┌──────────────────┐            │
│  │ Personnel Cost   │ │ Cost per FTE     │ │ Overtime         │            │
│  │ vs Budget        │ │ by Company       │ │ Hours/Cost       │            │
│  └──────────────────┘ └──────────────────┘ └──────────────────┘            │
│                                                                              │
│  TURNOVER                                                                   │
│  ┌──────────────────┐ ┌──────────────────┐ ┌──────────────────┐            │
│  │ Turnover Rate    │ │ Voluntary vs     │ │ Tenure           │            │
│  │ % Annualized     │ │ Involuntary      │ │ Distribution     │            │
│  └──────────────────┘ └──────────────────┘ └──────────────────┘            │
│                                                                              │
│  RECRUITMENT                                                                │
│  ┌──────────────────┐ ┌──────────────────┐ ┌──────────────────┐            │
│  │ Open Positions   │ │ Time to Fill     │ │ Cost per Hire    │            │
│  │ by Department    │ │ Days             │ │                  │            │
│  └──────────────────┘ └──────────────────┘ └──────────────────┘            │
│                                                                              │
│  ABSENCE                                                                    │
│  ┌──────────────────┐ ┌──────────────────┐ ┌──────────────────┐            │
│  │ Absence Rate     │ │ Sick Leave       │ │ Leave Balance    │            │
│  │ % of Work Days   │ │ Trend            │ │ Liability        │            │
│  └──────────────────┘ └──────────────────┘ └──────────────────┘            │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

| KPI | Target | Frequency | Owner |
|-----|--------|-----------|-------|
| Turnover Rate | <15% | Monthly | HR Director |
| Absence Rate | <4% | Monthly | HR Director |
| Time to Fill | <45 days | Monthly | HR Manager |
| Personnel Cost vs Budget | ±2% | Monthly | HR Director |
| Revenue per FTE | >€150K | Quarterly | HR Director |
| Training Hours per Employee | >20 hours/year | Quarterly | HR Manager |

### 4.7 Customer Service

**Purpose:** Customer satisfaction, issue resolution, service efficiency

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         CUSTOMER SERVICE KPIs                                │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  TICKET VOLUME                                                              │
│  ┌──────────────────┐ ┌──────────────────┐ ┌──────────────────┐            │
│  │ Open Tickets     │ │ New Tickets      │ │ Tickets by       │            │
│  │ by Priority      │ │ Today/Week       │ │ Category         │            │
│  └──────────────────┘ └──────────────────┘ └──────────────────┘            │
│                                                                              │
│  RESOLUTION                                                                 │
│  ┌──────────────────┐ ┌──────────────────┐ ┌──────────────────┐            │
│  │ First Response   │ │ Resolution Time  │ │ First Contact    │            │
│  │ Time (hours)     │ │ (hours)          │ │ Resolution %     │            │
│  └──────────────────┘ └──────────────────┘ └──────────────────┘            │
│                                                                              │
│  SATISFACTION                                                               │
│  ┌──────────────────┐ ┌──────────────────┐ ┌──────────────────┐            │
│  │ CSAT Score       │ │ NPS              │ │ Complaint        │            │
│  │ % Satisfied      │ │ Net Promoter     │ │ Rate             │            │
│  └──────────────────┘ └──────────────────┘ └──────────────────┘            │
│                                                                              │
│  RETURNS & CLAIMS                                                           │
│  ┌──────────────────┐ ┌──────────────────┐ ┌──────────────────┐            │
│  │ Return Rate      │ │ Claim Value      │ │ Root Cause       │            │
│  │ % of Orders      │ │ MTD              │ │ Analysis         │            │
│  └──────────────────┘ └──────────────────┘ └──────────────────┘            │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

| KPI | Target | Frequency | Owner |
|-----|--------|-----------|-------|
| First Response Time | <4 hours | Daily | CS Manager |
| Resolution Time | <24 hours | Daily | CS Manager |
| First Contact Resolution | >70% | Weekly | CS Manager |
| CSAT Score | >4.0/5.0 | Weekly | CS Manager |
| Return Rate | <2% | Weekly | CS Manager |

---

## 5. Dashboard Specifications

### 5.1 Dashboard Hierarchy

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         DASHBOARD HIERARCHY                                  │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  LEVEL 1: EXECUTIVE                                                         │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                    GROUP EXECUTIVE DASHBOARD                         │   │
│  │  Audience: CEO, CFO, Board                                          │   │
│  │  Refresh: Daily                                                      │   │
│  │  Content: Group P&L, Company comparison, Key alerts                 │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                    │                                        │
│                    ┌───────────────┼───────────────┐                       │
│                    ▼               ▼               ▼                       │
│  LEVEL 2: COMPANY                                                          │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐          │
│  │    DEMA     │ │   Fluxer    │ │  Beltz247   │ │  Company4   │          │
│  │  Dashboard  │ │  Dashboard  │ │  Dashboard  │ │  Dashboard  │          │
│  │             │ │             │ │             │ │             │          │
│  │ Audience:   │ │ Audience:   │ │ Audience:   │ │ Audience:   │          │
│  │ Company Dir │ │ Company Dir │ │ Company Dir │ │ Company Dir │          │
│  └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘          │
│         │               │               │               │                  │
│         ▼               ▼               ▼               ▼                  │
│  LEVEL 3: DEPARTMENT                                                       │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ │
│  │ Finance │ │  Sales  │ │  Ops    │ │Procurem.│ │   HR    │ │   CS    │ │
│  │Dashboard│ │Dashboard│ │Dashboard│ │Dashboard│ │Dashboard│ │Dashboard│ │
│  └─────────┘ └─────────┘ └─────────┘ └─────────┘ └─────────┘ └─────────┘ │
│                                                                              │
│  LEVEL 4: OPERATIONAL (Self-Service)                                       │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  Ad-hoc reports, drill-downs, exports                               │   │
│  │  Audience: Analysts, Power Users                                    │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 5.2 Dashboard Catalog

| Dashboard | Level | Audience | Refresh | Key Metrics |
|-----------|-------|----------|---------|-------------|
| **Group Executive** | 1 | CEO, CFO, Board | Daily | Revenue, EBITDA, Company comparison |
| **DEMA Company** | 2 | DEMA Director | Daily | Company P&L, Sales, Inventory |
| **Fluxer Company** | 2 | Fluxer Director | Daily | Company P&L, Sales, Inventory |
| **Beltz247 Company** | 2 | Beltz247 Director | Daily | Company P&L, Sales, Inventory |
| **Finance Overview** | 3 | Finance team | Daily | AR, AP, Cash, P&L |
| **AR Aging** | 3 | AR team | Real-time | Aging buckets, Collection status |
| **AP Aging** | 3 | AP team | Real-time | Payment schedule, Cash requirements |
| **Sales Performance** | 3 | Sales team | Real-time | Orders, Revenue, Pipeline |
| **Dealer Analytics** | 3 | Sales Directors | Daily | Dealer performance, Tier analysis |
| **Inventory Health** | 3 | Warehouse | Real-time | Stock levels, Alerts, Turnover |
| **Procurement Spend** | 3 | Procurement | Weekly | Spend analysis, Supplier performance |
| **HR Overview** | 3 | HR team | Weekly | Headcount, Costs, Turnover |
| **Customer Service** | 3 | CS team | Real-time | Tickets, Resolution, CSAT |

### 5.3 Dashboard Design Standards

#### Visual Guidelines

| Element | Standard |
|---------|----------|
| **Colors** | DEMA brand colors, consistent across all dashboards |
| **KPI Cards** | Top of page, 4-6 cards max |
| **Charts** | Max 6 visuals per page |
| **Tables** | Use for detail, not primary view |
| **Filters** | Top or left, consistent placement |
| **Drill-through** | Available on all summary visuals |

#### Naming Conventions

| Type | Convention | Example |
|------|------------|---------|
| **Dashboard** | [Level]-[Domain]-[Scope] | L1-Executive-Group |
| **Page** | [Domain]-[View] | Finance-AR-Aging |
| **Measure** | [Metric] [Qualifier] | Revenue MTD |
| **Dimension** | [Entity] [Attribute] | Customer Name |

---

## 6. Implementation Roadmap

### Phase 1: Foundation (Months 1-3)

**Goal:** Establish data infrastructure and governance

| Week | Deliverable | Owner |
|------|-------------|-------|
| 1-2 | Data audit across all companies | BI Lead |
| 3-4 | Define business glossary (data definitions) | Finance + BI |
| 5-6 | Set up Power BI workspace and security | IT |
| 7-8 | Build data model (star schema) | BI Lead |
| 9-10 | Connect data sources (ERP, etc.) | IT + BI |
| 11-12 | Data validation and reconciliation | Finance |

**Deliverables:**
- [ ] Data audit report
- [ ] Business glossary document
- [ ] Power BI workspace configured
- [ ] Data model documented
- [ ] Data refresh working

### Phase 2: Core Dashboards (Months 4-6)

**Goal:** Deliver first dashboards to users

| Week | Deliverable | Owner |
|------|-------------|-------|
| 13-14 | Executive Dashboard (Group) | BI Lead |
| 15-16 | Finance Dashboard (AR/AP/Cash) | BI Lead |
| 17-18 | Sales Dashboard | BI Lead |
| 19-20 | User training (Finance, Sales) | BI Lead |
| 21-22 | Feedback and iteration | BI Lead |
| 23-24 | Go-live Phase 2 | BI Lead |

**Deliverables:**
- [ ] Executive Dashboard live
- [ ] Finance Dashboard live
- [ ] Sales Dashboard live
- [ ] 20+ users trained
- [ ] Feedback incorporated

### Phase 3: Expansion (Months 7-9)

**Goal:** Complete departmental coverage

| Week | Deliverable | Owner |
|------|-------------|-------|
| 25-26 | Operations/Inventory Dashboard | BI Lead |
| 27-28 | Procurement Dashboard | BI Lead |
| 29-30 | HR Dashboard | BI Lead |
| 31-32 | Customer Service Dashboard | BI Lead |
| 33-34 | Company-level dashboards (per company) | BI Lead |
| 35-36 | Self-service training | BI Lead |

**Deliverables:**
- [ ] All departmental dashboards live
- [ ] Company dashboards live
- [ ] Self-service capability enabled
- [ ] 50+ users trained

### Phase 4: Advanced Analytics (Months 10-12)

**Goal:** Predictive and prescriptive analytics

| Week | Deliverable | Owner |
|------|-------------|-------|
| 37-38 | Demand forecasting model | BI Lead |
| 39-40 | Customer churn prediction | BI Lead |
| 41-42 | Inventory optimization | BI Lead |
| 43-44 | Automated alerts and anomaly detection | BI Lead |
| 45-48 | Continuous improvement, documentation | BI Lead |

**Deliverables:**
- [ ] Forecasting models deployed
- [ ] Automated alerts configured
- [ ] Full documentation complete
- [ ] BI Center of Excellence established

---

## 7. Success Metrics

### BI Program KPIs

| Metric | Target (Year 1) | Target (Year 2) |
|--------|-----------------|-----------------|
| **Dashboard Adoption** | 50% of target users | 80% of target users |
| **Weekly Active Users** | 30 | 60 |
| **Report Requests Reduced** | -30% | -60% |
| **Decision Time** | -20% | -40% |
| **Data Quality Score** | 85% | 95% |
| **User Satisfaction** | 3.5/5 | 4.0/5 |

### ROI Calculation

| Benefit | Estimated Annual Value |
|---------|------------------------|
| Reduced manual reporting | €20,000-30,000 |
| Faster decision making | €10,000-20,000 |
| Inventory optimization | €30,000-50,000 |
| Improved collections (DSO) | €15,000-25,000 |
| **Total Estimated Benefit** | **€75,000-125,000** |

| Cost | Estimated Annual Cost |
|------|----------------------|
| Power BI licenses | €8,000-12,000 |
| Implementation (Year 1) | €50,000-85,000 |
| Ongoing maintenance | €15,000-25,000 |
| **Total Estimated Cost (Year 1)** | **€73,000-122,000** |
| **Total Estimated Cost (Year 2+)** | **€23,000-37,000** |

**Payback Period:** 12-18 months

---

## 8. Risk Mitigation

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| **Poor data quality** | High | High | Data audit first, quality rules, stewards |
| **Low user adoption** | Medium | High | Executive sponsorship, training, quick wins |
| **Scope creep** | High | Medium | Phased approach, strict prioritization |
| **Technical issues** | Medium | Medium | Proven technology, vendor support |
| **Resource constraints** | Medium | Medium | Dedicated BI resource, external support |
| **Definition disagreements** | High | Medium | Business glossary, governance committee |

---

## 9. Appendix: Data Source Mapping

### Required Data by Dashboard

| Dashboard | Data Source | Tables/Entities |
|-----------|-------------|-----------------|
| **Executive** | ERP, HR | GL, Orders, Employees |
| **Finance** | ERP, Bank | GL, AR, AP, Bank Statements |
| **Sales** | ERP, Portal | Orders, Customers, Products |
| **Operations** | ERP, WMS | Inventory, Orders, Shipments |
| **Procurement** | ERP | PO, Suppliers, Invoices |
| **HR** | HR System | Employees, Payroll, Leave |
| **Customer Service** | Ticketing | Tickets, Customers |

### Data Extraction Requirements

| Source System | Extraction Method | Frequency | Volume |
|---------------|-------------------|-----------|--------|
| **Odoo ERP** | REST API | 15 min | ~10K records/day |
| **Dealer Portal** | Database direct | 15 min | ~5K records/day |
| **SD Worx** | File export | Monthly | ~100 records |
| **Bank (Isabel)** | API | Daily | ~500 records/day |
| **Ticketing** | API | Hourly | ~100 records/day |

---

*Document Classification: Internal*
*Version: 1.0*
*Last Updated: December 2024*
