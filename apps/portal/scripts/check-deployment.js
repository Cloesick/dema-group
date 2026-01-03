"use strict";

const requiredEnvVars = [
  'AUTH_SECRET',
  'JWT_SECRET',
  'JWT_REFRESH_SECRET',
  'REDIS_URL',
  'NEXT_PUBLIC_GOOGLE_MAPS_API_KEY'
];

function checkEnvironment() {
  const missing = [];
  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
      missing.push(envVar);
    }
  }

  if (missing.length > 0) {
    console.error('❌ Missing required environment variables:');
    missing.forEach(v => console.error(`  - ${v}`));
    process.exit(1);
  }

  // Check Redis URL
  if (process.env.VERCEL === '1' && process.env.REDIS_URL.includes('localhost')) {
    console.error('❌ Production deployment cannot use localhost Redis URL');
    process.exit(1);
  }

  console.log('✅ All required environment variables are set');
}

checkEnvironment();
