# Scaling Patterns & Performance Hooks

This document outlines the caching, rate limiting, and resilience patterns implemented in Circle Pro Hub.

## Core Principles

1. **Cache-first reads**: All data layer reads wrapped in `cache.getOrSet(key, ttl, loader)`
2. **HTTP caching**: JSON responses include `Cache-Control` and `ETag` headers
3. **Rate limiting**: API endpoints protected with in-memory rate limits (stub for Redis)
4. **Degraded mode**: Feature flags allow graceful degradation during outages

## Caching Implementation

### Data Layer Caching

All reads in `data/services.ts`, `data/vendors.ts`, `data/bookings.ts` use the cache adapter:

```typescript
export async function getServices(params?: ServiceFilters): Promise<ServiceCard[]> {
  const cacheKey = `services:${JSON.stringify(params)}`;
  
  return cache.getOrSet(cacheKey, 90, async () => {
    // Expensive operation (DB/Search query)
    return fetchServicesFromSource(params);
  });
}
```

**TTL Guidelines:**
- Service lists: 90s
- Service details: 60s
- Vendor/Partner lists: 60s
- Bookings: 60s

### HTTP Caching Headers

All JSON API responses include:

```
Cache-Control: public, max-age=60, s-maxage=60, stale-while-revalidate=300
ETag: "abc123xyz"
```

**Implementation:**

```typescript
import { createCachedJsonResponse } from "@/lib/apiHelpers";

// In your API handler
const data = await getServices(params);
return createCachedJsonResponse({
  data,
  cacheMaxAge: 60,
  cacheSMaxAge: 60,
  staleWhileRevalidate: 300,
});
```

**ETag Validation:**

The server checks `If-None-Match` headers and returns `304 Not Modified` when appropriate:

```typescript
import { checkIfNotModified } from "@/lib/apiHelpers";

if (checkIfNotModified(request.headers, data)) {
  return createNotModifiedResponse(generateETag(data));
}
```

## Rate Limiting

### Implementation

Circle Pro Hub implements rate limiting at two levels:

#### Client-Side Rate Limiting (In-Memory)

```typescript
import { rateLimit, getRateLimitHeaders } from "@/lib/rateLimit";

// In your UI-side API handler
const clientKey = `api:${userId || ip}`;
const result = rateLimit(clientKey, {
  windowMs: 60000,  // 1 minute window
  maxRequests: 100, // 100 requests per window
});

if (!result.allowed) {
  return new Response("Too many requests", { 
    status: 429,
    headers: getRateLimitHeaders(result)
  });
}

// Attach rate limit headers to successful response
const headers = getRateLimitHeaders(result);
```

**Default Limits (Client-Side):**
- **General API calls**: 100 requests/minute per user/IP
- **Window**: 60 seconds (rolling)
- **Storage**: In-memory Map (single instance)

#### Edge Function Rate Limiting (Distributed)

For deployed Lovable Cloud edge functions, use the distributed rate limiter:

```typescript
// In supabase/functions/*/index.ts
import { checkRateLimit, getRateLimitHeaders } from "../_shared/rateLimit.ts";

const result = await checkRateLimit(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  `func:${functionName}:${userId || ip}`,
  60000,  // 60s window
  100     // 100 requests
);

if (!result.allowed) {
  return new Response("Rate limit exceeded", {
    status: 429,
    headers: { ...corsHeaders, ...getRateLimitHeaders(result) }
  });
}
```

**Edge Function Limits:**
- **Services List**: 100 requests/minute per user
- **Share Link Creation**: 20 requests/minute per user
- **Booking Creation**: 10 requests/minute per user
- **GHL Webhook**: 50 requests/minute (global)
- **Stripe Webhook**: 100 requests/minute (global)

**Storage**: Postgres-backed (`rate_limits` table with TTL-based expiry)

### Rate Limit Headers

All responses include:

```
X-RateLimit-Remaining: 42
X-RateLimit-Reset: 2025-10-12T10:30:00.000Z
```

### Upgrade Path

**Current Implementation:**
- Client-side: In-memory Map (single process)
- Edge functions: Postgres table with RPC function

**Production Scale Upgrades:**

1. **Replace in-memory with Redis/Valkey** for client-side rate limiting
2. **Use sliding window counters** instead of fixed windows
3. **Add per-endpoint granular limits**:
   - Lists: 100/min
   - Detail views: 200/min
   - Writes (bookings, intakes): 10/min
   - Share link creation: 20/min
4. **Implement distributed token buckets** for burst handling
5. **Add IP-based rate limiting** in addition to user-based
6. **Configure CDN rate limiting** (Cloudflare) as first line of defense

## Feature Flags & Degraded Mode

### Feature Flags

Located in `lib/featureFlags.ts`:

```typescript
export const featureFlags = {
  wallet: import.meta.env.VITE_FEATURE_WALLET === "true",
  copay: import.meta.env.VITE_FEATURE_COPAY === "true",
  affiliate: import.meta.env.VITE_FEATURE_AFFILIATE === "true",
  share: import.meta.env.VITE_FEATURE_SHARE === "true",
  degraded_mode: import.meta.env.VITE_FEATURE_DEGRADED_MODE === "true",
};
```

### Degraded Mode Behavior

When `VITE_FEATURE_DEGRADED_MODE=true`:

- ✅ Retail pricing: **Available**
- ✅ Pro pricing: **Available**
- ❌ Co-Pay pricing: **Hidden**
- ❌ Points/Wallet: **Hidden**
- ✅ Share links: **Still work**
- ✅ Affiliate tracking: **Still works**

### Using Degraded Mode in Components

```typescript
import { getAvailablePricingModes } from "@/lib/pricingHelpers";

const modes = getAvailablePricingModes(isProMember, hasPoints);

// modes.copay and modes.points will be false in degraded mode
```

## Performance Budgets

Target p95 latencies:

- **List endpoints**: ≤250ms (from cache/search)
- **Detail endpoints**: ≤250ms
- **Writes** (booking/intake): ≤350ms to accept + enqueue

## Example: Full API Handler

See `supabase/functions/services-list/index.ts` for a complete example with:

- ✅ CORS handling
- ✅ Rate limiting
- ✅ ETag generation
- ✅ Cache-Control headers
- ✅ 304 Not Modified support
- ✅ Error handling

## Monitoring Hooks

Future integrations:

1. **Cache hit ratio**: Log `cache.getOrSet` hits/misses
2. **Rate limit rejections**: Count 429 responses per endpoint
3. **Response times**: p50/p95/p99 per route
4. **ETag effectiveness**: Track 304 vs 200 responses

## Upgrade Path to Production

1. **Replace in-memory cache** with Redis/Valkey
2. **Replace in-memory rate limiting** with Redis sliding windows
3. **Add CDN** (Cloudflare/Fastly) in front of API
4. **Enable edge caching** for static service data
5. **Add observability** (Sentry, OpenTelemetry)

## Testing Caching Locally

```bash
# Test with curl
curl -i http://localhost:8000/api/services

# Note the ETag header in response
# e.g., ETag: "abc123xyz"

# Send conditional request
curl -i -H 'If-None-Match: "abc123xyz"' http://localhost:8000/api/services

# Should receive 304 Not Modified with no body
```

## Debugging

Enable cache logging:

```typescript
// In adapters/cache.ts
console.log(`[Cache] ${hit ? 'HIT' : 'MISS'}: ${key}`);
```

Enable rate limit logging:

```typescript
// In lib/rateLimit.ts
console.log(`[RateLimit] ${allowed ? 'ALLOWED' : 'BLOCKED'}: ${key}`);
```
