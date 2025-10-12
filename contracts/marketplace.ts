import { z } from "zod";
import { MoneySchema } from "./common";

export const PricePlanSchema = z.object({
  retail: MoneySchema,
  pro: MoneySchema.optional(),
  proPctSavings: z.number().min(0).max(100).optional(),
  copay: MoneySchema.optional(),
  copayWithVendor: MoneySchema.optional(),
  copayNonSettlement: MoneySchema.optional(),
});

export const ServiceCardSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(200),
  vendor: z.object({
    id: z.string().uuid(),
    name: z.string(),
    logo: z.string().url(),
    verified: z.boolean().default(false),
    calendarLink: z.string().url().optional(),
  }),
  tagline: z.string().max(500),
  category: z.string(),
  rating: z.number().min(0).max(5),
  reviews: z.number().int().nonnegative(),
  reviewHighlight: z.string().max(300).optional(),
  pricing: PricePlanSchema,
  featured: z.boolean().default(false),
  badges: z.array(z.string()).default([]),
  serviceAreas: z.array(z.string()).default([]),
  cityScope: z.enum(['any', 'local']).default('any'),
});

export const ServiceFunnelSchema = ServiceCardSchema.extend({
  packages: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      description: z.string(),
      pricing: PricePlanSchema,
    })
  ),
  faq: z.array(
    z.object({
      question: z.string(),
      answer: z.string(),
    })
  ),
  media: z.object({
    images: z.array(z.string().url()),
    videos: z.array(z.string().url()).optional(),
  }),
  compliance: z
    .object({
      respa: z.string().optional(),
      disclaimer: z.string().optional(),
    })
    .optional(),
});

export type PricePlan = z.infer<typeof PricePlanSchema>;
export type ServiceCard = z.infer<typeof ServiceCardSchema>;
export type ServiceFunnel = z.infer<typeof ServiceFunnelSchema>;
