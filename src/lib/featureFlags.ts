export const featureFlags = {
  wallet: import.meta.env.VITE_FEATURE_WALLET === "true",
  copay: import.meta.env.VITE_FEATURE_COPAY === "true",
  affiliate: import.meta.env.VITE_FEATURE_AFFILIATE === "true",
  share: import.meta.env.VITE_FEATURE_SHARE === "true",
  degraded_mode: import.meta.env.VITE_FEATURE_DEGRADED_MODE === "true",
} as const;

export function isFeatureEnabled(feature: keyof typeof featureFlags): boolean {
  return featureFlags[feature];
}

/**
 * Check if we're in degraded mode (outage/incident response)
 * In degraded mode: hide Co-Pay and Points, keep Retail and Pro active
 */
export function isDegradedMode(): boolean {
  return featureFlags.degraded_mode;
}

/**
 * Get feature availability based on degraded mode
 */
export function getFeatureAvailability() {
  if (isDegradedMode()) {
    return {
      wallet: false,
      copay: false,
      affiliate: featureFlags.affiliate,
      share: featureFlags.share,
    };
  }

  return {
    wallet: featureFlags.wallet,
    copay: featureFlags.copay,
    affiliate: featureFlags.affiliate,
    share: featureFlags.share,
  };
}
