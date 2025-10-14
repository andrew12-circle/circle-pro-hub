import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0?target=deno";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY");
    const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!stripeSecretKey || !webhookSecret || !supabaseUrl || !supabaseServiceKey) {
      throw new Error("Missing required environment variables");
    }

    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: "2023-10-16",
      httpClient: Stripe.createFetchHttpClient(),
    });

    const signature = req.headers.get("stripe-signature");
    if (!signature) {
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

    // Handle different event types
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.user_id;
        const customerId = session.customer as string;

        if (!userId) {
          console.error("No user_id in session metadata");
          break;
        }

        console.log(`[Stripe Webhook] Adding pro role for user: ${userId}`);

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
          console.error("No user found for customer:", customerId);
          break;
        }

        const userId = profiles[0].id;

        console.log(
          `[Stripe Webhook] Subscription status: ${status} for user: ${userId}`
        );

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
          console.error("No user found for customer:", customerId);
          break;
        }

        const userId = profiles[0].id;

        console.log(
          `[Stripe Webhook] Subscription deleted for user: ${userId}`
        );

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
        }
        break;
      }

      default:
        console.log(`[Stripe Webhook] Unhandled event type: ${event.type}`);
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
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
