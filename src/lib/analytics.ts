/**
 * Lightweight UX event logging for key user flows.
 * In production, these could be sent to an analytics service.
 */

type UXEvent =
  | { type: 'PricingModeChosen'; mode: 'retail' | 'pro' | 'copay' | 'points'; serviceId: string }
  | { type: 'CartItemAdded'; serviceId: string; mode: string }
  | { type: 'CartItemRemoved'; serviceId: string }
  | { type: 'BookingCreated'; serviceId: string; bookingId?: string }
  | { type: 'ServiceViewed'; serviceId: string }
  | { type: 'SearchPerformed'; query: string; resultsCount: number }
  | { type: 'FilterApplied'; filterType: string; value: string }
  | { type: 'ShareLinkCreated'; serviceId: string; shareId: string }
  | { type: 'ProUpgradeClicked'; source: string }
  | { type: 'VendorPartnerSelected'; partnerId: string; serviceId: string };

/**
 * Log a UX event to console (dev) or analytics service (prod).
 */
export function logUXEvent(event: UXEvent): void {
  const timestamp = new Date().toISOString();
  const eventData = { ...event, timestamp };

  // In development, log to console
  if (import.meta.env.DEV) {
    console.log(`[UX Event] ${event.type}`, eventData);
  }

  // In production, send to analytics service
  // TODO: Integrate with analytics service when needed
  // Example: analytics.track(event.type, eventData);
}

/**
 * Log a performance metric for monitoring.
 */
export function logPerformanceMetric(metric: {
  name: string;
  value: number;
  unit: 'ms' | 'bytes' | 'count';
  context?: Record<string, unknown>;
}): void {
  if (import.meta.env.DEV) {
    console.log(`[Performance] ${metric.name}: ${metric.value}${metric.unit}`, metric.context);
  }

  // TODO: Send to monitoring service (e.g., Sentry, DataDog)
}

/**
 * Log an error that doesn't crash the app but should be tracked.
 */
export function logError(error: Error | string, context?: Record<string, unknown>): void {
  const errorObj = typeof error === 'string' ? new Error(error) : error;

  if (import.meta.env.DEV) {
    console.error('[Error]', errorObj, context);
  }

  // TODO: Send to error tracking service
  // if (import.meta.env.VITE_SENTRY_DSN) {
  //   Sentry.captureException(errorObj, { extra: context });
  // }
}
