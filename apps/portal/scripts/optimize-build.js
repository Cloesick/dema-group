const fs = require('fs');
const path = require('path');

// Clear unnecessary files before build
function cleanBuildFiles() {
  const filesToDelete = [
    '.next/cache/images',
    '.next/cache/fetch-cache',
    'node_modules/.cache'
  ];

  filesToDelete.forEach(file => {
    const fullPath = path.join(process.cwd(), file);
    if (fs.existsSync(fullPath)) {
      fs.rmSync(fullPath, { recursive: true, force: true });
      console.log(`Cleared ${file}`);
    }
  });
}

// Optimize module resolution
function optimizeModules() {
  const modulesPath = path.join(process.cwd(), 'node_modules');
  const packageLockPath = path.join(process.cwd(), 'pnpm-lock.yaml');

  if (!fs.existsSync(modulesPath) || !fs.existsSync(packageLockPath)) {
    console.log('Running clean install...');
    require('child_process').execSync('pnpm install --prefer-offline', {
      stdio: 'inherit'
    });
  }
}

// Main optimization function
async function optimizeBuild() {
  console.log('🔄 Starting build optimization...');

  // Clean unnecessary files
  cleanBuildFiles();

  // Optimize modules
  optimizeModules();

  // Set environment variables
  process.env.NEXT_TELEMETRY_DISABLED = '1';
  process.env.NODE_OPTIONS = '--max_old_space_size=3072';
  
  console.log('✅ Build optimization complete');
}

optimizeBuild().catch(console.error);
