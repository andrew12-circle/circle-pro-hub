import { z } from "zod";

export const ServiceListingFormSchema = z.object({
  vendorName: z.string().min(2).max(100),
  contactEmail: z.string().email(),
  contactPhone: z.string().regex(/^\+?[1-9]\d{1,14}$/),
  serviceName: z.string().min(5).max(200),
  serviceCategory: z.string(),
  description: z.string().min(50).max(2000),
  pricing: z.object({
    retail: z.number().positive(),
    proDiscount: z.number().min(0).max(100).optional(),
  }),
  availability: z.enum(["immediate", "2-weeks", "1-month"]),
  serviceAreas: z.array(z.string()).min(1),
});

export const CoPartnerFormSchema = z.object({
  companyName: z.string().min(2).max(100),
  contactName: z.string().min(2).max(100),
  contactEmail: z.string().email(),
  agentCount: z.number().int().positive(),
  dealsPerYear: z.number().int().nonnegative(),
  serviceInterests: z.array(z.string()).min(1),
  copayContribution: z.number().min(0).max(100),
});

export type ServiceListingForm = z.infer<typeof ServiceListingFormSchema>;
export type CoPartnerForm = z.infer<typeof CoPartnerFormSchema>;
