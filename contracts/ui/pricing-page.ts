import { z } from "zod";
import { MoneySchema } from "../common";

export const PricingTierSchema = z.object({
  name: z.enum(["Retail", "Pro", "Co-Pay"]),
  description: z.string(),
  price: MoneySchema.optional(),
  features: z.array(z.string()),
  cta: z.object({
    label: z.string(),
    href: z.string(),
  }),
  highlighted: z.boolean().default(false),
});

export const PricingPageConfigSchema = z.object({
  hero: z.object({
    title: z.string(),
    subtitle: z.string(),
  }),
  tiers: z.array(PricingTierSchema),
  faq: z.array(
    z.object({
      question: z.string(),
      answer: z.string(),
    })
  ),
});

export type PricingTier = z.infer<typeof PricingTierSchema>;
export type PricingPageConfig = z.infer<typeof PricingPageConfigSchema>;
