import { authenticateUser, validateToken, revokeToken } from '@/utils/auth';
import { createMockUser, createMockToken } from '../mocks/auth';

describe('Authentication Security', () => {
  describe('User Authentication', () => {
    it('blocks brute force attempts', async () => {
      const attempts = Array(6).fill({
        email: 'test@example.com',
        password: 'wrong'
      });

      for (const attempt of attempts) {
        await authenticateUser(attempt);
      }

      const lastAttempt = await authenticateUser({
        email: 'test@example.com',
        password: 'correct'
      });

      expect(lastAttempt.status).toBe('blocked');
      expect(lastAttempt.duration).toBe(900); // 15 minutes
    });

    it('enforces password complexity', async () => {
      const weakPasswords = [
        'short',
        'nouppercaseornumbers',
        'NOLOWERCASEORNUMBERS',
        '12345678',
        'password123'
      ];

      for (const password of weakPasswords) {
        const result = await authenticateUser({
          email: 'test@example.com',
          password
        });

        expect(result.status).toBe('invalid');
        expect(result.errors).toContain('password_complexity');
      }
    });

    it('validates session tokens', async () => {
      const user = createMockUser();
      const token = createMockToken(user);

      // Valid token
      const validResult = await validateToken(token);
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
      const result = await validateToken(token);
      expect(result.valid).toBe(false);
      expect(result.error).toBe('token_revoked');
    });
  });
});
