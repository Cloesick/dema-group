const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const requiredFiles = [
  '.env.production',
  '.deployment-settings.json',
  'vercel.json',
  'next.config.js'
];

const requiredEnvVars = [
  'AUTH_SECRET',
  'JWT_SECRET',
  'JWT_REFRESH_SECRET',
  'REDIS_URL'
];

function checkColor(str, color) {
  const colors = {
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    reset: '\x1b[0m'
  };
  return `${colors[color]}${str}${colors.reset}`;
}

async function verifyDeployment() {
  console.log('\n🔍 Running pre-deployment checks...\n');
  let allPassed = true;
  let warnings = 0;

  // Check required files
  console.log('📁 Checking required files:');
  for (const file of requiredFiles) {
    const exists = fs.existsSync(path.join(__dirname, '..', file));
    console.log(`  ${exists ? '✓' : '✗'} ${file}`);
    if (!exists) allPassed = false;
  }

  // Check deployment settings
  console.log('\n⚙️ Checking deployment settings:');
  try {
    const settings = JSON.parse(
      fs.readFileSync(path.join(__dirname, '..', '.deployment-settings.json'), 'utf8')
    );
    
    for (const envVar of requiredEnvVars) {
      const exists = settings.environment[envVar];
      const placeholder = exists === 'YOUR_REDIS_URL_HERE';
      console.log(`  ${exists && !placeholder ? '✓' : '✗'} ${envVar}`);
      if (!exists || placeholder) allPassed = false;
    }
  } catch (error) {
    console.log(checkColor('  ✗ Error reading deployment settings', 'red'));
    allPassed = false;
  }

  // Check build
  console.log('\n🏗️ Checking build:');
  try {
    execSync('pnpm type-check', { stdio: 'inherit' });
    console.log('  ✓ TypeScript check passed');
  } catch (error) {
    console.log(checkColor('  ✗ TypeScript check failed', 'red'));
    allPassed = false;
  }

  // Check dependencies
  console.log('\n📦 Checking dependencies:');
  const pkg = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'package.json'), 'utf8'));
  const deps = { ...pkg.dependencies, ...pkg.devDependencies };
  
  const criticalDeps = ['next', 'react', 'react-dom', 'ioredis'];
  for (const dep of criticalDeps) {
    const version = deps[dep];
    console.log(`  ${version ? '✓' : '✗'} ${dep}@${version || 'missing'}`);
    if (!version) allPassed = false;
  }

  // Final report
  console.log('\n📊 Deployment Readiness Report:');
  if (allPassed) {
    console.log(checkColor('✅ All checks passed! Ready for deployment.', 'green'));
    console.log('\nTo deploy tomorrow:');
    console.log('1. cd apps/portal');
    console.log('2. node scripts/setup-deployment.js');
    console.log('3. vercel deploy --prod');
  } else {
    console.log(checkColor('❌ Some checks failed. Fix issues before deploying.', 'red'));
  }
  
  if (warnings > 0) {
    console.log(checkColor(`\n⚠️ ${warnings} warning(s) found`, 'yellow'));
  }

  return allPassed;
}

verifyDeployment().catch(console.error);
