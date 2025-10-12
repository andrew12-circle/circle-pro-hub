import { generateETag, checkETag } from "./etag";
import { rateLimit, getRateLimitHeaders } from "./rateLimit";

/**
 * API response helpers for caching and rate limiting
 */

export interface ApiResponseOptions {
  data: unknown;
  status?: number;
  cacheMaxAge?: number;
  cacheSMaxAge?: number;
  staleWhileRevalidate?: number;
}

export function createCachedJsonResponse(options: ApiResponseOptions): Response {
  const {
    data,
    status = 200,
    cacheMaxAge = 60,
    cacheSMaxAge = 60,
    staleWhileRevalidate = 300,
  } = options;

  const etag = generateETag(data);
  const headers = new Headers({
    "Content-Type": "application/json",
    "Cache-Control": `public, max-age=${cacheMaxAge}, s-maxage=${cacheSMaxAge}, stale-while-revalidate=${staleWhileRevalidate}`,
    ETag: etag,
  });

  return new Response(JSON.stringify(data), { status, headers });
}

export function createNotModifiedResponse(etag: string): Response {
  return new Response(null, {
    status: 304,
    headers: {
      ETag: etag,
    },
  });
}

export function createRateLimitedResponse(): Response {
  return new Response(
    JSON.stringify({ error: "Rate limit exceeded" }),
    {
      status: 429,
      headers: {
        "Content-Type": "application/json",
        "Retry-After": "60",
      },
    }
  );
}

export interface ApiHandlerContext {
  requestHeaders: Headers;
  rateLimitKey: string;
}

export function checkRateLimit(
  key: string,
  config?: { windowMs?: number; maxRequests?: number }
): { allowed: boolean; headers: Record<string, string> } {
  const result = rateLimit(key, config);
  return {
    allowed: result.allowed,
    headers: getRateLimitHeaders(result),
  };
}

export function checkIfNotModified(requestHeaders: Headers, data: unknown): boolean {
  const etag = generateETag(data);
  return checkETag(requestHeaders, etag);
}
