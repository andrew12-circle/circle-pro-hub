import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0?target=deno";
import { checkRateLimit, getRateLimitHeaders } from "../_shared/rateLimit.ts";

const allowedOrigin = Deno.env.get("APP_ORIGIN") || "http://localhost:8080";
const corsHeaders = {
  "Access-Control-Allow-Origin": allowedOrigin,
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Credentials": "true",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY");
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!stripeSecretKey || !supabaseUrl || !supabaseServiceKey) {
      throw new Error("Missing required environment variables");
    }

    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: "2024-11-20.acacia",
      httpClient: Stripe.createFetchHttpClient(),
    });

    // Get user from authorization header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Missing authorization header" }),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const token = authHeader.replace("Bearer ", "");
    const userResponse = await fetch(`${supabaseUrl}/auth/v1/user`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!userResponse.ok) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const user = await userResponse.json();

    // Rate limit: 5 checkout sessions per minute per user
    const rateLimitKey = `stripe:checkout:${user.id}`;
    const rateLimit = await checkRateLimit(
      supabaseUrl,
      supabaseServiceKey,
      rateLimitKey,
      60000, // 1 minute window
      5 // max 5 requests
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

    // Get user email from profiles
    const profileResponse = await fetch(
      `${supabaseUrl}/rest/v1/profiles?id=eq.${user.id}&select=*`,
      {
        headers: {
          apikey: supabaseServiceKey,
          Authorization: `Bearer ${supabaseServiceKey}`,
        },
      }
    );

    const profiles = await profileResponse.json();
    const profile = profiles[0];

    const { priceId, successUrl, cancelUrl } = await req.json();

    // Check if customer already exists
    let customerId = profile?.stripe_customer_id;

    if (!customerId) {
      // Create new Stripe customer
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: {
          user_id: user.id,
        },
      });
      customerId = customer.id;

      // Update profile with Stripe customer ID
      await fetch(`${supabaseUrl}/rest/v1/profiles?id=eq.${user.id}`, {
        method: "PATCH",
        headers: {
          apikey: supabaseServiceKey,
          Authorization: `Bearer ${supabaseServiceKey}`,
          "Content-Type": "application/json",
          Prefer: "return=minimal",
        },
        body: JSON.stringify({ stripe_customer_id: customerId }),
      });
    }

    // Create checkout session with idempotency key
    const idempotencyKey = `checkout_${user.id}_${Date.now()}`;
    const session = await stripe.checkout.sessions.create(
      {
        customer: customerId,
        line_items: [
          {
            price: priceId,
            quantity: 1,
          },
        ],
        mode: "subscription",
        success_url: successUrl,
        cancel_url: cancelUrl,
        metadata: {
          user_id: user.id,
        },
      },
      {
        idempotencyKey,
      }
    );

    return new Response(
      JSON.stringify({
        sessionId: session.id,
        url: session.url,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error creating checkout session:", error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "Unknown error occurred"
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
