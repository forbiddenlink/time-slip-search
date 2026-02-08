import { describe, it, expect, beforeEach, jest } from '@jest/globals'
import { checkRateLimit, getClientIdentifier } from '@/lib/rate-limit'

// Mock @upstash/redis since we're testing the in-memory fallback
jest.mock('@upstash/redis', () => ({
  Redis: jest.fn(() => null),
}))

describe('Rate Limiting', () => {
  beforeEach(() => {
    // Clear rate limit store before each test
    jest.clearAllMocks()
  })

  describe('checkRateLimit', () => {
    it('should allow first request', async () => {
      const result = await checkRateLimit('test-client-1', 30, 60000)
      expect(result.allowed).toBe(true)
      expect(result.remaining).toBe(29)
    })

    it('should track multiple requests', async () => {
      const clientId = 'test-client-2'

      // First request
      const first = await checkRateLimit(clientId, 3, 60000)
      expect(first.allowed).toBe(true)
      expect(first.remaining).toBe(2)

      // Second request
      const second = await checkRateLimit(clientId, 3, 60000)
      expect(second.allowed).toBe(true)
      expect(second.remaining).toBe(1)

      // Third request
      const third = await checkRateLimit(clientId, 3, 60000)
      expect(third.allowed).toBe(true)
      expect(third.remaining).toBe(0)
    })

    it('should block requests after limit exceeded', async () => {
      const clientId = 'test-client-3'

      // Make 3 requests (limit)
      await checkRateLimit(clientId, 3, 60000)
      await checkRateLimit(clientId, 3, 60000)
      await checkRateLimit(clientId, 3, 60000)

      // Fourth request should be blocked
      const fourth = await checkRateLimit(clientId, 3, 60000)
      expect(fourth.allowed).toBe(false)
      expect(fourth.remaining).toBe(0)
    })

    it('should reset after time window expires', async () => {
      const clientId = 'test-client-4'
      const windowMs = 100 // 100ms window for testing

      // Use up all requests
      await checkRateLimit(clientId, 2, windowMs)
      await checkRateLimit(clientId, 2, windowMs)

      // Should be blocked
      const blocked = await checkRateLimit(clientId, 2, windowMs)
      expect(blocked.allowed).toBe(false)

      // Wait for window to expire
      await new Promise<void>((resolve) => {
        setTimeout(async () => {
          const reset = await checkRateLimit(clientId, 2, windowMs)
          expect(reset.allowed).toBe(true)
          expect(reset.remaining).toBe(1)
          resolve()
        }, 150)
      })
    }, 10000)

    it('should handle concurrent clients independently', async () => {
      const result1 = await checkRateLimit('client-a', 2, 60000)
      const result2 = await checkRateLimit('client-b', 2, 60000)

      expect(result1.allowed).toBe(true)
      expect(result2.allowed).toBe(true)

      // Use up client-a's limit
      await checkRateLimit('client-a', 2, 60000)
      const blocked = await checkRateLimit('client-a', 2, 60000)

      // client-b should still have requests
      const clientB = await checkRateLimit('client-b', 2, 60000)

      expect(blocked.allowed).toBe(false)
      expect(clientB.allowed).toBe(true)
    })
  })

  describe('getClientIdentifier', () => {
    // Helper to create a mock request
    const mockRequest = (headers: Record<string, string>) => {
      return {
        headers: {
          get: (name: string) => headers[name] || null,
        },
      } as unknown as Request
    }

    it('should extract IP from x-forwarded-for header', () => {
      const request = mockRequest({
        'x-forwarded-for': '192.168.1.1, 10.0.0.1',
      })

      const clientId = getClientIdentifier(request)
      expect(clientId).toBe('192.168.1.1')
    })

    it('should use x-real-ip if x-forwarded-for not present', () => {
      const request = mockRequest({
        'x-real-ip': '192.168.1.2',
      })

      const clientId = getClientIdentifier(request)
      expect(clientId).toBe('192.168.1.2')
    })

    it('should return unknown if no IP headers present', () => {
      const request = mockRequest({})

      const clientId = getClientIdentifier(request)
      expect(clientId).toBe('unknown')
    })

    it('should prioritize x-forwarded-for over x-real-ip', () => {
      const request = mockRequest({
        'x-forwarded-for': '192.168.1.1',
        'x-real-ip': '192.168.1.2',
      })

      const clientId = getClientIdentifier(request)
      expect(clientId).toBe('192.168.1.1')
    })
  })
})
