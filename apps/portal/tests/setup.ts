import { beforeAll } from 'vitest';

beforeAll(() => {
  // Mock environment variables
  process.env.REDIS_URL = 'redis://localhost:6379';
  process.env.LOG_LEVEL = 'debug';
  process.env.AUTH_SECRET = 'test_secret_key_min_32_chars_long_for_testing';
  process.env.JWT_SECRET = 'test_jwt_secret_key_min_32_chars_long_for_testing';
  process.env.JWT_REFRESH_SECRET = 'test_jwt_refresh_secret_key_min_32_chars_long';
  process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY = 'test_key';
  process.env.DATABASE_URL = 'postgresql://user:pass@localhost:5432/test';
  process.env.API_KEY = 'test_api_key';
  process.env.VERCEL_API_TOKEN = 'test_vercel_token';
  process.env.VERCEL_URL = 'localhost:3000';
  process.env.VERCEL_REGION = 'dev1';
  process.env.NEXT_PUBLIC_API_URL = 'http://localhost:3000/api';
  process.env.ENABLE_API_LOGGING = 'true';
  process.env.ENABLE_PERFORMANCE_MONITORING = 'true';
  process.env.WEBHOOK_SECRET_DEMA = 'test_webhook_secret_dema';
  process.env.WEBHOOK_SECRET_FLUXER = 'test_webhook_secret_fluxer';
  process.env.WEBHOOK_SECRET_BELTZ247 = 'test_webhook_secret_beltz247';
  process.env.WEBHOOK_SECRET_DEVISSCHERE = 'test_webhook_secret_devisschere';
  process.env.WEBHOOK_SECRET_ACCU = 'test_webhook_secret_accu';
  process.env.INVENTORY_API_KEYS = 'test_inventory_api_key';
});
