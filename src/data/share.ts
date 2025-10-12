/**
 * Share link management (stub implementation)
 * Maps short IDs to service IDs for shareable links
 */

interface ShareLink {
  shortId: string;
  serviceId: string;
  createdAt: Date;
}

// In-memory stub storage (would be replaced with DB in production)
const shareLinksMap = new Map<string, ShareLink>();

/**
 * Generate a short ID for a service
 */
function generateShortId(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Create or retrieve a share link for a service
 */
export async function createShareLink(serviceId: string): Promise<string> {
  // Check if a link already exists for this service
  for (const [shortId, link] of shareLinksMap.entries()) {
    if (link.serviceId === serviceId) {
      return shortId;
    }
  }

  // Create a new short link
  const shortId = generateShortId();
  shareLinksMap.set(shortId, {
    shortId,
    serviceId,
    createdAt: new Date(),
  });

  return shortId;
}

/**
 * Resolve a short ID to a service ID
 */
export async function resolveShareLink(shortId: string): Promise<string | null> {
  const link = shareLinksMap.get(shortId);
  return link ? link.serviceId : null;
}

/**
 * Get or set referral cookie
 */
const REF_COOKIE_NAME = "circle_ref";
const COOKIE_DAYS = 30;

export function setReferralCookie(referralCode: string): void {
  const expiryDate = new Date();
  expiryDate.setDate(expiryDate.getDate() + COOKIE_DAYS);
  
  document.cookie = `${REF_COOKIE_NAME}=${encodeURIComponent(referralCode)}; expires=${expiryDate.toUTCString()}; path=/; SameSite=Lax`;
  console.info(`[Share] Referral cookie set: ${referralCode} (expires in ${COOKIE_DAYS} days)`);
}

export function getReferralCookie(): string | null {
  const cookies = document.cookie.split("; ");
  for (const cookie of cookies) {
    const [name, value] = cookie.split("=");
    if (name === REF_COOKIE_NAME) {
      return decodeURIComponent(value);
    }
  }
  return null;
}
