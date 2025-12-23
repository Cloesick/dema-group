# Testing Guide

## Overview

The DEMA webshop has 108 tests covering components, utilities, and user journeys.

## Running Tests

```bash
# Run all tests
npm test

# Watch mode
npm run test:watch

# With coverage
npm run test:coverage

# User journey tests only
npm run test:journeys

# CI mode
npm run test:ci
```

## Test Structure

```
src/__tests__/
├── components/
│   ├── contact.test.tsx      # Contact form (13 tests)
│   └── login.test.tsx        # Auth flow (10 tests)
├── contexts/
│   └── quote.test.tsx        # Quote context (6 tests)
├── lib/
│   └── fuzzySearch.test.ts   # Search (17 tests)
└── journeys/
    ├── gardener.test.tsx     # Gardener persona (12 tests)
    ├── handyman.test.tsx     # Handyman persona (12 tests)
    ├── farmer.test.tsx       # Farmer persona (12 tests)
    ├── plumber.test.tsx      # Plumber persona (13 tests)
    └── industrial.test.tsx   # Industrial persona (13 tests)
```

## Test Suites

| Suite | Tests | Description |
|-------|-------|-------------|
| Contact | 13 | Form validation, submission |
| Login | 10 | Authentication flow |
| Quote | 6 | Quote context state |
| Search | 17 | Fuzzy search functionality |
| **Journeys** | **62** | E2E persona tests |

## User Journey Personas

| Persona | Type | Sector | Focus |
|---------|------|--------|-------|
| Gardener | B2B | Agriculture | Irrigation, pumps |
| Handyman | B2C | Construction | Tools, fittings |
| Farmer | B2B | Agriculture | Large equipment |
| Plumber | B2B | Plumbing | Pipes, valves |
| Industrial | B2B | Industry | Heavy machinery |

## Writing Tests

### Component Test

```typescript
import { render, screen } from '@testing-library/react';
import { MyComponent } from '@/components/MyComponent';

describe('MyComponent', () => {
  it('renders correctly', () => {
    render(<MyComponent />);
    expect(screen.getByText('Expected Text')).toBeInTheDocument();
  });
});
```

### User Journey Test

```typescript
describe('Gardener Journey', () => {
  it('can find irrigation products', async () => {
    // Setup
    render(<ProductsPage />);
    
    // Action
    const searchInput = screen.getByPlaceholderText('Search');
    await userEvent.type(searchInput, 'irrigation');
    
    // Assert
    expect(screen.getByText('Sprinkler System')).toBeInTheDocument();
  });
});
```

## Configuration

### Jest Config (`jest.config.js`)

```javascript
module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
  ],
};
```

---

*Last Updated: December 2024*
