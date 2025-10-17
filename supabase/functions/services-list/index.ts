import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { checkRateLimit } from "../_shared/rateLimit.ts";
import { createCachedJsonResponse, handleConditionalRequest } from "../_shared/etag.ts";
import { createLogger } from "../_shared/logger.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": Deno.env.get("APP_ORIGIN") || "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

/**
 * BFF: Services List API
 * - Rate limited: 100 req/min per IP
 * - Cached: 90s TTL with ETags
 * - Public endpoint (no auth required)
 */

serve(async (req) => {
  const logger = createLogger("services-list");
  const startTime = Date.now();

  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logger.info("Request received", { method: req.method });

    // Rate limiting: 100 requests per minute per IP
    const clientIp = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown";
    const rateLimitKey = `services-list:${clientIp}`;
    const rateLimitResult = await checkRateLimit(rateLimitKey, "60000", "100");

    if (!rateLimitResult.allowed) {
      logger.warn("Rate limit exceeded", { clientIp, resetAt: rateLimitResult.resetAt });
      return new Response(
        JSON.stringify({ error: "Rate limit exceeded" }),
        {
          status: 429,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
            "X-RateLimit-Remaining": "0",
            "X-RateLimit-Reset": rateLimitResult.resetAt.toString(),
            "Retry-After": Math.ceil((rateLimitResult.resetAt - Date.now()) / 1000).toString(),
          },
        }
      );
    }

    // Parse query params
    const url = new URL(req.url);
    const category = url.searchParams.get("category");
    const search = url.searchParams.get("search");
    const location = url.searchParams.get("location");
    const rating = url.searchParams.get("rating");
    const verified = url.searchParams.get("verified");

    logger.info("Query params parsed", { category, search, location, rating, verified });

    // Load services from fixtures
    // In production, this would query a database or search index
    const fixturesUrl = `${Deno.env.get("APP_ORIGIN") || "http://localhost:8080"}/fixtures/services.json`;
    const fixturesResponse = await fetch(fixturesUrl);
    
    if (!fixturesResponse.ok) {
      throw new Error("Failed to load services fixtures");
    }

    let services = await fixturesResponse.json();

    // Apply filters
    if (category) {
      services = services.filter((s: any) => s.category === category);
    }
    if (search) {
      const searchLower = search.toLowerCase();
      services = services.filter((s: any) => 
        s.title?.toLowerCase().includes(searchLower) ||
        s.description?.toLowerCase().includes(searchLower)
      );
    }
    if (location) {
      services = services.filter((s: any) => s.location === location);
    }
    if (rating) {
      const minRating = parseFloat(rating);
      services = services.filter((s: any) => s.rating >= minRating);
    }
    if (verified === "true") {
      services = services.filter((s: any) => s.verified === true);
    }

    logger.info("Services filtered", { count: services.length });

    // Check for conditional request (304 Not Modified)
    const conditionalResponse = handleConditionalRequest(req.headers, services);
    if (conditionalResponse) {
      logger.info("304 Not Modified response", { 
        duration: Date.now() - startTime 
      });
      return new Response(null, {
        status: 304,
        headers: {
          ...corsHeaders,
          ...Object.fromEntries(conditionalResponse.headers.entries()),
        },
      });
    }

    // Create cached response with ETag
    const response = createCachedJsonResponse(services, {
      maxAge: 90,
      sMaxAge: 90,
      staleWhileRevalidate: 300,
    });

    // Add rate limit headers
    response.headers.set("X-RateLimit-Remaining", rateLimitResult.remaining.toString());
    response.headers.set("X-RateLimit-Reset", rateLimitResult.resetAt.toString());

    // Add CORS headers
    Object.entries(corsHeaders).forEach(([key, value]) => {
      response.headers.set(key, value);
    });

    const duration = Date.now() - startTime;
    logger.info("Request completed successfully", { 
      duration,
      servicesCount: services.length,
      cached: false,
    });

    return response;
  } catch (error) {
    const duration = Date.now() - startTime;
    logger.error("Request failed", {
      duration,
      error: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
    });

    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "Internal server error" 
      }),
      {
        status: 500,
        headers: { 
          ...corsHeaders, 
          "Content-Type": "application/json" 
        },
      }
    );
  }
});
