import { Redis } from 'ioredis';
import { NextResponse } from 'next/server';

const redis = new Redis(process.env.REDIS_URL);

interface RateLimitConfig {
  windowMs: number;    // Time window in milliseconds
  maxRequests: number; // Max requests per window
  blockDuration: number; // Duration to block if limit exceeded
}

const RATE_LIMITS: Record<string, RateLimitConfig> = {
  'auth': {
    windowMs: 15 * 60 * 1000,  // 15 minutes
    maxRequests: 5,            // 5 login attempts
    blockDuration: 60 * 60     // 1 hour block
  },
  'api': {
    windowMs: 60 * 1000,       // 1 minute
    maxRequests: 100,          // 100 requests
    blockDuration: 15 * 60     // 15 minutes block
  },
  'supplier-api': {
    windowMs: 60 * 1000,       // 1 minute
    maxRequests: 300,          // Higher limit for B2B
    blockDuration: 15 * 60     // 15 minutes block
  }
};

export async function rateLimit(
  ip: string,
  action: keyof typeof RATE_LIMITS
): Promise<boolean> {
  const config = RATE_LIMITS[action];
  const key = `rate_limit:${action}:${ip}`;
  const now = Date.now();
  const windowStart = now - config.windowMs;

  // Check if IP is blocked
  const blockKey = `rate_limit_block:${action}:${ip}`;
  const isBlocked = await redis.get(blockKey);
  if (isBlocked) {
    throw new Error('Too many requests. Please try again later.');
  }

  // Add request timestamp and get all requests in window
  await redis.zadd(key, now, now.toString());
  const requests = await redis.zrangebyscore(key, windowStart, now);

  // Remove old entries
  await redis.zremrangebyscore(key, 0, windowStart);

  // Set key expiration
  await redis.expire(key, Math.ceil(config.windowMs / 1000));

  if (requests.length > config.maxRequests) {
    // Block the IP
    await redis.setex(blockKey, config.blockDuration, '1');
    throw new Error('Rate limit exceeded. Your access has been temporarily blocked.');
  }

  return true;
}
