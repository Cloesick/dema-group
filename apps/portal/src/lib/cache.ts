import Redis from 'ioredis'
import type { Redis as RedisType, RedisOptions } from 'ioredis'
import { validateEnv } from './env'

type ErrorWithMessage = { message: string }

// Cache TTLs in seconds
export const CACHE_TTL = {
  SHORT: 60,          // 1 minute
  MEDIUM: 300,        // 5 minutes
  LONG: 3600,        // 1 hour
  VERY_LONG: 86400,  // 24 hours
} as const

// Cache keys prefixes
export const CACHE_PREFIX = {
  INVENTORY: 'inv:',
  PRODUCT: 'prod:',
  USER: 'user:',
  SESSION: 'sess:',
  RATE_LIMIT: 'rate:',
} as const

// Redis client with error handling and auto-reconnect
const createRedisClient = (): RedisType => {
  const options: RedisOptions = {
    maxRetriesPerRequest: 3,
    retryStrategy: (times: number): number | void => {
      const delay = Math.min(times * 50, 2000)
      return delay
    },
    reconnectOnError: (err: ErrorWithMessage): boolean => {
      const targetError = 'READONLY'
      return err.message.includes(targetError)
    }
  }

  const client = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', options)

  client.on('error', (error: ErrorWithMessage) => {
    console.error('Redis Client Error:', error)
  })

  client.on('connect', () => {
    console.info('Redis Client Connected')
  })

  return client
}

export const redis = createRedisClient()

// Cache wrapper for async functions
export async function withCache<T>(
  key: string,
  fn: () => Promise<T>,
  ttl: number = CACHE_TTL.MEDIUM
): Promise<T> {
  try {
    // Try to get from cache first
    const cached = await redis.get(key)
    if (cached) {
      return JSON.parse(cached) as T
    }

    // If not in cache, execute function
    const result = await fn()

    // Store in cache
    await redis.setex(
      key,
      ttl,
      JSON.stringify(result)
    )

    return result
  } catch (error) {
    console.error(`Cache error for key ${key}:`, error)
    // On cache error, just execute the function
    return fn()
  }
}

// Cache invalidation helpers
export const cacheUtils = {
  async invalidate(key: string): Promise<void> {
    await redis.del(key)
  },

  async invalidatePattern(pattern: string): Promise<void> {
    const keys = await redis.keys(pattern)
    if (keys.length > 0) {
      await redis.del(...keys)
    }
  },

  async invalidatePrefix(prefix: string): Promise<void> {
    await this.invalidatePattern(`${prefix}*`)
  },

  // Set multiple cache entries in a transaction
  async mset(entries: Array<{ key: string; value: any; ttl: number }>) {
    const multi = redis.multi()
    
    entries.forEach(({ key, value, ttl }) => {
      multi.setex(key, ttl, JSON.stringify(value))
    })

    await multi.exec()
  },

  // Get multiple cache entries
  async mget<T>(keys: string[]): Promise<Array<T | null>> {
    const results = await redis.mget(...keys)
    return results.map((result: string | null) => result ? JSON.parse(result) : null)
  }
}

// Rate limiting helper
export async function rateLimit(
  key: string,
  limit: number,
  window: number
): Promise<boolean> {
  const current = await redis.incr(key)
  
  if (current === 1) {
    await redis.expire(key, window)
  }
  
  return current <= limit
}
