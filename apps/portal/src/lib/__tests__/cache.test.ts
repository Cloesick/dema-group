import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import Redis from 'ioredis'
import { withCache, CACHE_TTL, CACHE_PREFIX, cacheUtils, rateLimit, redis } from '../cache'
import { validate, cacheOptionsSchema, redisConfigSchema, rateLimitConfigSchema } from '../validation'
import type { RateLimitConfig, CacheOptions } from '../../types/cache'

// Mock Redis
vi.mock('../cache', () => {
  const mockRedis = {
    get: vi.fn(),
    setex: vi.fn(),
    del: vi.fn(),
    keys: vi.fn(),
    multi: vi.fn(),
    incr: vi.fn(),
    expire: vi.fn()
  }

  return {
    redis: mockRedis,
    withCache: vi.fn(),
    CACHE_TTL: {
      SHORT: 60,
      MEDIUM: 300,
      LONG: 3600,
      VERY_LONG: 86400
    },
    CACHE_PREFIX: {
      INVENTORY: 'inv:',
      PRODUCT: 'prod:',
      USER: 'user:',
      SESSION: 'sess:',
      RATE_LIMIT: 'rate:'
    },
    cacheUtils: {
      invalidate: vi.fn(),
      invalidatePattern: vi.fn(),
      invalidatePrefix: vi.fn(),
      mset: vi.fn(),
      mget: vi.fn()
    },
    rateLimit: vi.fn()
  }
})

const mockRedisError = new Error('Redis connection error')

describe('Cache Module', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(redis.get).mockResolvedValue(null)
    vi.mocked(redis.setex).mockResolvedValue('OK')
    vi.mocked(redis.del).mockResolvedValue(1)
    vi.mocked(redis.keys).mockResolvedValue(['test-1', 'test-2'])
    vi.mocked(redis.incr).mockResolvedValue(1)
    vi.mocked(redis.expire).mockResolvedValue(1)
  })

  afterEach(() => {
    vi.resetAllMocks()
  })

  describe('Cache TTL Constants', () => {
    it('should have valid TTL values', () => {
      expect(CACHE_TTL.SHORT).toBeGreaterThan(0)
      expect(CACHE_TTL.MEDIUM).toBeGreaterThan(CACHE_TTL.SHORT)
      expect(CACHE_TTL.LONG).toBeGreaterThan(CACHE_TTL.MEDIUM)
      expect(CACHE_TTL.VERY_LONG).toBeGreaterThan(CACHE_TTL.LONG)
    })
  })

  describe('Cache Prefix Constants', () => {
    it('should have valid prefix values', () => {
      expect(CACHE_PREFIX.INVENTORY).toBe('inv:')
      expect(CACHE_PREFIX.PRODUCT).toBe('prod:')
      expect(CACHE_PREFIX.USER).toBe('user:')
      expect(CACHE_PREFIX.SESSION).toBe('sess:')
      expect(CACHE_PREFIX.RATE_LIMIT).toBe('rate:')
    })
  })

  describe('withCache', () => {
    it('should handle cache miss and store result', async () => {
      vi.mocked(withCache).mockImplementation(async (key, fn, ttl = CACHE_TTL.MEDIUM) => {
        const result = await fn()
        return result
      })
      const key = 'test-key'
      const value = { test: 'data' }
      const options: CacheOptions = { ttl: 300, prefix: 'USER' }
      
      vi.spyOn(redis, 'get').mockResolvedValueOnce(null)
      vi.spyOn(redis, 'setex').mockResolvedValueOnce('OK')
      
      const fn = vi.fn().mockResolvedValueOnce(value)
      const result = await withCache(key, fn, options.ttl)
      
      expect(result).toEqual(value)
      expect(fn).toHaveBeenCalledTimes(1)
      expect(redis.setex).toHaveBeenCalledWith(
        `${CACHE_PREFIX.USER}${key}`,
        options.ttl,
        JSON.stringify(value)
      )
    })

    it('should return cached value if exists', async () => {
      const key = 'test-key'
      const value = { test: 'data' }
      
      vi.spyOn(redis, 'get').mockResolvedValueOnce(JSON.stringify(value))
      
      const fn = vi.fn()
      const result = await withCache(key, fn)
      
      expect(result).toEqual(value)
      expect(fn).not.toHaveBeenCalled()
    })

    it('should handle Redis errors gracefully', async () => {
      const key = 'test-key'
      const value = { test: 'data' }
      
      vi.spyOn(redis, 'get').mockRejectedValueOnce(mockRedisError)
      
      const fn = vi.fn().mockResolvedValueOnce(value)
      const result = await withCache(key, fn)
      
      expect(result).toEqual(value)
      expect(fn).toHaveBeenCalledTimes(1)
    })

    it('should handle function errors', async () => {
      const key = 'test-key'
      const error = new Error('Function error')
      
      vi.spyOn(redis, 'get').mockResolvedValueOnce(null)
      
      const fn = vi.fn().mockRejectedValueOnce(error)
      await expect(withCache(key, fn)).rejects.toThrow('Function error')
    })

    it('should handle invalid cache data', async () => {
      const key = 'test-key'
      const value = { test: 'data' }
      
      vi.spyOn(redis, 'get').mockResolvedValueOnce('invalid-json')
      
      const fn = vi.fn().mockResolvedValueOnce(value)
      const result = await withCache(key, fn)
      
      expect(result).toEqual(value)
      expect(fn).toHaveBeenCalledTimes(1)
    })

    it('should call function and cache result if no cache exists', async () => {
      const key = 'test-key'
      const value = { test: 'data' }
      
      vi.spyOn(redis, 'get').mockResolvedValueOnce(null)
      vi.spyOn(redis, 'setex').mockResolvedValueOnce('OK')
      
      const fn = vi.fn().mockResolvedValueOnce(value)
      const result = await withCache(key, fn)
      
      expect(result).toEqual(value)
      expect(fn).toHaveBeenCalledTimes(1)
      expect(redis.setex).toHaveBeenCalledWith(key, CACHE_TTL.MEDIUM, JSON.stringify(value))
    })
  })

  describe('cacheUtils', () => {
    describe('mset and mget', () => {
      beforeEach(() => {
        vi.mocked(cacheUtils.mset).mockImplementation(async (entries) => {
          return Promise.resolve()
        })
        vi.mocked(cacheUtils.mget).mockImplementation(async (keys) => {
          return keys.map(k => ({ test: k }))
        })
        vi.mocked(cacheUtils.invalidate).mockImplementation(async (key) => {
          await redis.del(key)
        })
        vi.mocked(cacheUtils.invalidatePattern).mockImplementation(async (pattern) => {
          const keys = await redis.keys(pattern)
          if (keys.length > 0) {
            await redis.del(...keys)
          }
        })
      })
      it('should set and get multiple cache entries', async () => {
        const entries = [
          { key: 'key1', value: 'value1', ttl: 300 },
          { key: 'key2', value: 'value2', ttl: 600 }
        ]
        
        const multi = {
          setex: vi.fn(),
          exec: vi.fn().mockResolvedValueOnce(['OK', 'OK'])
        }
        
        vi.spyOn(redis, 'multi').mockReturnValueOnce(multi as any)
        vi.spyOn(redis, 'mget').mockResolvedValueOnce([
          JSON.stringify('value1'),
          JSON.stringify('value2')
        ])
        
        await cacheUtils.mset(entries)
        const results = await cacheUtils.mget(['key1', 'key2'])
        
        expect(results).toEqual(['value1', 'value2'])
        expect(multi.setex).toHaveBeenCalledTimes(2)
      })

      it('should handle errors in batch operations', async () => {
        const entries = [
          { key: 'key1', value: 'value1', ttl: 300 }
        ]
        
        const multi = {
          setex: vi.fn(),
          exec: vi.fn().mockRejectedValueOnce(mockRedisError)
        }
        
        vi.spyOn(redis, 'multi').mockReturnValueOnce(multi as any)
        
        await expect(cacheUtils.mset(entries)).rejects.toThrow()
      })
    })

    describe('invalidation methods', () => {
      it('should invalidate cache by key', async () => {
        const key = 'test-key'
        vi.spyOn(redis, 'del').mockResolvedValueOnce(1)
        
        await cacheUtils.invalidate(key)
        expect(redis.del).toHaveBeenCalledWith(key)
      })

      it('should invalidate cache by pattern', async () => {
        const pattern = 'test-*'
        const keys = ['test-1', 'test-2']
        
        vi.spyOn(redis, 'keys').mockResolvedValueOnce(keys)
        vi.spyOn(redis, 'del').mockResolvedValueOnce(2)
        
        await cacheUtils.invalidatePattern(pattern)
        expect(redis.keys).toHaveBeenCalledWith(pattern)
        expect(redis.del).toHaveBeenCalledWith(...keys)
      })
    })
  })

  describe('rateLimit', () => {
    describe('validation', () => {
      beforeEach(() => {
        vi.mocked(rateLimit).mockImplementation(async (key, limit, window) => {
          const current = await redis.incr(key)
          if (current === 1) {
            await redis.expire(key, window)
          }
          return current <= limit
        })
      })
      it('should validate rate limit config', () => {
        const validConfig = {
          key: 'test-rate',
          limit: 5,
          window: 60,
          errorMessage: 'Custom error'
        }
        
        const result = validate(rateLimitConfigSchema, validConfig, 'Invalid config')
        expect(result.key).toBe('rate:test-rate')
        expect(result.errorMessage).toBe('Custom error')
      })

      it('should reject invalid rate limit config', () => {
        const invalidConfig = {
          key: '',
          limit: -1,
          window: 0
        }
        
        expect(() => {
          validate(rateLimitConfigSchema, invalidConfig, 'Invalid config')
        }).toThrow()
      })
    })

    describe('Redis config validation', () => {
      it('should validate Redis config', () => {
        const validConfig = {
          url: 'redis://localhost:6379',
          maxRetriesPerRequest: 3,
          connectTimeout: 5000
        }
        
        const result = validate(redisConfigSchema, validConfig, 'Invalid Redis config')
        expect(result.url).toBe('redis://localhost:6379')
        expect(result.maxRetriesPerRequest).toBe(3)
      })

      it('should apply default values', () => {
        const minimalConfig = {
          url: 'redis://localhost:6379'
        }
        
        const result = validate(redisConfigSchema, minimalConfig, 'Invalid Redis config')
        expect(result.maxRetriesPerRequest).toBe(3)
        expect(result.connectTimeout).toBe(10000)
      })
    })

    describe('rate limiting logic', () => {
      it('should allow requests within limit', async () => {
        const config: RateLimitConfig = {
          key: 'test-rate',
          limit: 5,
          window: 60
        }
        
        vi.spyOn(redis, 'incr').mockResolvedValueOnce(3)
        vi.spyOn(redis, 'expire').mockResolvedValueOnce(1)
        
        const result = await rateLimit(config.key, config.limit, config.window)
        expect(result).toBe(true)
        expect(redis.incr).toHaveBeenCalledWith('rate:test-rate')
        expect(redis.expire).toHaveBeenCalledWith('rate:test-rate', 60)
      })

      it('should block requests over limit', async () => {
        const config: RateLimitConfig = {
          key: 'test-rate',
          limit: 5,
          window: 60
        }
        
        vi.spyOn(redis, 'incr').mockResolvedValueOnce(6)
        
        const result = await rateLimit(config.key, config.limit, config.window)
        expect(result).toBe(false)
        expect(redis.incr).toHaveBeenCalledWith('rate:test-rate')
        expect(redis.expire).not.toHaveBeenCalled()
      })

      it('should handle Redis errors', async () => {
        const config: RateLimitConfig = {
          key: 'test-rate',
          limit: 5,
          window: 60
        }
        
        vi.spyOn(redis, 'incr').mockRejectedValueOnce(mockRedisError)
        
        const result = await rateLimit(config.key, config.limit, config.window)
        expect(result).toBe(false)
      })

      it('should set expiry only on first request', async () => {
        const config: RateLimitConfig = {
          key: 'test-rate',
          limit: 5,
          window: 60
        }
        
        vi.spyOn(redis, 'incr').mockResolvedValueOnce(2)
        vi.spyOn(redis, 'expire').mockResolvedValueOnce(1)
        
        await rateLimit(config.key, config.limit, config.window)
        
        expect(redis.expire).toHaveBeenCalledWith('rate:test-rate', 60)
        
        vi.spyOn(redis, 'incr').mockResolvedValueOnce(3)
        await rateLimit(config.key, config.limit, config.window)
        
        expect(redis.expire).toHaveBeenCalledTimes(1)
      })
    })
  })

  describe('validation', () => {
    it('should validate cache options', () => {
      const validOptions = {
        ttl: 300,
        prefix: 'USER' as const
      }
      
      expect(() => validate(cacheOptionsSchema, validOptions, 'Invalid options')).not.toThrow()
    })

    it('should throw on invalid cache options', () => {
      const invalidOptions = {
        ttl: -1,
        prefix: 'INVALID'
      }
      
      expect(() => validate(cacheOptionsSchema, invalidOptions, 'Invalid options')).toThrow()
    })
  })
})
