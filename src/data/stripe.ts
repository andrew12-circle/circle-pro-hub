/**
 * Stripe data facade
 * Handles checkout session creation
 */

import { supabase } from "@/integrations/supabase/client";
import type { CheckoutSessionResponse } from "../../contracts/stripe";

export async function createCheckoutSession(
  priceId: string
): Promise<CheckoutSessionResponse> {
  const { data, error } = await supabase.functions.invoke(
    "stripe-create-checkout-session",
    {
      body: {
        priceId,
        successUrl: `${window.location.origin}/profile?upgrade=success`,
        cancelUrl: `${window.location.origin}/pricing?canceled=true`,
      },
    }
  );

  if (error) {
    throw new Error(error.message || "Failed to create checkout session");
  }

  return data as CheckoutSessionResponse;
}
