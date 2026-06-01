/**
 * Simple in-memory IP-based rate limiter for serverless Route Handlers.
 *
 * Each serverless instance has its own map, so this is per-instance, not
 * global — that's acceptable for abuse prevention without Redis.
 * For a true distributed limit, replace with an upstash/redis adapter.
 */

interface RateLimitEntry {
  count: number
  resetAt: number
}

const store = new Map<string, RateLimitEntry>()

interface RateLimitOptions {
  /** Maximum requests allowed in the window */
  limit: number
  /** Window duration in milliseconds */
  windowMs: number
}

interface RateLimitResult {
  allowed: boolean
  remaining: number
  resetAt: number
}

export function checkRateLimit(
  ip: string,
  { limit, windowMs }: RateLimitOptions,
): RateLimitResult {
  const now = Date.now()
  const existing = store.get(ip)

  if (!existing || now >= existing.resetAt) {
    // First request in this window (or window has expired)
    const entry: RateLimitEntry = { count: 1, resetAt: now + windowMs }
    store.set(ip, entry)
    return { allowed: true, remaining: limit - 1, resetAt: entry.resetAt }
  }

  if (existing.count >= limit) {
    return { allowed: false, remaining: 0, resetAt: existing.resetAt }
  }

  existing.count += 1
  return { allowed: true, remaining: limit - existing.count, resetAt: existing.resetAt }
}
