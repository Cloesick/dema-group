import { describe, it, expect, vi, beforeEach } from 'vitest';
import { authenticateUser, validateToken, revokeToken } from '@/utils/auth';
import { createMockUser, createMockToken } from '../mocks/auth';
import { redis } from '@/utils/redis';

vi.mock('@/utils/redis', () => ({
  redis: {
    incr: vi.fn(),
    expire: vi.fn(),
    get: vi.fn(),
    set: vi.fn(),
    del: vi.fn()
  }
}));

describe('Authentication Security', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(redis.incr).mockResolvedValue(1);
    vi.mocked(redis.expire).mockResolvedValue(1);
    vi.mocked(redis.get).mockResolvedValue(null);
    vi.mocked(redis.set).mockResolvedValue('OK');
    vi.mocked(redis.del).mockResolvedValue(1);
  });
  describe('User Authentication', () => {
    it('blocks brute force attempts', async () => {
      vi.mocked(redis.incr).mockResolvedValueOnce(6);
      vi.mocked(redis.expire).mockResolvedValueOnce(1);

      const lastAttempt = await authenticateUser({
        email: 'test@example.com',
        password: 'ValidP@ssw0rd123'
      });

      expect(lastAttempt.status).toBe('blocked');
      expect(lastAttempt.duration).toBe(900); // 15 minutes
    });

    it('enforces password complexity', async () => {
      const result = await authenticateUser({
        email: 'test@example.com',
        password: 'password123'
      });

      expect(result.status).toBe('invalid');
      expect(result.errors).toContain('password_complexity');
    });

    it('validates session tokens', async () => {
      const user = createMockUser();
      const token = createMockToken(user);

      // Valid token
      vi.mocked(redis.get).mockResolvedValueOnce(null);
      process.env.JWT_SECRET = 'test_jwt_secret_key_min_32_chars_long_for_testing';
      const validToken = createMockToken(user, { expired: false });
      const validResult = await validateToken(validToken);
      expect(validResult.valid).toBe(true);

      // Expired token
      const expiredToken = createMockToken(user, { expired: true });
      const expiredResult = await validateToken(expiredToken);
      expect(expiredResult.valid).toBe(false);
      expect(expiredResult.error).toBe('token_expired');

      // Tampered token
      const tamperedToken = token.slice(0, -5) + 'xxxxx';
      const tamperedResult = await validateToken(tamperedToken);
      expect(tamperedResult.valid).toBe(false);
      expect(tamperedResult.error).toBe('token_invalid');
    });

    it('handles token revocation', async () => {
      const user = createMockUser();
      const token = createMockToken(user);

      // Revoke token
      await revokeToken(token);

      // Attempt to use revoked token
      vi.mocked(redis.get).mockResolvedValue('1');
      const result = await validateToken(token);
      expect(result.valid).toBe(false);
      expect(result.error).toBe('token_revoked');
    });
  });
});
