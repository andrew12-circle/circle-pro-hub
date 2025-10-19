import { z } from "zod";

export const ServiceCardEditSchema = z.object({
  name: z.string().min(1).max(200),
  tagline: z.string().max(500),
  category: z.string(),
  badges: z.array(z.string()).default([]),
  serviceAreas: z.array(z.string()).default([]),
  cityScope: z.enum(['any', 'local']).default('any'),
  vendorId: z.string().uuid(),
  rating: z.number().min(0).max(5).optional(),
  reviews: z.number().int().nonnegative().optional(),
  reviewHighlight: z.string().max(300).optional(),
  featured: z.boolean().default(false),
});

export const ServicePricingEditSchema = z.object({
  retail: z.object({ amount: z.number(), currency: z.string() }),
  pro: z.object({ amount: z.number(), currency: z.string() }).optional(),
  copay: z.object({ amount: z.number(), currency: z.string() }).optional(),
  proPctSavings: z.number().min(0).max(100).optional(),
});

export const ServiceFunnelEditSchema = z.object({
  packages: z.array(z.object({
    id: z.string(),
    name: z.string(),
    description: z.string(),
    pricing: ServicePricingEditSchema,
  })).optional(),
  faq: z.array(z.object({
    question: z.string(),
    answer: z.string(),
  })).optional(),
  media: z.object({
    images: z.array(z.string().url()),
    videos: z.array(z.string().url()).optional(),
  }).optional(),
  compliance: z.object({
    respa: z.string().optional(),
    disclaimer: z.string().optional(),
  }).optional(),
});

export const ServiceVersionStateSchema = z.enum(['draft', 'submitted', 'approved', 'published', 'archived']);

export type ServiceCardEdit = z.infer<typeof ServiceCardEditSchema>;
export type ServicePricingEdit = z.infer<typeof ServicePricingEditSchema>;
export type ServiceFunnelEdit = z.infer<typeof ServiceFunnelEditSchema>;
export type ServiceVersionState = z.infer<typeof ServiceVersionStateSchema>;
