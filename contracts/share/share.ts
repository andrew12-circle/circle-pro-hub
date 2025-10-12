import { z } from "zod";

export const ShareLinkSchema = z.object({
  id: z.string().uuid(),
  shortCode: z.string().min(6).max(12).regex(/^[A-Za-z0-9]+$/),
  targetType: z.enum(["service", "vendor"]),
  targetId: z.string().uuid(),
  createdBy: z.string().uuid().optional(),
  clicks: z.number().int().nonnegative().default(0),
  createdAt: z.date(),
  expiresAt: z.date().optional(),
});

export type ShareLink = z.infer<typeof ShareLinkSchema>;
