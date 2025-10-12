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
