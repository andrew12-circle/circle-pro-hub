import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0?target=deno";
import { createLogger } from "../_shared/logger.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  const logger = createLogger("stripe-webhook");
  
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  logger.info("Webhook event received");

  try {
    const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY");
    const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!stripeSecretKey || !webhookSecret || !supabaseUrl || !supabaseServiceKey) {
      logger.error("Missing environment variables");
      throw new Error("Missing required environment variables");
    }

    logger.info("Initializing Stripe client");

    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: "2024-11-20.acacia",
      httpClient: Stripe.createFetchHttpClient(),
    });

    const signature = req.headers.get("stripe-signature");
    if (!signature) {
      logger.warn("Missing Stripe signature");
      return new Response(JSON.stringify({ error: "Missing signature" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.text();
    let event: Stripe.Event;

    try {
      event = await stripe.webhooks.constructEventAsync(
        body,
        signature,
        webhookSecret
      );
    } catch (err) {
      logger.error("Webhook signature verification failed", {
        error: err instanceof Error ? err.message : "Unknown error",
      });
      console.error("Webhook signature verification failed:", err);
      return new Response(
        JSON.stringify({ error: "Invalid signature" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    console.log(`[Stripe Webhook] Event type: ${event.type}`);
    logger.info("Webhook event processed", { eventType: event.type });

    // Handle different event types
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.user_id;
        const customerId = session.customer as string;

        if (!userId) {
          logger.warn("No user_id in checkout session metadata");
          console.error("No user_id in session metadata");
          break;
        }

        console.log(`[Stripe Webhook] Adding pro role for user: ${userId}`);
        logger.info("Processing checkout completion", { userId, customerId });

        // Add pro role (idempotent with ON CONFLICT DO NOTHING)
        const roleResponse = await fetch(`${supabaseUrl}/rest/v1/user_roles`, {
          method: "POST",
          headers: {
            apikey: supabaseServiceKey,
            Authorization: `Bearer ${supabaseServiceKey}`,
            "Content-Type": "application/json",
            Prefer: "resolution=ignore-duplicates",
          },
          body: JSON.stringify({
            user_id: userId,
            role: "pro",
          }),
        });

        if (!roleResponse.ok && roleResponse.status !== 409) {
          console.error("Failed to add pro role:", await roleResponse.text());
        }

        // Update profile with Stripe customer ID
        await fetch(`${supabaseUrl}/rest/v1/profiles?id=eq.${userId}`, {
          method: "PATCH",
          headers: {
            apikey: supabaseServiceKey,
            Authorization: `Bearer ${supabaseServiceKey}`,
            "Content-Type": "application/json",
            Prefer: "return=minimal",
          },
          body: JSON.stringify({ stripe_customer_id: customerId }),
        });

        console.log(`[Stripe Webhook] Pro role added for user: ${userId}`);
        logger.info("Pro role added successfully", { userId });
        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;
        const status = subscription.status;

        // Get user ID from customer
        const profileResponse = await fetch(
          `${supabaseUrl}/rest/v1/profiles?stripe_customer_id=eq.${customerId}&select=id`,
          {
            headers: {
              apikey: supabaseServiceKey,
              Authorization: `Bearer ${supabaseServiceKey}`,
            },
          }
        );

        const profiles = await profileResponse.json();
        if (!profiles || profiles.length === 0) {
          logger.warn("No user found for Stripe customer", { customerId });
          console.error("No user found for customer:", customerId);
          break;
        }

        const userId = profiles[0].id;
        logger.setUserId(userId);

        console.log(
          `[Stripe Webhook] Subscription status: ${status} for user: ${userId}`
        );
        logger.info("Processing subscription update", { userId, status });

        if (["canceled", "past_due", "unpaid", "incomplete_expired"].includes(status)) {
          // Remove pro role
          const deleteResponse = await fetch(
            `${supabaseUrl}/rest/v1/user_roles?user_id=eq.${userId}&role=eq.pro`,
            {
              method: "DELETE",
              headers: {
                apikey: supabaseServiceKey,
                Authorization: `Bearer ${supabaseServiceKey}`,
              },
            }
          );

          if (!deleteResponse.ok) {
            console.error("Failed to remove pro role:", await deleteResponse.text());
          } else {
            console.log(`[Stripe Webhook] Pro role removed for user: ${userId}`);
            logger.info("Pro role removed successfully", { userId, status });
          }
        } else if (status === "active") {
          // Add pro role (idempotent)
          await fetch(`${supabaseUrl}/rest/v1/user_roles`, {
            method: "POST",
            headers: {
              apikey: supabaseServiceKey,
              Authorization: `Bearer ${supabaseServiceKey}`,
              "Content-Type": "application/json",
              Prefer: "resolution=ignore-duplicates",
            },
            body: JSON.stringify({
              user_id: userId,
              role: "pro",
            }),
          });
          console.log(`[Stripe Webhook] Pro role added for user: ${userId}`);
          logger.info("Pro role added successfully", { userId, status: "active" });
        }
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;

        // Get user ID from customer
        const profileResponse = await fetch(
          `${supabaseUrl}/rest/v1/profiles?stripe_customer_id=eq.${customerId}&select=id`,
          {
            headers: {
              apikey: supabaseServiceKey,
              Authorization: `Bearer ${supabaseServiceKey}`,
            },
          }
        );

        const profiles = await profileResponse.json();
        if (!profiles || profiles.length === 0) {
          logger.warn("No user found for deleted subscription", { customerId });
          console.error("No user found for customer:", customerId);
          break;
        }

        const userId = profiles[0].id;
        logger.setUserId(userId);

        console.log(
          `[Stripe Webhook] Subscription deleted for user: ${userId}`
        );
        logger.info("Processing subscription deletion", { userId });

        // Remove pro role
        const deleteResponse = await fetch(
          `${supabaseUrl}/rest/v1/user_roles?user_id=eq.${userId}&role=eq.pro`,
          {
            method: "DELETE",
            headers: {
              apikey: supabaseServiceKey,
              Authorization: `Bearer ${supabaseServiceKey}`,
            },
          }
        );

        if (!deleteResponse.ok) {
          logger.error("Failed to remove pro role", { userId });
          console.error("Failed to remove pro role:", await deleteResponse.text());
        } else {
          console.log(`[Stripe Webhook] Pro role removed for user: ${userId}`);
          logger.info("Pro role removed successfully", { userId });
        }
        break;
      }

      default:
        console.log(`[Stripe Webhook] Unhandled event type: ${event.type}`);
        logger.info("Unhandled event type", { eventType: event.type });
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    logger.error("Webhook processing failed", {
      error: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
    });
    console.error("Webhook error:", error);
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
