import { ServiceCard } from "../../contracts/marketplace";
import { VendorPartner } from "../../contracts/affiliates/partner";
import { cache } from "@/adapters/cache";
import { eligiblePartners, type AgentProfile, type VendorPartner as DomainVendorPartner } from '@/lib/vendor_rules';
import { getServiceById } from './services';

const API = import.meta.env.VITE_API_BASE?.replace(/\/$/, '') || '';

export interface Vendor {
  id: string;
  name: string;
  logo: string;
  verified: boolean;
  rating: number;
  reviews: number;
  services: ServiceCard[];
}

export async function getAllPartners(): Promise<DomainVendorPartner[]> {
  if (!API) {
    const response = await fetch('/fixtures/vendors.json');
    const fixtureData = await response.json();
    return fixtureData.partners as DomainVendorPartner[];
  }
  const res = await fetch(`${API}/api/partners`, { credentials: 'include' });
  if (!res.ok) throw new Error('partners_fetch_failed');
  return (await res.json()) as DomainVendorPartner[];
}

export async function getEligiblePartnersForService(
  service: Pick<ServiceCard, 'id' | 'vendor'>,
  cityKey: string,
  agent: AgentProfile
): Promise<DomainVendorPartner[]> {
  const partners = await getAllPartners();
  return eligiblePartners(partners, service, cityKey, agent);
}

export async function getVendorById(id: string): Promise<Vendor | null> {
  // TODO: Implement
  throw new Error("Not implemented");
}

export async function getVendors(): Promise<Vendor[]> {
  // TODO: Implement
  throw new Error("Not implemented");
}

/**
 * Get eligible co-pay partners for a service (legacy API for backward compat)
 */
export async function getEligiblePartners(params: {
  serviceId: string;
  city?: string;
  agentDealsPerYear?: number;
}): Promise<VendorPartner[]> {
  const cacheKey = `eligible-partners:${params.serviceId}:${params.city || "any"}:${params.agentDealsPerYear || 0}`;
  
  return cache.getOrSet(cacheKey, 60, async () => {
    // 1. Fetch service data
    const service = await getServiceById(params.serviceId);
    if (!service) return [];

    // 2. Build agent profile
    const agentProfile: AgentProfile = {
      dealsLast12m: params.agentDealsPerYear || 0,
    };

    // 3. Call new getEligiblePartnersForService
    const eligible = await getEligiblePartnersForService(
      { id: service.id, vendor: service.vendor },
      params.city || '',
      agentProfile
    );

    // 4. Map domain types back to contract types
    return eligible.map((p) => ({
      id: p.id,
      name: p.name,
      logo: "https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=200&h=200&fit=crop",
      verified: true,
      description: `Co-pay benefits for qualifying agents`,
      markets: p.markets,
      copayEligibility: {
        enabled: p.copayPolicy.enabled,
        markets: p.markets,
        minAgentDealsPerYear: p.minAgentDealsPerYear || 0,
        allowedServiceIds: p.allowedServiceIds || [],
        prohibitedServiceIds: p.prohibitedServiceIds || [],
      },
      rating: 4.7,
      reviews: 200,
      benefits: [
        `${p.copayPolicy.sharePct}% cost sharing on approved services`,
        "Priority vendor access",
        "Dedicated account manager",
      ],
    } as VendorPartner));
  });
}

/**
 * Get partner details by ID
 */
export async function getPartnerById(partnerId: string): Promise<VendorPartner | null> {
  // TODO: Implement real lookup
  return null;
}
