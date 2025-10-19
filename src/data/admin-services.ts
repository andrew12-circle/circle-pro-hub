/**
 * Admin Services data facade
 * Centralizes all admin service version operations
 */

import { supabase } from "@/integrations/supabase/client";
import type { ServiceCardEdit, ServicePricingEdit, ServiceFunnelEdit } from "@/contracts/admin/service-version";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;

export interface ServiceVersionDetail {
  service: any;
  draft: any | null;
  published: any | null;
  history: any[];
}

function getAdminServicesUrl(path: string): string {
  return `${SUPABASE_URL}/functions/v1/admin-services${path}`;
}

async function fetchWithAuth<T>(url: string, options: RequestInit = {}): Promise<T> {
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) {
    throw new Error('Not authenticated');
  }

  const response = await fetch(url, {
    ...options,
    headers: {
      'Authorization': `Bearer ${session.access_token}`,
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: response.statusText }));
    throw new Error(error.error || `HTTP ${response.status}`);
  }

  return response.json();
}

export async function getServiceVersions(serviceId: string): Promise<ServiceVersionDetail> {
  const url = getAdminServicesUrl(`/${serviceId}`);
  return fetchWithAuth<ServiceVersionDetail>(url);
}

export async function updateServiceCard(serviceId: string, card: ServiceCardEdit, pricing: ServicePricingEdit): Promise<void> {
  const url = getAdminServicesUrl(`/${serviceId}/card`);
  await fetchWithAuth(url, {
    method: 'PATCH',
    body: JSON.stringify({ card, pricing }),
  });
}

export async function updateServicePricing(serviceId: string, pricing: ServicePricingEdit, card: ServiceCardEdit): Promise<void> {
  const url = getAdminServicesUrl(`/${serviceId}/pricing`);
  await fetchWithAuth(url, {
    method: 'PATCH',
    body: JSON.stringify({ pricing, card }),
  });
}

export async function updateServiceFunnel(serviceId: string, funnel: ServiceFunnelEdit, card: ServiceCardEdit, pricing: ServicePricingEdit): Promise<void> {
  const url = getAdminServicesUrl(`/${serviceId}/funnel`);
  await fetchWithAuth(url, {
    method: 'PATCH',
    body: JSON.stringify({ funnel, card, pricing }),
  });
}

export async function submitServiceForReview(serviceId: string): Promise<void> {
  const url = getAdminServicesUrl(`/${serviceId}/submit`);
  await fetchWithAuth(url, { method: 'POST' });
}

export async function publishServiceVersion(versionId: string): Promise<void> {
  const url = getAdminServicesUrl(`/versions/${versionId}/publish`);
  await fetchWithAuth(url, { method: 'POST' });
}

export async function rollbackService(serviceId: string, toVersionId: string): Promise<void> {
  const url = getAdminServicesUrl(`/${serviceId}/rollback?to=${toVersionId}`);
  await fetchWithAuth(url, { method: 'POST' });
}
