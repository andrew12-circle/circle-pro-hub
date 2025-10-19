/**
 * Admin Services data facade - MVASE (Minimum Viable Admin Services Editor)
 * Two endpoints only: GET and PUT
 */

import { supabase } from "@/integrations/supabase/client";
import type { TServiceDraft } from "@/schemas/service";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;

function getAdminServicesUrl(path: string): string {
  return `${SUPABASE_URL}/functions/v1${path}`;
}

async function getAuthHeaders(): Promise<HeadersInit> {
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) {
    throw new Error('Not authenticated');
  }

  return {
    'Authorization': `Bearer ${session.access_token}`,
    'Content-Type': 'application/json',
  };
}

export interface ServiceDraftResponse {
  draft: TServiceDraft;
}

/**
 * GET /admin/services/:id
 * Returns the current draft (or creates one if none exists)
 */
export async function getServiceDraft(serviceId: string): Promise<ServiceDraftResponse> {
  const headers = await getAuthHeaders();
  
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 6000);

  try {
    const response = await fetch(
      getAdminServicesUrl(`/admin/services/${serviceId}`),
      { 
        headers,
        signal: controller.signal,
      }
    );

    clearTimeout(timeoutId);

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: response.statusText }));
      throw new Error(error.error || `HTTP ${response.status}`);
    }

    return response.json();
  } catch (error) {
    clearTimeout(timeoutId);
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('Request timeout (6s)');
    }
    throw error;
  }
}

/**
 * PUT /admin/services/:id
 * Saves the entire draft (card + pricing + funnel) in one write
 * Returns 409 on version conflict
 */
export async function saveServiceDraft(
  serviceId: string, 
  draft: TServiceDraft
): Promise<ServiceDraftResponse> {
  const headers = await getAuthHeaders();
  
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 6000);

  try {
    const response = await fetch(
      getAdminServicesUrl(`/admin/services/${serviceId}`),
      {
        method: 'PUT',
        headers,
        body: JSON.stringify(draft),
        signal: controller.signal,
      }
    );

    clearTimeout(timeoutId);

    if (response.status === 409) {
      const conflict = await response.json().catch(() => ({}));
      const error: any = new Error(conflict.error || 'Version conflict');
      error.status = 409;
      error.details = conflict;
      throw error;
    }

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: response.statusText }));
      throw new Error(error.error || `HTTP ${response.status}`);
    }

    return response.json();
  } catch (error) {
    clearTimeout(timeoutId);
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('Request timeout (6s)');
    }
    throw error;
  }
}
