# Contributing Guide

## Repository Structure

```
dema-group-strategy/
├── apps/                    # Application code
│   ├── portal/             # Main portal application
│   └── dema-webshop/       # E-commerce application
├── packages/               # Shared packages
│   ├── ui/                # UI components
│   ├── utils/             # Shared utilities
│   └── types/             # TypeScript types
├── data/                  # Data files (locally generated)
└── docs/                  # Documentation
```

## Development Setup

1. **Install Dependencies**:
```bash
pnpm install
```

2. **Generate Local Data**:
```bash
pnpm run generate-catalogs
```

3. **Start Development Server**:
```bash
# Portal only
pnpm run dev:portal

# All applications
pnpm run dev
```

## Git Guidelines

### What to Commit

✅ **DO Commit**:
- Source code
- Configuration files
- Documentation
- Tests
- CI/CD workflows

❌ **DON'T Commit**:
- Generated files (`data/catalogs/*.json`)
- Environment files (`.env*`)
- Build outputs (`dist/`, `.next/`)
- Logs (`*.log`)
- Dependencies (`node_modules/`)
- Local IDE settings

### Commit Message Format

```
type(scope): description

[optional body]

[optional footer]
```

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation
- `style`: Formatting
- `refactor`: Code restructuring
- `test`: Tests
- `chore`: Maintenance

Example:
```
feat(portal): add user authentication system

- Implement JWT token handling
- Add login/logout endpoints
- Set up session management
```

## Pre-commit Checks

Before committing, ensure:
1. No sensitive data is included
2. Tests pass locally
3. Linting passes
4. Types are checked
5. Documentation is updated

## Testing

```bash
# Unit tests
pnpm run test

# E2E tests
pnpm run test:e2e

# Type checking
pnpm run type-check
```

## Documentation

- Update relevant documentation
- Add inline comments for complex logic
- Include JSDoc for public APIs
- Update README files when needed

## Performance

- Run performance tests locally
- Check bundle sizes
- Profile memory usage
- Monitor build times

## Security

- No secrets in code
- Validate inputs
- Use security headers
- Follow OWASP guidelines
