/**
 * ETag generation for cache validation
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

export function checkETag(
  requestHeaders: Headers,
  etag: string
): boolean {
  const ifNoneMatch = requestHeaders.get("If-None-Match");
  return ifNoneMatch === etag;
}
