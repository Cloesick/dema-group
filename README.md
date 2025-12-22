# DEMA Group - Unified Platform

Strategy, documentation, and scaffold for the DEMA Group unified e-commerce platform.

> **Note:** The working DEMA webshop implementation is at [Cloesick/DemaFinal](https://github.com/Cloesick/DemaFinal)

## Structure

```
dema-group/
├── apps/                           # Application scaffolds
│   ├── portal/                     # 🏠 Master portal (demagroup.be)
│   ├── fluxer/                     # Fluxer placeholder
│   ├── beltz247/                   # Beltz247 placeholder
│   ├── devisschere/                # De Visschere placeholder
│   └── accu/                       # Accu placeholder
│
├── packages/                       # Shared packages (planned)
│   ├── ui/                         # Shared UI components
│   ├── config/                     # Shared configuration
│   └── data-utils/                 # Data processing utilities
│
├── docs/                           # Strategy & technical documentation
│   ├── DATABASE_SCHEMA.md          # Multi-company database design
│   ├── BUSINESS_FEATURES.md        # Feature specifications
│   ├── ERP_INTEGRATION.md          # ERP integration specs
│   ├── MIGRATION_AND_SCALING.md    # Scaling roadmap
│   └── ...                         # More docs
│
└── scripts/                        # Build & data scripts
```

## Companies

| Company | Domain | Specialization | Status |
|---------|--------|----------------|--------|
| **DEMA** | demashop.be | Pumps, pipes, tools | ✅ Live ([DemaFinal](https://github.com/Cloesick/DemaFinal)) |
| **Fluxer** | fluxer.be | Valves, instrumentation | Planned |
| **Beltz247** | beltz247.com | Conveyor belts | Planned |
| **De Visschere** | devisscheretechnics.be | Irrigation | Planned |
| **Accu** | accu-components.com | Precision components | Planned |

## Documentation

### Technical Specifications
- [Database Schema](docs/DATABASE_SCHEMA.md) - Multi-company data model (30+ tables)
- [Business Features](docs/BUSINESS_FEATURES.md) - 84 features specification
- [ERP Integration](docs/ERP_INTEGRATION.md) - Odoo, Exact Online integration
- [Migration & Scaling](docs/MIGRATION_AND_SCALING.md) - Growth roadmap

### Architecture
- [Architecture Decisions](docs/ARCHITECTURE_DECISIONS.md) - ADRs
- [Tech Stack](docs/TECH_STACK.md) - Technology choices
- [Scalability Analysis](docs/SCALABILITY_ANALYSIS.md) - Performance planning
- [GitHub & Hosting](docs/GITHUB_AND_HOSTING.md) - Infrastructure options
- [True Cost Analysis](docs/TRUE_COST_ANALYSIS.md) - Budget projections

### Strategy Documentation
- [Executive Summary](docs/01-executive-summary/executive-summary.md) - High-level strategy overview
- [Company Profiles](docs/02-company-analysis/company-profiles.md) - Individual company analysis
- [SWOT Analysis](docs/02-company-analysis/swot-analysis.md) - Strengths, weaknesses, opportunities, threats
- [Synergy Matrix](docs/02-company-analysis/synergy-matrix.md) - Cross-company synergies

### Market Analysis
- [Benchmark Analysis](docs/03-market-analysis/benchmark-analysis.md) - Kramp & Sodeco analysis
- [Competitive Landscape](docs/03-market-analysis/competitive-landscape.md) - Market positioning
- [Target Segments](docs/03-market-analysis/target-segments.md) - Customer segments

### Integration Strategy
- [Integration Roadmap](docs/04-integration-strategy/integration-roadmap.md) - Phased integration plan
- [Technical Architecture](docs/04-integration-strategy/technical-architecture.md) - Platform architecture
- [Data Integration](docs/04-integration-strategy/data-integration.md) - Product data unification
- [Brand Strategy](docs/04-integration-strategy/brand-strategy.md) - Unified vs multi-brand

### Action Plans
- [Phase 1: Foundation](docs/05-action-plans/phase1-foundation.md) - 0-6 months
- [Phase 2: Integration](docs/05-action-plans/phase2-integration.md) - 6-18 months
- [Phase 3: Expansion](docs/05-action-plans/phase3-expansion.md) - 18-36 months
- [KPI Dashboard](docs/05-action-plans/kpi-dashboard.md) - Success metrics

### Progress
- [Project Progress Log](docs/PROJECT_PROGRESS.md) - Daily updates

### Financial Projections
- [Investment Requirements](docs/06-financial-projections/investment-requirements.md) - CapEx/OpEx
- [ROI Analysis](docs/06-financial-projections/roi-analysis.md) - Return projections
- [Risk Assessment](docs/06-financial-projections/risk-assessment.md) - Risk mitigation

### Appendices
- [Glossary](docs/08-appendices/glossary.md) - Industry terms
- [References](docs/08-appendices/references.md) - Sources and links

## Getting Started

```bash
# Install dependencies
pnpm install

# Run portal scaffold
pnpm dev --filter=portal
```

## Related Repositories

| Repository | Description |
|------------|-------------|
| [Cloesick/DemaFinal](https://github.com/Cloesick/DemaFinal) | DEMA webshop (production) |
| Cloesick/dema-group | This repo (strategy & scaffold) |

## License

Proprietary - DEMA Group

---

*Last Updated: December 2024*

---

> **Merged from:** `group-strategy/` repository (December 2024)
