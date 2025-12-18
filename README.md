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

### Strategy (in subdirectories)
- `docs/01-executive-summary/` - Executive overview
- `docs/02-company-analysis/` - Individual company profiles
- `docs/04-integration-strategy/` - Integration roadmap

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
