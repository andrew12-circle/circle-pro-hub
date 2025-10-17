import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.75.0";
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
  
  // Initialize Supabase client
  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logger.info("Request received", { method: req.method });

    // Rate limiting: 100 requests per minute per IP
    const clientIp = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown";
    const rateLimitKey = `services-list:${clientIp}`;
    const rateLimitResult = await checkRateLimit(
      supabaseUrl,
      supabaseServiceKey,
      rateLimitKey,
      60000,
      100
    );

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

    // Build database query
    let query = supabase
      .from("services")
      .select(`
        id,
        name,
        tagline,
        category,
        rating,
        reviews,
        review_highlight,
        pricing,
        featured,
        badges,
        service_areas,
        city_scope,
        vendor:vendors!inner (
          id,
          name,
          logo,
          verified,
          calendar_link
        )
      `)
      .eq("is_active", true);

    // Apply filters in SQL
    if (category) {
      query = query.eq("category", category);
    }
    if (rating) {
      query = query.gte("rating", parseFloat(rating));
    }
    if (search) {
      query = query.or(`name.ilike.%${search}%,tagline.ilike.%${search}%`);
    }
    if (location) {
      query = query.contains("service_areas", [location]);
    }

    // Execute query
    const { data: dbRows, error } = await query
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: false })
      .limit(100);

    if (error) {
      logger.error("Database query failed", { error: error.message });
      throw new Error(`Database query failed: ${error.message}`);
    }

    // Transform DB rows to ServiceCard format
    const services = dbRows.map((row: any) => ({
      id: row.id,
      name: row.name,
      tagline: row.tagline,
      category: row.category,
      rating: row.rating,
      reviews: row.reviews,
      reviewHighlight: row.review_highlight,
      pricing: row.pricing,
      featured: row.featured,
      badges: row.badges || [],
      serviceAreas: row.service_areas || [],
      cityScope: row.city_scope,
      vendor: {
        id: row.vendor.id,
        name: row.vendor.name,
        logo: row.vendor.logo,
        verified: row.vendor.verified,
        calendarLink: row.vendor.calendar_link,
      },
    }));

    logger.info("Services fetched from database", { count: services.length });

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
