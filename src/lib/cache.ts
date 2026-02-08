/**
 * Search result caching with Redis support
 * Falls back to in-memory for development
 */

import { Redis } from '@upstash/redis'

// In-memory cache for development
const memoryCache = new Map<string, { data: unknown; expiresAt: number }>()

// Clean up expired entries every 10 minutes
if (typeof globalThis !== 'undefined' && typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now()
    for (const [key, entry] of memoryCache.entries()) {
      if (entry.expiresAt < now) {
        memoryCache.delete(key)
      }
    }
  }, 10 * 60 * 1000)
}

/**
 * Get Redis client (returns null if not configured)
 */
function getRedisClient(): Redis | null {
  const url = process.env.UPSTASH_REDIS_REST_URL
  const token = process.env.UPSTASH_REDIS_REST_TOKEN

  if (!url || !token) {
    return null
  }

  try {
    return new Redis({ url, token })
  } catch (error) {
    console.error('[Cache] Failed to initialize Redis:', error)
    return null
  }
}

/**
 * Generate cache key from search parameters
 */
export function createCacheKey(
  startTimestamp: number,
  endTimestamp: number,
  filters?: { decades?: string[]; chartPositions?: string[]; showOnlyNumber1?: boolean }
): string {
  const filterStr = filters
    ? JSON.stringify({
        d: filters.decades?.sort(),
        c: filters.chartPositions?.sort(),
        n1: filters.showOnlyNumber1,
      })
    : ''
  return `search:${startTimestamp}:${endTimestamp}:${filterStr}`
}

/**
 * Get cached value
 */
export async function getCache<T>(key: string): Promise<T | null> {
  const redis = getRedisClient()

  if (redis) {
    try {
      const data = await redis.get<T>(key)
      if (data) {
        console.log('[Cache] Redis HIT:', key.substring(0, 50))
      }
      return data
    } catch (error) {
      console.error('[Cache] Redis get error:', error)
    }
  }

  // Fall back to memory cache
  const entry = memoryCache.get(key)
  if (entry && entry.expiresAt > Date.now()) {
    console.log('[Cache] Memory HIT:', key.substring(0, 50))
    return entry.data as T
  }

  return null
}

/**
 * Set cached value with TTL
 */
export async function setCache<T>(key: string, value: T, ttlSeconds: number = 3600): Promise<void> {
  const redis = getRedisClient()

  if (redis) {
    try {
      await redis.setex(key, ttlSeconds, JSON.stringify(value))
      console.log('[Cache] Redis SET:', key.substring(0, 50))
      return
    } catch (error) {
      console.error('[Cache] Redis set error:', error)
    }
  }

  // Fall back to memory cache
  memoryCache.set(key, {
    data: value,
    expiresAt: Date.now() + ttlSeconds * 1000,
  })
  console.log('[Cache] Memory SET:', key.substring(0, 50))
}

/**
 * Cache TTL constants
 */
export const CACHE_TTL = {
  SEARCH_RESULTS: 3600, // 1 hour - search results don't change often
  SUGGESTIONS: 86400, // 24 hours - suggestions are stable
} as const
