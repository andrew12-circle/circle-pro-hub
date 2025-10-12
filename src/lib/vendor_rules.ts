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

/**
 * Determine which partners are eligible for co-pay on a given service and user context.
 * Rule: copay.enabled ∧ market match ∧ deals >= minDeals ∧ service ∈ allowed ∧ service ∉ prohibited
 */
export function eligiblePartners(
  partners: VendorPartner[],
  service: Pick<ServiceCard, 'id' | 'vendor'>,
  cityKey: string, // normalized city/market key, e.g., 'franklin-tn'
  agent: AgentProfile
): VendorPartner[] {
  const deals = agent.dealsLast12m ?? 0;

  return partners.filter((p) => {
    if (!p.copayPolicy?.enabled) return false;

    // Market rule: partner must include cityKey
    const marketOk = p.markets?.map(normKey).includes(normKey(cityKey));
    if (!marketOk) return false;

    // Production threshold
    if (typeof p.minAgentDealsPerYear === 'number' && deals < p.minAgentDealsPerYear) return false;

    // Allowlist / blocklist
    if (p.allowedServiceIds && p.allowedServiceIds.length > 0 && !p.allowedServiceIds.includes(service.id))
      return false;
    if (p.prohibitedServiceIds && p.prohibitedServiceIds.includes(service.id)) return false;

    return true;
  });
}

function normKey(s?: string) {
  return (s || '').trim().toLowerCase();
}
