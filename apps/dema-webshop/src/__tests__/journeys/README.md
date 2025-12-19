# User Journey Tests

This folder contains end-to-end user journey tests for different customer personas.

## Structure

```
journeys/
├── README.md                    # This file
├── _shared/
│   └── journey-utils.ts         # Shared utilities and helpers
├── personas/
│   └── index.ts                 # User persona definitions
├── gardener.journey.test.tsx    # Gardener/Landscaper journey
├── handyman.journey.test.tsx    # Handyman/DIY journey
├── farmer.journey.test.tsx      # Farmer/Agriculture journey
├── plumber.journey.test.tsx     # Plumber/Installer journey
└── industrial.journey.test.tsx  # Industrial buyer journey
```

## Personas

| Persona | Business Type | Primary Products | Typical Order |
|---------|--------------|------------------|---------------|
| **Gardener** | B2B/B2C | Makita garden tools, irrigation | Medium |
| **Handyman** | B2C | Tools, fittings, general supplies | Small-Medium |
| **Farmer** | B2B | Pumps, irrigation, large equipment | Large |
| **Plumber** | B2B | Pipes, fittings, valves, pumps | Medium-Large |
| **Industrial** | B2B | Bulk orders, specialized equipment | Large |

## Running Tests

```bash
# Run all journey tests
npm test -- --testPathPattern="journeys"

# Run specific persona
npm test -- --testPathPattern="journeys/gardener"
npm test -- --testPathPattern="journeys/plumber"
```

## Journey Steps

Each journey test covers:

1. **Discovery** - How user finds products (search, categories, recommendations)
2. **Browsing** - Product exploration, filtering, comparison
3. **Selection** - Adding to quote, adjusting quantities
4. **Account** - Registration/login flow
5. **Quote Request** - Submitting quote with business details
6. **Confirmation** - Email receipt, next steps

## Adding New Journeys

1. Create new file: `{persona}.journey.test.tsx`
2. Import shared utilities from `_shared/journey-utils.ts`
3. Define persona in `personas/index.ts`
4. Follow existing test structure
