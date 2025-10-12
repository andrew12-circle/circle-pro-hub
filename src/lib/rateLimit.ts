/**
 * Rate limiting (stub implementation)
 * In production, this would use Redis or a distributed cache
 */

interface RateLimitConfig {
  windowMs?: number;
  maxRequests?: number;
}

// In-memory store for rate limit tracking
const rateLimitStore = new Map<string, { count: number; resetAt: number }>();

export function rateLimit(
  key: string,
  config: RateLimitConfig = {}
): { allowed: boolean; remaining: number; resetAt: number } {
  const { windowMs = 60000, maxRequests = 100 } = config;
  const now = Date.now();
  const record = rateLimitStore.get(key);

  // Clean up expired entries
  if (record && now >= record.resetAt) {
    rateLimitStore.delete(key);
  }

  const existing = rateLimitStore.get(key);

  if (!existing) {
    // First request in window
    rateLimitStore.set(key, {
      count: 1,
      resetAt: now + windowMs,
    });

    return {
      allowed: true,
      remaining: maxRequests - 1,
      resetAt: now + windowMs,
    };
  }

  if (existing.count >= maxRequests) {
    // Rate limit exceeded
    return {
      allowed: false,
      remaining: 0,
      resetAt: existing.resetAt,
    };
  }

  // Increment count
  existing.count += 1;
  rateLimitStore.set(key, existing);

  return {
    allowed: true,
    remaining: maxRequests - existing.count,
    resetAt: existing.resetAt,
  };
}

export function getRateLimitHeaders(result: {
  remaining: number;
  resetAt: number;
}): Record<string, string> {
  return {
    "X-RateLimit-Remaining": String(result.remaining),
    "X-RateLimit-Reset": new Date(result.resetAt).toISOString(),
  };
}

// Cleanup old entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, record] of rateLimitStore.entries()) {
    if (now >= record.resetAt) {
      rateLimitStore.delete(key);
    }
  }
}, 60000); // Clean every minute
