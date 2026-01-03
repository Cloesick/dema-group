# Vercel Deployment Steps

## Current Task List
1. **Clean Up Existing Projects**
   - Go to Vercel dashboard: https://vercel.com/cloesicks-projects
   - Keep: `dema-group-portal.vercel.app` (this is our portal app)
   - Remove: `dema-group-strategy.vercel.app` (incorrect root deployment)
   - Status: Pending

2. **Verify GitHub Connection**
   - In the remaining project, go to Project Settings > Git
   - Confirm it's connected to `Cloesick/dema-group` repository
   - Status: Pending

2. **Set Root Directory**
   - Navigate to: Project Settings > General > Root Directory
   - Set value to: `apps/portal`
   - Status: Pending

3. **Configure Build Settings**
   - Go to: Project Settings > Build & Development Settings
   - Set Framework Preset: `Next.js`
   - Set Build Command: `pnpm build`
   - Set Install Command: `pnpm install`
   - Set Output Directory: `.next`
   - Status: Pending

4. **Set Node.js Version**
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
