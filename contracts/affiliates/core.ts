import { z } from "zod";

export const AttributionSchema = z.object({
  userId: z.string().uuid().optional(),
  affiliateCode: z.string().optional(),
  referrer: z.string().url().optional(),
  utmSource: z.string().optional(),
  utmMedium: z.string().optional(),
  utmCampaign: z.string().optional(),
  createdAt: z.date(),
});

export const AffiliateSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  code: z.string().min(4).max(20).regex(/^[A-Z0-9_-]+$/),
  active: z.boolean().default(true),
  commission: z.number().min(0).max(100),
  clicks: z.number().int().nonnegative().default(0),
  conversions: z.number().int().nonnegative().default(0),
  earnings: z.number().nonnegative().default(0),
});

export type Attribution = z.infer<typeof AttributionSchema>;
export type Affiliate = z.infer<typeof AffiliateSchema>;
