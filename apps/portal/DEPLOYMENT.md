# Vercel Deployment Steps

## Current Task List
1. **Clean Up Existing Projects** ✅
   - Kept: `dema-group-portal.vercel.app` (portal app)
   - Removed: `dema-group-strategy.vercel.app`
   - Status: Completed

2. **Verify GitHub Connection** ✅
   - Connected to: `Cloesick/dema-group`
   - Portal path: `apps/portal`
   - Status: Completed

3. **Set Root Directory** ✅
   - Value set to: `apps/portal`
   - Status: Completed

4. **Configure Build Settings** ✅
   - Framework Preset: `Next.js` ✅
   - Build Command: `pnpm build` ✅
   - Install Command: `pnpm install` ✅
   - Output Directory: `Next.js default` ✅
   - Development Command: `next` ✅
   - Status: Completed

5. **Set Node.js Version** ✅
   - Changed from: 24.x to 20.x
   - Reason: Better stability for Next.js 16
   - Status: Completed

6. **Trigger Deployment** ⏳
   - Previous auto-deploy failed with lockfile error
   - Lockfile has been regenerated (commit 7a17fe9)
   - Manual redeploy recommended
   - Action: Click 'Redeploy' in Vercel dashboard
   - Status: Awaiting manual trigger

7. **Monitor Build** ⏳
   - Error: pnpm lockfile mismatch with root package.json
   - Issue: Dependencies in lockfile don't match package.json
   - Fix needed: Regenerate lockfile from root
   - Status: Fixing

8. **Verify Deployment**
   - Once build succeeds, check deployed site URL
   - Verify basic functionality
   - Status: Pending

## Reference Files
- Package.json: `apps/portal/package.json`
- Vercel Config: `apps/portal/vercel.json`
- UI Components: `apps/portal/src/components/ui/*`

## Deployment Workflow
1. Local changes are committed
2. Changes are pushed to GitHub (`git push`)
3. Vercel automatically detects GitHub changes
4. New deployment starts automatically
5. Build logs appear in Vercel dashboard

No need to manually trigger deployments - just wait a few seconds after `git push` for Vercel to detect the changes.

## Latest Changes
- Simplified package.json to essential dependencies
- Moved UI components into portal app
- Updated vercel.json to basic Next.js config
- All changes pushed to GitHub (commit: 92eeeb7)
