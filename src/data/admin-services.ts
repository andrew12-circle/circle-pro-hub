/**
 * Admin Services data facade
 * Centralizes all admin service version operations
 */

import { supabase } from "@/integrations/supabase/client";
import type { ServiceCardEdit, ServicePricingEdit, ServiceFunnelEdit } from "@/contracts/admin/service-version";

export interface ServiceVersionDetail {
  service: any;
  draft: any | null;
  published: any | null;
  history: any[];
}

export async function getServiceVersions(serviceId: string): Promise<ServiceVersionDetail> {
  const { data, error } = await supabase.functions.invoke(`admin-services/${serviceId}`, {
    method: 'GET'
  });

  if (error) throw error;
  return data;
}

export async function updateServiceCard(serviceId: string, card: ServiceCardEdit, pricing: ServicePricingEdit): Promise<void> {
  const { error } = await supabase.functions.invoke(`admin-services/${serviceId}/card`, {
    method: 'PATCH',
    body: { card, pricing }
  });

  if (error) throw error;
}

export async function updateServicePricing(serviceId: string, pricing: ServicePricingEdit, card: ServiceCardEdit): Promise<void> {
  const { error } = await supabase.functions.invoke(`admin-services/${serviceId}/pricing`, {
    method: 'PATCH',
    body: { pricing, card }
  });

  if (error) throw error;
}

export async function updateServiceFunnel(serviceId: string, funnel: ServiceFunnelEdit, card: ServiceCardEdit, pricing: ServicePricingEdit): Promise<void> {
  const { error } = await supabase.functions.invoke(`admin-services/${serviceId}/funnel`, {
    method: 'PATCH',
    body: { funnel, card, pricing }
  });

  if (error) throw error;
}

export async function submitServiceForReview(serviceId: string): Promise<void> {
  const { error } = await supabase.functions.invoke(`admin-services/${serviceId}/submit`, {
    method: 'POST'
  });

  if (error) throw error;
}

export async function publishServiceVersion(versionId: string): Promise<void> {
  const { error } = await supabase.functions.invoke(`admin-services/versions/${versionId}/publish`, {
    method: 'POST'
  });

  if (error) throw error;
}

export async function rollbackService(serviceId: string, toVersionId: string): Promise<void> {
  const { error } = await supabase.functions.invoke(`admin-services/${serviceId}/rollback?to=${toVersionId}`, {
    method: 'POST'
  });

  if (error) throw error;
}
