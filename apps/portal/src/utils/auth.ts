import { z } from 'zod';
import { sign, verify } from 'jsonwebtoken';
import { redis } from '@/utils/redis';

const SALT_ROUNDS = 12;
const TOKEN_EXPIRY = '15m';
const REFRESH_TOKEN_EXPIRY = '7d';

const userSchema = z.object({
  email: z.string().email(),
  password: z.string().min(12)
});

interface AuthResult {
  status: 'success' | 'invalid' | 'blocked';
  token?: string;
  refreshToken?: string;
  duration?: number;
  errors?: string[];
}

export async function authenticateUser({
  email,
  password
}: {
  email: string;
  password: string;
}): Promise<AuthResult> {
  // Check password complexity
  if (!isPasswordComplex(password)) {
    return {
      status: 'invalid',
      errors: ['password_complexity']
    };
  }

  // Check rate limiting
  const attempts = await redis.incr(`auth:${email}`);
  if (attempts > 5) {
    await redis.expire(`auth:${email}`, 900); // 15 minutes
    return {
      status: 'blocked',
      duration: 900 // 15 minutes
    };
  }

  // Validate input
  try {
    userSchema.parse({ email, password });
  } catch (error: unknown) {
    return {
      status: 'invalid',
      errors: ['invalid_input']
    };
  }

  // TODO: Implement actual user lookup and password verification
  const user = { id: '1', email };
  const token = generateToken(user);
  const refreshToken = generateRefreshToken(user);

  return {
    status: 'success',
    token,
    refreshToken
  };
}

export async function validateToken(
  token: string
): Promise<{
  valid: boolean;
  error?: string;
}> {
  try {
    // Check if token is revoked
    const isRevoked = await redis.get(`revoked:${token}`);
    if (isRevoked) {
      return {
        valid: false,
        error: 'token_revoked'
      };
    }

    // Verify token
    verify(token, process.env.JWT_SECRET || 'test_jwt_secret_key_min_32_chars_long_for_testing');
    return { valid: true };
  } catch (error: unknown) {
    const err = error as { name: string };
    if (err.name === 'TokenExpiredError') {
      return {
        valid: false,
        error: 'token_expired'
      };
    }
    return {
      valid: false,
      error: 'token_invalid'
    };
  }
}

export async function revokeToken(token: string): Promise<void> {
  await redis.set(`revoked:${token}`, '1', 'EX', 86400); // 24 hours
}

function generateToken(user: { id: string; email: string }): string {
  return sign(
    { sub: user.id, email: user.email },
    process.env.JWT_SECRET!,
    { expiresIn: TOKEN_EXPIRY }
  );
}

function generateRefreshToken(user: { id: string }): string {
  return sign(
    { sub: user.id },
    process.env.JWT_REFRESH_SECRET!,
    { expiresIn: REFRESH_TOKEN_EXPIRY }
  );
}

function isPasswordComplex(password: string): boolean {
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  
  return (
    hasUpperCase &&
    hasLowerCase &&
    hasNumbers &&
    hasSpecialChar
  );
}
