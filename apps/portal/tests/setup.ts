import { beforeAll } from 'vitest';

beforeAll(() => {
  // Mock environment variables
  process.env.REDIS_URL = 'redis://localhost:6379';
  process.env.LOG_LEVEL = 'debug';
  process.env.AUTH_SECRET = 'test_secret_key_min_32_chars_long_for_testing';
  process.env.JWT_SECRET = 'test_jwt_secret_key_min_32_chars_long_for_testing';
  process.env.JWT_REFRESH_SECRET = 'test_jwt_refresh_secret_key_min_32_chars_long';
  process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY = 'test_key';
});
