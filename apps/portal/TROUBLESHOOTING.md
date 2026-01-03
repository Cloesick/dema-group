# Cypress Troubleshooting Guide

## Common Issues and Solutions

### Windows Environment Issues

#### 1. WMIC.exe Not Found
```
Error: spawn wmic.exe ENOENT
```

**Solution:**
- Use the custom runner script: `scripts/run-cypress.js`
- Set environment variables:
  ```powershell
  $env:CYPRESS_CRASH_REPORTS = "0"
  $env:NO_COLOR = "1"
  ```

#### 2. CHCP Command Not Found
```
'chcp' is not recognized as an internal or external command
```

**Solution:**
- Use cross-env package
- Update package.json scripts to use cross-env
- Run Cypress with environment variables explicitly set

### Browser Cache Issues

#### 1. Cache Access Denied
```
Unable to move the cache: Access is denied. (0x5)
```

**Solution:**
- Run PowerShell as Administrator
- Clear browser cache manually
- Use `trashAssetsBeforeRuns: false` in Cypress config

### Test Execution Issues

#### 1. Port Already in Use
```
Error: listen EADDRINUSE: address already in use :::3001
```

**Solution:**
1. Find the process:
   ```powershell
   netstat -ano | findstr :3001
   ```
2. Kill the process:
   ```powershell
   taskkill /F /PID <process_id>
   ```

#### 2. TypeScript Compilation Errors
```
Property 'findByLabelText' does not exist on type 'cy & CyEventEmitter'
```

**Solution:**
- Update type definitions in `cypress/support/e2e.ts`
- Install correct @types packages
- Use proper Testing Library imports

### CI/CD Issues

#### 1. GitHub Actions Failures
```
Error: spawn powershell.exe ENOENT
```

**Solution:**
- Use cross-platform commands in CI
- Set proper environment variables
- Use official Cypress GitHub Action

## Quick Reference

### Command Line Tools

#### 1. Verify Cypress Installation
```powershell
pnpm exec cypress verify
```

#### 2. Clear Cypress Cache
```powershell
pnpm exec cypress cache clear
```

#### 3. Run Specific Tests
```powershell
pnpm exec cypress run --spec "cypress/e2e/compliance/**/*.cy.ts"
```

### Environment Variables

#### 1. Required Variables
```powershell
CYPRESS_VERIFY_TIMEOUT=100000
NO_COLOR=1
CYPRESS_CRASH_REPORTS=0
```

#### 2. Optional Variables
```powershell
CYPRESS_BASE_URL=http://localhost:3001
CYPRESS_RECORD_KEY=your-key-here
```

## Best Practices

### 1. Running Tests
- Always start the dev server first
- Use the provided npm scripts
- Run tests in isolation when debugging

### 2. Debugging
- Use `cy.pause()`
- Enable debug logs
- Check browser console
- Use Cypress time-travel debugging

### 3. Performance
- Disable video recording in CI
- Use proper viewport settings
- Implement proper waiting strategies
- Avoid unnecessary page loads

## Support Resources

### Documentation
- [Cypress Troubleshooting](https://docs.cypress.io/guides/references/troubleshooting)
- [Windows Support](https://docs.cypress.io/guides/getting-started/installing-cypress#Windows-Subsystem-for-Linux)

### Community
- [Cypress Discord](https://discord.com/invite/cypress)
- [GitHub Issues](https://github.com/cypress-io/cypress/issues)

### Internal Support
- Contact DevOps team for CI/CD issues
- Check project wiki for environment-specific guides
- Review pull request history for similar issues
