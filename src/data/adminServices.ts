/**
 * Admin Services data facade - thin layer over admin-services edge function
 */

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;

function getAdminServicesUrl(path: string): string {
  return `${SUPABASE_URL}/functions/v1/admin-services${path}`;
}

export async function getServiceDraft(serviceId: string) {
  const response = await fetch(getAdminServicesUrl(`/admin/services/${serviceId}`), {
    headers: { "x-admin": "true" }
  });
  if (!response.ok) throw new Error("Failed to load service draft");
  return response.json();
}

export async function patchCard(serviceId: string, card: any, row_version: number) {
  const response = await fetch(
    getAdminServicesUrl(`/admin/services/${serviceId}/card?row_version=${row_version}`),
    {
      method: "PATCH",
      headers: { "content-type": "application/json", "x-admin": "true" },
      body: JSON.stringify(card)
    }
  );
  if (response.status === 409) {
    const error: any = new Error("Version conflict");
    error.status = 409;
    throw error;
  }
  if (!response.ok) throw new Error("Failed to save card");
  return response.json();
}

export async function patchPricing(serviceId: string, pricing: any, row_version: number) {
  const response = await fetch(
    getAdminServicesUrl(`/admin/services/${serviceId}/pricing?row_version=${row_version}`),
    {
      method: "PATCH",
      headers: { "content-type": "application/json", "x-admin": "true" },
      body: JSON.stringify(pricing)
    }
  );
  if (response.status === 409) {
    const error: any = new Error("Version conflict");
    error.status = 409;
    throw error;
  }
  if (!response.ok) throw new Error("Failed to save pricing");
  return response.json();
}

export async function patchFunnel(serviceId: string, funnel: any, row_version: number) {
  const response = await fetch(
    getAdminServicesUrl(`/admin/services/${serviceId}/funnel?row_version=${row_version}`),
    {
      method: "PATCH",
      headers: { "content-type": "application/json", "x-admin": "true" },
      body: JSON.stringify(funnel)
    }
  );
  if (response.status === 409) {
    const error: any = new Error("Version conflict");
    error.status = 409;
    throw error;
  }
  if (!response.ok) throw new Error("Failed to save funnel");
  return response.json();
}

export async function publishVersion(draft: { id: string }) {
  const response = await fetch(
    getAdminServicesUrl(`/admin/service-versions/${draft.id}/publish`),
    {
      method: "POST",
      headers: { "x-admin": "true" }
    }
  );
  if (!response.ok) throw new Error("Failed to publish version");
  return response.json();
}
