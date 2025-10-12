import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

/**
 * Example API handler with caching, ETags, and rate limiting
 */

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Rate limiting (check request IP or user ID)
    const clientIp = req.headers.get("x-forwarded-for") || "unknown";
    // In production: check rate limit here

    // Parse query params
    const url = new URL(req.url);
    const category = url.searchParams.get("category");
    const city = url.searchParams.get("city");

    // Load data (in production, this would call data layer)
    const mockServices = [
      {
        id: "1",
        name: "Home Inspection",
        category: "Inspection",
        city: "Austin",
      },
    ];

    // Generate ETag
    const dataStr = JSON.stringify(mockServices);
    let hash = 2166136261;
    for (let i = 0; i < dataStr.length; i++) {
      hash ^= dataStr.charCodeAt(i);
      hash += (hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24);
    }
    const etag = `"${(hash >>> 0).toString(36)}"`;

    // Check If-None-Match
    const ifNoneMatch = req.headers.get("If-None-Match");
    if (ifNoneMatch === etag) {
      return new Response(null, {
        status: 304,
        headers: {
          ...corsHeaders,
          ETag: etag,
        },
      });
    }

    // Return with caching headers
    return new Response(JSON.stringify(mockServices), {
      status: 200,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
        "Cache-Control": "public, max-age=60, s-maxage=60, stale-while-revalidate=300",
        ETag: etag,
        "X-RateLimit-Remaining": "99",
      },
    });
  } catch (error) {
    console.error("Error in services-list:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
