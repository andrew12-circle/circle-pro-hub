import { z } from "zod";

export const FavoriteSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  entityType: z.enum(["service", "vendor"]),
  entityId: z.string().uuid(),
  createdAt: z.date(),
});

export type Favorite = z.infer<typeof FavoriteSchema>;
