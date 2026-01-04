const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

async function setupDeployment() {
  try {
    // Read deployment settings
    const settingsPath = path.join(__dirname, '..', '.deployment-settings.json');
    const settings = JSON.parse(fs.readFileSync(settingsPath, 'utf8'));

    // Set environment variables
    console.log('Setting up environment variables...');
    for (const [key, value] of Object.entries(settings.environment)) {
      execSync(`vercel env add ${key} ${value}`, { stdio: 'inherit' });
    }

    console.log('\nEnvironment variables set successfully!');
    console.log('\nNext steps:');
    console.log('1. Run: vercel deploy --prod');
    console.log('2. Monitor the deployment in the Vercel dashboard');
    console.log('3. Once complete, verify the application at:', settings.environment.VERCEL_URL);

  } catch (error) {
    console.error('Error setting up deployment:', error);
    process.exit(1);
  }
}

setupDeployment();
