/**
 * ETag generation and caching headers for Deno edge functions
 * Enables HTTP caching and conditional requests
 */

/**
 * Generate ETag from data using FNV-1a hash
 */
export function generateETag(data: unknown): string {
  const str = typeof data === "string" ? data : JSON.stringify(data);

  // Simple hash function (FNV-1a)
  let hash = 2166136261;
  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i);
    hash += (hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24);
  }

  return `"${(hash >>> 0).toString(36)}"`;
}

/**
 * Set caching headers on Response
 */
export function setCachingHeaders(
  headers: Headers,
  data: unknown,
  options: {
    maxAge?: number;
    sMaxAge?: number;
    staleWhileRevalidate?: number;
  } = {}
): void {
  const {
    maxAge = 60,
    sMaxAge = 60,
    staleWhileRevalidate = 300,
  } = options;

  // Set Cache-Control
  const cacheControl = [
    "public",
    `max-age=${maxAge}`,
    `s-maxage=${sMaxAge}`,
    `stale-while-revalidate=${staleWhileRevalidate}`,
  ].join(", ");

  headers.set("Cache-Control", cacheControl);

  // Set ETag
  const etag = generateETag(data);
  headers.set("ETag", etag);
}

/**
 * Check if request has matching ETag (conditional request)
 */
export function checkETag(requestHeaders: Headers, etag: string): boolean {
  const ifNoneMatch = requestHeaders.get("If-None-Match");
  return ifNoneMatch === etag;
}

/**
 * Create cached JSON response with ETag
 */
export function createCachedJsonResponse(
  data: unknown,
  options: {
    status?: number;
    corsHeaders?: Record<string, string>;
    maxAge?: number;
    sMaxAge?: number;
    staleWhileRevalidate?: number;
  } = {}
): Response {
  const {
    status = 200,
    corsHeaders = {},
    maxAge = 60,
    sMaxAge = 60,
    staleWhileRevalidate = 300,
  } = options;

  const headers = new Headers({
    ...corsHeaders,
    "Content-Type": "application/json",
  });

  setCachingHeaders(headers, data, { maxAge, sMaxAge, staleWhileRevalidate });

  return new Response(JSON.stringify(data), { status, headers });
}

/**
 * Handle conditional request (304 Not Modified)
 */
export function handleConditionalRequest(
  requestHeaders: Headers,
  data: unknown,
  corsHeaders: Record<string, string> = {}
): Response | null {
  const etag = generateETag(data);

  if (checkETag(requestHeaders, etag)) {
    const headers = new Headers({
      ...corsHeaders,
      ETag: etag,
    });

    return new Response(null, { status: 304, headers });
  }

  return null;
}
