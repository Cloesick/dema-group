import { z } from 'zod'
import type { RateLimitConfig } from '@/types/cache'

// Cache validation schemas
export const cacheKeySchema = z.string().min(1).max(512)

export const cacheTTLSchema = z.object({
  SHORT: z.number().int().min(1),
  MEDIUM: z.number().int().min(1),
  LONG: z.number().int().min(1),
  VERY_LONG: z.number().int().min(1)
})

export const cacheEntrySchema = z.object({
  key: cacheKeySchema,
  value: z.unknown(),
  ttl: z.number().int().min(1)
})

export const cacheOptionsSchema = z.object({
  ttl: z.number().int().min(1).optional(),
  prefix: z.enum(['INVENTORY', 'PRODUCT', 'USER', 'SESSION', 'RATE_LIMIT']).optional()
})

// Rate limiting validation
export const rateLimitConfigSchema = z.object({
  key: z.string().min(1),
  limit: z.number().int().min(1),
  window: z.number().int().min(1),
  errorMessage: z.string().optional()
}).transform((data): RateLimitConfig => ({
  key: `rate:${data.key}`,
  limit: data.limit,
  window: data.window,
  errorMessage: data.errorMessage || 'Rate limit exceeded'
}))

// Redis configuration validation
export const redisConfigSchema = z.object({
  url: z.string().url(),
  maxRetriesPerRequest: z.number().int().min(1).max(10).default(3),
  connectTimeout: z.number().int().min(1000).max(30000).default(10000),
  maxReconnectAttempts: z.number().int().min(1).max(20).default(10),
  retryBackoff: z.number().int().min(100).max(5000).default(200)
})

// Error messages
export const errorMessages = {
  INVALID_CACHE_KEY: 'Invalid cache key',
  INVALID_CACHE_TTL: 'Invalid cache TTL',
  INVALID_CACHE_ENTRY: 'Invalid cache entry',
  INVALID_CACHE_OPTIONS: 'Invalid cache options',
  INVALID_RATE_LIMIT_CONFIG: 'Invalid rate limit configuration',
  INVALID_REDIS_CONFIG: 'Invalid Redis configuration'
} as const

// Validation helper
export function validate<T>(schema: z.ZodSchema<T>, data: unknown, errorMessage: string): T {
  try {
    return schema.parse(data)
  } catch (error) {
    if (error instanceof z.ZodError) {
      const details = error.issues.map((issue: z.ZodIssue) => `${issue.path.join('.')}: ${issue.message}`).join(', ')
      throw new Error(`${errorMessage}: ${details}`)
    }
    throw error
  }
}
