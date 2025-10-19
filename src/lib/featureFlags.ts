type Flags = {
  wallet: boolean;
  copay: boolean;
  affiliate: boolean;
  share: boolean;
  degraded_mode: boolean;
  admin_services_v2: boolean;
  vendor_portal: boolean;
};

const defaults: Flags = {
  wallet: true,
  copay: true,
  affiliate: true,
  share: true,
  degraded_mode: false,
  admin_services_v2: true,
  vendor_portal: false,
};

function parseEnv(): Partial<Flags> {
  try {
    const raw = import.meta.env.VITE_FLAGS as string | undefined;
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return typeof parsed === 'object' && parsed ? parsed as Partial<Flags> : {};
  } catch {
    return {};
  }
}

export const featureFlags: Flags = { ...defaults, ...parseEnv() };

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
