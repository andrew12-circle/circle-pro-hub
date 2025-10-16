import { z } from "zod";

// Checkout session request
export const CheckoutSessionRequestSchema = z.object({
  priceId: z.string(),
  successUrl: z.string().url(),
  cancelUrl: z.string().url(),
});

export type CheckoutSessionRequest = z.infer<typeof CheckoutSessionRequestSchema>;

// Checkout session response
export const CheckoutSessionResponseSchema = z.object({
  sessionId: z.string(),
  url: z.string().url(),
});

export type CheckoutSessionResponse = z.infer<typeof CheckoutSessionResponseSchema>;

// Subscription status
export const SubscriptionStatusSchema = z.enum([
  "active",
  "canceled",
  "incomplete",
  "incomplete_expired",
  "past_due",
  "trialing",
  "unpaid",
]);

export type SubscriptionStatus = z.infer<typeof SubscriptionStatusSchema>;

// Stripe webhook event
export const StripeWebhookEventSchema = z.object({
  type: z.string(),
  data: z.object({
    object: z.any(),
  }),
});

export type StripeWebhookEvent = z.infer<typeof StripeWebhookEventSchema>;

// Customer portal session request
export const CustomerPortalSessionRequestSchema = z.object({
  returnUrl: z.string().url(),
});

export type CustomerPortalSessionRequest = z.infer<typeof CustomerPortalSessionRequestSchema>;

// Customer portal session response
export const CustomerPortalSessionResponseSchema = z.object({
  url: z.string().url(),
});

export type CustomerPortalSessionResponse = z.infer<typeof CustomerPortalSessionResponseSchema>;
