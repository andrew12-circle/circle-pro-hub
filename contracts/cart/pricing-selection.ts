import { z } from "zod";
import { MoneySchema } from "../common";

export const PricingModeSchema = z.enum(["retail", "pro", "copay", "points"]);

export const PricingSelectionSchema = z.object({
  serviceId: z.string().uuid(),
  packageId: z.string().optional(),
  mode: PricingModeSchema,
  price: MoneySchema,
  pointsCost: z.number().int().nonnegative().optional(),
  copayPartnerShare: MoneySchema.optional(),
  userShare: MoneySchema.optional(),
});

export type PricingMode = z.infer<typeof PricingModeSchema>;
export type PricingSelection = z.infer<typeof PricingSelectionSchema>;
