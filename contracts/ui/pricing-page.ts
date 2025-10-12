import { z } from "zod";
import { MoneySchema } from "../common";

export const PricingTierSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  price: MoneySchema.extend({
    amount: z.number().nullable(),
    interval: z.string(),
  }),
  features: z.array(z.string()),
  cta: z.object({
    text: z.string(),
    href: z.string(),
  }),
  highlighted: z.boolean().default(false),
  badge: z.string().optional(),
});

export const ProUpsellBenefitSchema = z.object({
  icon: z.string(),
  title: z.string(),
  description: z.string(),
});

export const PricingPageConfigSchema = z.object({
  hero: z.object({
    headline: z.string(),
    subheadline: z.string(),
    highlightText: z.string().optional(),
  }),
  tiers: z.array(PricingTierSchema),
  faq: z.array(
    z.object({
      question: z.string(),
      answer: z.string(),
    })
  ),
  proUpsell: z.object({
    headline: z.string(),
    subheadline: z.string(),
    benefits: z.array(ProUpsellBenefitSchema),
    cta: z.object({
      text: z.string(),
      href: z.string(),
    }),
  }),
});

export type PricingTier = z.infer<typeof PricingTierSchema>;
export type ProUpsellBenefit = z.infer<typeof ProUpsellBenefitSchema>;
export type PricingPageConfig = z.infer<typeof PricingPageConfigSchema>;
