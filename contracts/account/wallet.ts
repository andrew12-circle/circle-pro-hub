import { z } from "zod";

export const PointsBalanceSchema = z.object({
  userId: z.string().uuid(),
  points: z.number().int().nonnegative(),
  currency: z.string().default("CIRCLE_POINTS"),
});

export const PointsTransactionSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  amount: z.number().int(),
  type: z.enum(["earn", "spend", "refund"]),
  description: z.string(),
  createdAt: z.date(),
});

export type PointsBalance = z.infer<typeof PointsBalanceSchema>;
export type PointsTransaction = z.infer<typeof PointsTransactionSchema>;
