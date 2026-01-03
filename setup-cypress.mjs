import { execSync } from 'child_process';
import { join } from 'path';

const portalDir = join(process.cwd(), 'apps', 'portal');

console.log('🚀 Setting up Cypress...\n');

try {
    // Install dependencies
    console.log('📦 Installing dependencies...');
    execSync('pnpm install', { stdio: 'inherit' });

    // Change to portal directory
    process.chdir(portalDir);
    
    // Install Cypress
    console.log('\n🔧 Installing Cypress...');
    execSync('pnpm add cypress@latest --save-dev', { stdio: 'inherit' });

    // Verify Cypress
    console.log('\n✨ Verifying Cypress...');
    execSync('pnpm exec cypress verify', { stdio: 'inherit' });

    // Open Cypress
    console.log('\n🎉 Opening Cypress...');
    execSync('pnpm exec cypress open', { stdio: 'inherit' });
} catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
}
