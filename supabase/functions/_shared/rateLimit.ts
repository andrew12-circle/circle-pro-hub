/**
 * Distributed rate limiting using Supabase database
 * Replaces in-memory Map-based limiter with persistent storage
 */

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number;
}

export async function checkRateLimit(
  supabaseUrl: string,
  supabaseServiceKey: string,
  key: string,
  windowMs: number = 60000,
  maxRequests: number = 100
): Promise<RateLimitResult> {
  try {
    const response = await fetch(
      `${supabaseUrl}/rest/v1/rpc/increment_rate_limit`,
      {
        method: "POST",
        headers: {
          apikey: supabaseServiceKey,
          Authorization: `Bearer ${supabaseServiceKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          p_key: key,
          p_window_ms: windowMs,
          p_max_requests: maxRequests,
        }),
      }
    );

    if (!response.ok) {
      console.error("Rate limit check failed:", await response.text());
      // Fail open: allow request if rate limit check fails
      return { allowed: true, remaining: maxRequests, resetAt: Date.now() + windowMs };
    }

    const result = await response.json();
    
    return {
      allowed: result.allowed,
      remaining: result.remaining,
      resetAt: result.resetAt,
    };
  } catch (error) {
    console.error("Rate limit error:", error);
    // Fail open: allow request if rate limit check fails
    return { allowed: true, remaining: maxRequests, resetAt: Date.now() + windowMs };
  }
}

export function getRateLimitHeaders(result: RateLimitResult): Record<string, string> {
  return {
    "X-RateLimit-Remaining": String(result.remaining),
    "X-RateLimit-Reset": new Date(result.resetAt).toISOString(),
  };
}
