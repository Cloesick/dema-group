import { readFileSync } from 'fs';
import { join } from 'path';
import { z } from 'zod';

// Define required environment variables
const envSchema = z.object({
  AUTH_SECRET: z.string().min(1),
  NEXTAUTH_URL: z.string().url(),
  DATABASE_URL: z.string().min(1),
  API_KEY: z.string().min(1)
});

// Define package.json requirements
const packageSchema = z.object({
  dependencies: z.record(z.string(), z.string()),
  devDependencies: z.record(z.string(), z.string())
});

function validateEnvironment() {
  try {
    envSchema.parse(process.env);
    console.log('✅ Environment variables validated');
  } catch (error) {
    console.error('❌ Environment validation failed:', error);
    process.exit(1);
  }
}

function validateDependencies() {
  try {
    const pkg = JSON.parse(readFileSync('package.json', 'utf8'));
    packageSchema.parse(pkg);
    
    // Check for specific version requirements
    const requiredVersions = {
      'next': '^16.0.0',
      'react': '^18.2.0',
      'react-dom': '^18.2.0'
    };

    for (const [dep, version] of Object.entries(requiredVersions)) {
      if (!pkg.dependencies[dep]?.startsWith(version.replace('^', ''))) {
        throw new Error(`${dep} version must be ${version}`);
      }
    }
    
    console.log('✅ Dependencies validated');
  } catch (error) {
    console.error('❌ Dependency validation failed:', error);
    process.exit(1);
  }
}

function validateTypeScript() {
  try {
    const result = require('child_process').spawnSync('pnpm', ['type-check'], {
      stdio: 'inherit'
    });
    
    if (result.status !== 0) {
      throw new Error('TypeScript validation failed');
    }
    
    console.log('✅ TypeScript validation passed');
  } catch (error) {
    console.error('❌ TypeScript validation failed:', error);
    process.exit(1);
  }
}

function validateBuild() {
  try {
    // Check if .next directory exists and has required files
    const buildFiles = ['server', 'static', 'BUILD_ID'];
    for (const file of buildFiles) {
      const path = join('.next', file);
      if (!require('fs').existsSync(path)) {
        throw new Error(`Missing build file: ${path}`);
      }
    }
    
    console.log('✅ Build validation passed');
  } catch (error) {
    console.error('❌ Build validation failed:', error);
    process.exit(1);
  }
}

// Run all validations
console.log('🔍 Starting deployment validation...');
validateEnvironment();
validateDependencies();
validateTypeScript();
validateBuild();
console.log('✅ All validations passed!');
