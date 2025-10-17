import Stripe from "https://esm.sh/stripe@17.5.0";
import { checkRateLimit, getRateLimitHeaders } from "../_shared/rateLimit.ts";

const allowedOrigin = Deno.env.get("APP_ORIGIN") || "http://localhost:8080";
const corsHeaders = {
  "Access-Control-Allow-Origin": allowedOrigin,
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Credentials": "true",
};

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Starting Stripe Customer Portal session creation");

    // Get environment variables
    const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY");
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!stripeSecretKey) {
      throw new Error("STRIPE_SECRET_KEY is not configured");
    }
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("Supabase environment variables are not configured");
    }

    // Initialize Stripe
    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: "2024-11-20.acacia",
    });

    // Authenticate user
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("No authorization header");
    }

    const token = authHeader.replace("Bearer ", "");
    
    // Verify user with Supabase auth
    const userResponse = await fetch(`${supabaseUrl}/auth/v1/user`, {
      headers: { 
        Authorization: `Bearer ${token}`,
        apikey: supabaseServiceKey,
      },
    });

    if (!userResponse.ok) {
      console.error("Auth error:", await userResponse.text());
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const user = await userResponse.json();
    console.log("User authenticated:", user.id);

    // Rate limit: 10 portal sessions per minute per user
    const rateLimitKey = `stripe:portal:${user.id}`;
    const rateLimit = await checkRateLimit(
      supabaseUrl,
      supabaseServiceKey,
      rateLimitKey,
      60000, // 1 minute window
      10 // max 10 requests
    );

    if (!rateLimit.allowed) {
      const resetSeconds = Math.ceil((rateLimit.resetAt - Date.now()) / 1000);
      return new Response(
        JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
        {
          status: 429,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
            "Retry-After": String(resetSeconds),
            ...getRateLimitHeaders(rateLimit),
          },
        }
      );
    }

    console.log(`Rate limit check passed for user ${user.id}: ${rateLimit.remaining} remaining`);

    // Get user's profile to retrieve Stripe customer ID
    const profileResponse = await fetch(
      `${supabaseUrl}/rest/v1/profiles?id=eq.${user.id}&select=stripe_customer_id`,
      {
        headers: {
          apikey: supabaseServiceKey,
          Authorization: `Bearer ${supabaseServiceKey}`,
        },
      }
    );

    if (!profileResponse.ok) {
      console.error("Profile error:", await profileResponse.text());
      throw new Error("Failed to retrieve user profile");
    }

    const profiles = await profileResponse.json();
    const profile = profiles[0];

    if (!profile || !profile.stripe_customer_id) {
      console.error("No Stripe customer ID found for user");
      return new Response(
        JSON.stringify({ error: "No active subscription found" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    console.log("Stripe customer ID:", profile.stripe_customer_id);

    // Parse request body
    const { returnUrl } = await req.json();

    // Create Customer Portal session with idempotency key
    const idempotencyKey = `portal_${user.id}_${Date.now()}`;
    const session = await stripe.billingPortal.sessions.create(
      {
        customer: profile.stripe_customer_id,
        return_url: returnUrl,
      },
      {
        idempotencyKey,
      }
    );

    console.log("Portal session created:", session.id);

    return new Response(
      JSON.stringify({ url: session.url }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error creating portal session:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Internal server error",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
