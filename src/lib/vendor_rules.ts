import { VendorPartner, CopayEligibility } from "../../contracts/affiliates/partner";

export interface AgentProfile {
  city?: string;
  dealsPerYear?: number;
}

export interface EligibilityParams {
  serviceId: string;
  city?: string;
  agentProfile?: AgentProfile;
}

/**
 * Vendor eligibility rules for Co-Pay pricing
 * 
 * Rule: copay.enabled ∧ city in markets ∧ deals >= minAgentDealsPerYear ∧ 
 *       service in allowed ∧ service ∉ prohibited
 */
export function isPartnerEligible(
  partner: VendorPartner,
  params: EligibilityParams
): boolean {
  const { serviceId, city, agentProfile } = params;
  const { copayEligibility } = partner;

  // Rule 1: Co-pay must be enabled
  if (!copayEligibility.enabled) {
    return false;
  }

  // Rule 2: City must be in partner's markets (if city provided)
  if (city && !partner.markets.includes(city)) {
    return false;
  }

  // Rule 3: Agent must meet minimum deals per year threshold
  const agentDeals = agentProfile?.dealsPerYear || 0;
  if (agentDeals < copayEligibility.minAgentDealsPerYear) {
    return false;
  }

  // Rule 4: Service must be in allowed list
  if (!copayEligibility.allowedServiceIds.includes(serviceId)) {
    return false;
  }

  // Rule 5: Service must NOT be in prohibited list
  if (copayEligibility.prohibitedServiceIds.includes(serviceId)) {
    return false;
  }

  return true;
}

/**
 * Filter and return eligible partners for a given service and agent
 */
export function getEligiblePartners(
  allPartners: VendorPartner[],
  params: EligibilityParams
): VendorPartner[] {
  return allPartners.filter((partner) => isPartnerEligible(partner, params));
}

/**
 * Get eligibility failure reason for debugging/UI messaging
 */
export function getIneligibilityReason(
  partner: VendorPartner,
  params: EligibilityParams
): string | null {
  const { serviceId, city, agentProfile } = params;
  const { copayEligibility } = partner;

  if (!copayEligibility.enabled) {
    return "Co-pay is not enabled for this partner";
  }

  if (city && !partner.markets.includes(city)) {
    return `Not available in ${city}`;
  }

  const agentDeals = agentProfile?.dealsPerYear || 0;
  if (agentDeals < copayEligibility.minAgentDealsPerYear) {
    return `Requires ${copayEligibility.minAgentDealsPerYear}+ deals per year (you have ${agentDeals})`;
  }

  if (!copayEligibility.allowedServiceIds.includes(serviceId)) {
    return "This service is not covered by this partner";
  }

  if (copayEligibility.prohibitedServiceIds.includes(serviceId)) {
    return "This service is excluded from co-pay";
  }

  return null;
}
