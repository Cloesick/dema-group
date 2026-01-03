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

4. **Configure Build Settings**
   - Go to: Project Settings > Build & Development Settings
   - Set Framework Preset: `Next.js`
   - Set Build Command: `pnpm build`
   - Set Install Command: `pnpm install`
   - Set Output Directory: `.next`
   - Status: Pending

5. **Set Node.js Version**
   - Navigate to: Project Settings > General > Node.js Version
   - Set to: 18.x
   - Status: Pending

5. **Trigger Deployment**
   - Go to: Deployments tab
   - Click: 'Redeploy' button
   - Status: Pending

6. **Monitor Build**
   - Watch deployment logs for errors
   - Note any issues that arise
   - Status: Pending

7. **Verify Deployment**
   - Once build succeeds, check deployed site URL
   - Verify basic functionality
   - Status: Pending

## Reference Files
- Package.json: `apps/portal/package.json`
- Vercel Config: `apps/portal/vercel.json`
- UI Components: `apps/portal/src/components/ui/*`

## Latest Changes
- Simplified package.json to essential dependencies
- Moved UI components into portal app
- Updated vercel.json to basic Next.js config
- All changes pushed to GitHub (commit: 92eeeb7)
