import { z } from "zod";

export const CopayEligibilitySchema = z.object({
  enabled: z.boolean(),
  markets: z.array(z.string()),
  minAgentDealsPerYear: z.number().int().nonnegative(),
  allowedServiceIds: z.array(z.string().uuid()),
  prohibitedServiceIds: z.array(z.string().uuid()).default([]),
});

export const VendorPartnerSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  logo: z.string().url(),
  verified: z.boolean().default(false),
  description: z.string(),
  markets: z.array(z.string()),
  copayEligibility: CopayEligibilitySchema,
  rating: z.number().min(0).max(5).optional(),
  reviews: z.number().int().nonnegative().optional(),
  benefits: z.array(z.string()).default([]),
});

export type CopayEligibility = z.infer<typeof CopayEligibilitySchema>;
export type VendorPartner = z.infer<typeof VendorPartnerSchema>;
