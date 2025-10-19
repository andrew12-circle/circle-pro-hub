import { z } from "zod";

/** CARD **/
export const ZCard = z.object({
  title: z.string().min(3).max(90),
  subtitle: z.string().max(140).optional().default(""),
  badges: z.array(z.string()).max(6).optional().default([]),
  category: z.string().min(2),
  tags: z.array(z.string()).max(12).optional().default([]),
  thumbnail: z.string().url().optional(),
  gallery: z.array(z.string().url()).max(8).optional().default([]),
  highlights: z.array(z.string()).max(8).optional().default([]),
  cta: z.object({
    type: z.enum(["book", "link", "add_to_cart"]),
    label: z.string().min(2).max(40),
    url: z.string().url().optional(),
  }),
  flags: z.object({
    active: z.boolean().default(true),
    verified: z.boolean().default(false),
    affiliate: z.boolean().default(false),
    booking: z.boolean().default(false),
  }),
  complianceNotes: z.string().max(1000).optional().default(""),
});

/** PRICING **/
export const ZPricing = z.object({
  currency: z.string().length(3).default("USD"),
  tiers: z.array(z.object({
    id: z.string().min(2),
    name: z.string().min(2).max(40),
    price: z.number().nonnegative(),
    unit: z.string().min(1),
    includes: z.array(z.string()).default([]),
    upsells: z.array(z.object({ name: z.string(), price: z.number().nonnegative() })).default([]),
    ribbon: z.string().max(20).optional(),
  })).min(1),
  billing: z.object({
    terms: z.string().max(500).optional().default(""),
    anchors: z.array(z.string()).max(3).optional().default([]),
  }),
});

/** FUNNEL **/
export const ZFunnelStep = z.object({
  kind: z.enum(["hero", "proof", "package-chooser", "faq", "cta", "custom"]),
  headline: z.string().max(120).optional(),
  subhead: z.string().max(200).optional(),
  bullets: z.array(z.string()).max(10).optional(),
  media: z.string().url().optional(),
  tier_refs: z.array(z.string()).optional(),
  cta_type: z.enum(["book", "link", "add_to_cart"]).optional(),
  label: z.string().max(40).optional(),
  target: z.string().optional(),
});

export const ZFunnel = z.object({ 
  steps: z.array(ZFunnelStep).max(30) 
});

/** DRAFT WRAPPER **/
export const ZServiceDraft = z.object({
  id: z.string().uuid(),
  row_version: z.number().int().positive(),
  card: ZCard,
  pricing: ZPricing,
  funnel: ZFunnel,
});

export type TCard = z.infer<typeof ZCard>;
export type TPricing = z.infer<typeof ZPricing>;
export type TFunnel = z.infer<typeof ZFunnel>;
export type TServiceDraft = z.infer<typeof ZServiceDraft>;
