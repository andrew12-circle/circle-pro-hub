import { ServiceCard } from "../../contracts/marketplace";
import { VendorPartner } from "../../contracts/affiliates/partner";
import { cache } from "@/adapters/cache";

export interface Vendor {
  id: string;
  name: string;
  logo: string;
  verified: boolean;
  rating: number;
  reviews: number;
  services: ServiceCard[];
}

export async function getVendorById(id: string): Promise<Vendor | null> {
  // TODO: Implement
  throw new Error("Not implemented");
}

export async function getVendors(): Promise<Vendor[]> {
  // TODO: Implement
  throw new Error("Not implemented");
}

import { eligiblePartners, type AgentProfile, type VendorPartner as DomainVendorPartner } from '@/lib/vendor_rules';
import { getServiceById } from './services';

/**
 * Get eligible co-pay partners for a service
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

    // 2. Fetch all partners from fixtures (TODO: Replace with BFF/DB call)
    const allPartners: DomainVendorPartner[] = [
      {
        id: crypto.randomUUID(),
        name: "Keller Williams Co-Pay Program",
        markets: ["san francisco", "los angeles", "san diego", "sacramento"],
        minAgentDealsPerYear: 5,
        allowedServiceIds: [params.serviceId],
        prohibitedServiceIds: [],
        copayPolicy: {
          enabled: true,
          sharePct: 50,
          maxShareCentsPerOrder: 50000,
        },
      },
      {
        id: crypto.randomUUID(),
        name: "RE/MAX Agent Advantage",
        markets: ["san francisco", "oakland", "san jose", "berkeley"],
        minAgentDealsPerYear: 8,
        allowedServiceIds: [params.serviceId],
        prohibitedServiceIds: [],
        copayPolicy: {
          enabled: true,
          sharePct: 40,
          maxShareCentsPerOrder: 40000,
        },
      },
    ];

    // 3. Build agent profile
    const agentProfile: AgentProfile = {
      dealsLast12m: params.agentDealsPerYear || 0,
    };

    // 4. Call pure eligibility function
    const eligible = eligiblePartners(
      allPartners,
      { id: service.id, vendor: service.vendor },
      params.city || '',
      agentProfile
    );

    // 5. Map domain types back to contract types for now
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
