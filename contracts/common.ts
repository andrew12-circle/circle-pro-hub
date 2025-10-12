import { z } from "zod";

export const MoneySchema = z.object({
  amount: z.number().nonnegative(),
  currency: z.enum(["USD", "CAD"]).default("USD"),
});

export type Money = z.infer<typeof MoneySchema>;
