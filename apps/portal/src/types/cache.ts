import type { Redis } from 'ioredis'

export type CacheTTL = {
  readonly SHORT: number
  readonly MEDIUM: number
  readonly LONG: number
  readonly VERY_LONG: number
}

export type CachePrefix = {
  readonly INVENTORY: string
  readonly PRODUCT: string
  readonly USER: string
  readonly SESSION: string
  readonly RATE_LIMIT: string
}

export type CacheEntry<T> = {
  key: string
  value: T
  ttl: number
}

export type CacheOptions = {
  ttl?: number
  prefix?: keyof CachePrefix
}

export interface CacheClient extends Redis {
  withCache: <T>(key: string, fn: () => Promise<T>, options?: CacheOptions) => Promise<T>
  mset: <T>(entries: CacheEntry<T>[]) => Promise<void>
  mget: <T>(keys: string[]) => Promise<Array<T | null>>
  invalidate: (key: string) => Promise<void>
  invalidatePattern: (pattern: string) => Promise<void>
  invalidatePrefix: (prefix: keyof CachePrefix) => Promise<void>
}

export type RateLimitConfig = {
  key: string
  limit: number
  window: number
  errorMessage?: string
}

export type RateLimitResult = {
  allowed: boolean
  remaining: number
  reset: number
}
