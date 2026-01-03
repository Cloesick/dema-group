import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import Redis from 'ioredis'
import { withCache, CACHE_TTL, cacheUtils, rateLimit } from '../cache'
import { validate } from '../validation'
import type { RateLimitConfig } from '@/types/cache'

// Mock Redis
vi.mock('ioredis')

describe('Cache Module', () => {
  let redis: Redis
  
  beforeEach(() => {
    redis = new Redis()
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.resetAllMocks()
  })

  describe('withCache', () => {
    it('should return cached value if exists', async () => {
      const key = 'test-key'
      const value = { test: 'data' }
      
      vi.spyOn(redis, 'get').mockResolvedValueOnce(JSON.stringify(value))
      
      const fn = vi.fn()
      const result = await withCache(key, fn)
      
      expect(result).toEqual(value)
      expect(fn).not.toHaveBeenCalled()
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

  describe('rateLimit', () => {
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
