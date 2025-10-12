import { featureFlags } from "./featureFlags";
import type { PricePlan } from "../../contracts/marketplace";

/**
 * Pricing helpers with degraded mode support
 */

export interface AvailablePricingModes {
  retail: boolean;
  pro: boolean;
  copay: boolean;
  points: boolean;
}

export function getAvailablePricingModes(
  isProMember: boolean,
  hasPoints: boolean
): AvailablePricingModes {
  // In degraded mode, only show Retail and Pro
  if (featureFlags.degraded_mode) {
    return {
      retail: true,
      pro: isProMember,
      copay: false,
      points: false,
    };
  }

  // Normal mode
  return {
    retail: true,
    pro: isProMember,
    copay: featureFlags.copay,
    points: featureFlags.wallet && hasPoints,
  };
}

export function filterAvailablePricing(
  pricing: PricePlan,
  modes: AvailablePricingModes
): Partial<PricePlan> {
  const filtered: Partial<PricePlan> = {
    retail: pricing.retail,
  };

  if (modes.pro && pricing.pro) {
    filtered.pro = pricing.pro;
    filtered.proPctSavings = pricing.proPctSavings;
  }

  if (modes.copay && pricing.copay) {
    filtered.copay = pricing.copay;
    filtered.copayWithVendor = pricing.copayWithVendor;
    filtered.copayNonSettlement = pricing.copayNonSettlement;
  }

  return filtered;
}

export function shouldShowCopay(isEligible: boolean): boolean {
  if (featureFlags.degraded_mode) {
    return false;
  }
  return featureFlags.copay && isEligible;
}

export function shouldShowPoints(hasPoints: boolean): boolean {
  if (featureFlags.degraded_mode) {
    return false;
  }
  return featureFlags.wallet && hasPoints;
}
