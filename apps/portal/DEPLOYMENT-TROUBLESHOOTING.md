# Deployment Troubleshooting Guide

## Common Issues and Solutions

### 1. TypeScript Errors

**Symptoms:**
- Build fails with type errors
- "Cannot find module" errors
- "Property does not exist on type" errors

**Solutions:**
1. Run type check locally first:
   ```bash
   pnpm type-check
   ```
2. Ensure all dependencies are installed:
   ```bash
   pnpm install
   ```
3. Check type definitions in `next-auth.d.ts` and other type files

### 2. Dependency Issues

**Symptoms:**
- `pnpm install` fails
- Lockfile errors
- Peer dependency warnings

**Solutions:**
1. Clear dependency cache:
   ```bash
   rm -rf node_modules
   pnpm store prune
   pnpm install
   ```
2. Update lockfile:
   ```bash
   pnpm install --no-frozen-lockfile
   ```
3. Check Node.js version matches Vercel (20.x)

### 3. Build Configuration

**Symptoms:**
- Build fails without clear errors
- Output directory issues
- Framework detection problems

**Solutions:**
1. Verify vercel.json settings:
   ```json
   {
     "framework": "nextjs",
     "buildCommand": "pnpm build",
     "installCommand": "pnpm install --no-frozen-lockfile"
   }
   ```
2. Check root directory setting in Vercel dashboard
3. Ensure build output matches Next.js configuration

### 4. Environment Variables

**Symptoms:**
- Runtime errors after deployment
- API routes failing
- Authentication issues

**Solutions:**
1. Check environment variables in Vercel dashboard
2. Verify all required variables are set:
   - AUTH_SECRET
   - DATABASE_URL
   - API_KEY
3. Use environment variable validation:
   ```typescript
   import { z } from 'zod';
   const envSchema = z.object({...});
   ```

### 5. Performance Issues

**Symptoms:**
- Slow build times
- Large bundle sizes
- Memory errors

**Solutions:**
1. Check bundle analysis:
   ```bash
   ANALYZE=true pnpm build
   ```
2. Implement code splitting:
   ```typescript
   const Component = dynamic(() => import('./Component'))
   ```
3. Optimize dependencies:
   ```bash
   pnpm prune && pnpm install
   ```

## Pre-Deployment Checklist

1. ✅ Run type check locally
2. ✅ Test build locally
3. ✅ Check environment variables
4. ✅ Verify dependencies
5. ✅ Review bundle size
6. ✅ Test critical paths

## Monitoring Deployments

1. Watch build logs in real-time
2. Check Windsurf chat for build updates
3. Monitor `/api/health` endpoint
4. Review performance metrics

## Quick Recovery Steps

1. If deployment fails:
   ```bash
   git checkout last-working-commit
   git push -f origin main
   ```

2. If types are broken:
   ```bash
   pnpm type-check
   pnpm generate-types
   git commit -am "fix: regenerate types"
   ```

3. If dependencies are broken:
   ```bash
   rm -rf node_modules
   rm pnpm-lock.yaml
   pnpm install
   git commit -am "fix: regenerate lockfile"
   ```

## Getting Help

1. Check Windsurf chat for automated error analysis
2. Review deployment logs in Vercel dashboard
3. Check GitHub actions for CI failures
4. Monitor error tracking in production
