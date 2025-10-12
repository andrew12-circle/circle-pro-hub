import { z } from "zod";

export const LegalDocSchema = z.object({
  id: z.string(),
  slug: z.string().regex(/^[a-z0-9-]+$/),
  title: z.string(),
  content: z.string(),
  lastUpdated: z.date(),
  version: z.string(),
});

export const LegalBundleSchema = z.object({
  terms: LegalDocSchema,
  privacy: LegalDocSchema,
  respa: LegalDocSchema.optional(),
  disclaimer: LegalDocSchema.optional(),
});

export type LegalDoc = z.infer<typeof LegalDocSchema>;
export type LegalBundle = z.infer<typeof LegalBundleSchema>;
