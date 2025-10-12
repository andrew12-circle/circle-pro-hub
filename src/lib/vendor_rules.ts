// src/lib/vendor_rules.ts
import type { ServiceCard } from '../../contracts/marketplace';

export type AgentProfile = {
  dealsLast12m: number;
  buyersLast12m?: number;
  sellersLast12m?: number;
  avgPriceCents?: number;
};

export type VendorPartner = {
  id: string;
  name: string;
  markets: string[]; // e.g., ['nashville', 'franklin-tn']
  minAgentDealsPerYear?: number;
  allowedServiceIds?: string[];
  prohibitedServiceIds?: string[];
  copayPolicy: {
    enabled: boolean;
    sharePct: number; // vendor contribution percentage (internal policy field)
    maxShareCentsPerOrder?: number;
  };
  intake?: { bookingLink?: string; contactEmail?: string };
  visibility?: 'public' | 'invite-only';
};

const norm = (s?: string) => (s || '').trim().toLowerCase();

/**
 * Determine which partners are eligible for co-pay on a given service and user context.
 * Rule: copay.enabled ∧ market match ∧ deals >= minDeals ∧ service ∈ allowed ∧ service ∉ prohibited
 */
export function eligiblePartners(
  partners: VendorPartner[],
  service: Pick<ServiceCard, 'id' | 'cityScope'>,
  cityKey: string, // normalized city/market key, e.g., 'franklin-tn'
  agent: AgentProfile
): VendorPartner[] {
  const deals = agent.dealsLast12m ?? 0;
  const city = norm(cityKey);

  return partners.filter((p) => {
    if (!p.copayPolicy?.enabled) return false;

    // Market rule: 'any' matches everywhere; local-only services require city match
    const markets = (p.markets || []).map(norm);
    const marketOk =
      markets.includes('any') || (service.cityScope === 'any' ? true : markets.includes(city));
    if (!marketOk) return false;

    // Production threshold
    if (typeof p.minAgentDealsPerYear === 'number' && deals < p.minAgentDealsPerYear) return false;

    // Allowlist / blocklist
    if (p.allowedServiceIds?.length && !p.allowedServiceIds.includes(service.id)) return false;
    if (p.prohibitedServiceIds?.includes(service.id)) return false;

    return true;
  });
}
