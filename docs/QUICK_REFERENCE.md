# DEMA Group Quick Reference

## 📁 Key Documents

### Project Overview
- 📘 [Main Documentation](README.md)
- 📊 [Executive Synopsis](synopsis.md)
- 📚 [Master Document](master-document.md)
- 📖 [Development Guide](development-guide.md)

### Technical
- 🏗 [Architecture Details](07-technical-specs/architecture-details.md)
- 📝 [Implementation Guide](07-technical-specs/implementation-guide.md)
- 🔧 [Technical Roadmap](strategic-analysis/02-technical-roadmap.md)

### Business
- 💼 [Executive Summary](strategic-analysis/01-executive-summary.md)
- 💰 [Financial Model](06-financial-projections/financial-model.md)
- ⚠️ [Risk Matrix](06-financial-projections/risk-matrix.md)

## 🔄 Daily Updates

### Automated Reports
```bash
docs/reports/
├── daily-report-{date}.md   # Daily status
├── weekly-report-{date}.md  # Weekly summary
└── monthly-report-{date}.md # Monthly review
```

### Live Dashboards
```bash
docs/dashboards/
├── executive.html   # High-level overview
├── technical.html   # System performance
├── financial.html   # Financial metrics
└── operational.html # Service status
```

### Latest Metrics
```bash
docs/metrics/
├── current.json  # Current status
├── history.json  # Historical data
└── report.md     # Daily summary
```

## 🛠 Common Commands

### Update Documentation
```bash
# Update all docs
pnpm docs:update

# Generate metrics
pnpm tsx scripts/metrics-collector.ts

# Create visualizations
pnpm tsx scripts/generate-visualizations.ts

# Generate reports
pnpm tsx scripts/generate-reports.ts
```

## 📊 Key Metrics Locations

### Technical
- System Status: `docs/metrics/current.json`
- Performance: `docs/visualizations/technical-metrics.json`
- API Health: `docs/visualizations/api-health.json`

### Business
- User Metrics: `docs/metrics/business.json`
- Revenue: `docs/metrics/financial.json`
- Customer Stats: `docs/metrics/customer.json`

### Operations
- Service Status: `docs/metrics/services.json`
- Resources: `docs/metrics/resources.json`
- Incidents: `docs/metrics/incidents.json`

## 🔍 Quick Links

### Development
- [Architecture Overview](07-technical-specs/architecture-details.md#system-architecture)
- [API Documentation](07-technical-specs/implementation-guide.md#api-development)
- [Coding Standards](07-technical-specs/implementation-guide.md#coding-standards)

### Monitoring
- [System Status](dashboards/technical.html)
- [Error Logs](docs/logs/)
- [Performance Metrics](visualizations/performance.json)

### Reports
- [Latest Daily Report](reports/daily-report-{date}.md)
- [Current Sprint Status](reports/sprint-status.md)
- [Risk Assessment](06-financial-projections/risk-matrix.md)
