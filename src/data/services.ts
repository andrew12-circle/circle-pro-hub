// src/data/services.ts
import type { ServiceCard, ServiceFunnel } from '../../contracts/marketplace';

const API = import.meta.env.VITE_API_BASE?.replace(/\/$/, '') || '';
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

async function fetchJson<T>(url: string, init?: RequestInit): Promise<T> {
  const ctrl = new AbortController();
  const id = setTimeout(() => ctrl.abort(), 5_000);
  try {
    const res = await fetch(url, {
      credentials: 'include',
      signal: ctrl.signal,
      headers: { 'accept': 'application/json' },
      ...init,
    });
    if (!res.ok) {
      const text = await res.text().catch(() => '');
      throw new Error(`HTTP ${res.status} ${res.statusText} @ ${url} :: ${text}`);
    }
    return (await res.json()) as T;
  } finally {
    clearTimeout(id);
  }
}

export interface ServiceFilters {
  category?: string;
  rating?: number;
  price?: { min?: number; max?: number };
  verification?: boolean;
  search?: string;
  location?: string;
}

export interface GetServicesParams {
  filters?: ServiceFilters;
  page?: number;
  limit?: number;
  sortBy?: string;
}

/** List services (grid). Backed by BFF cache (ETag + SWR). */
export async function getServices(params?: GetServicesParams): Promise<ServiceCard[]> {
  const queryParams: Record<string, string | number | boolean> = {};
  
  if (params?.filters) {
    if (params.filters.category) queryParams.category = params.filters.category;
    if (params.filters.rating) queryParams.rating = params.filters.rating;
    if (params.filters.search) queryParams.search = params.filters.search;
    if (params.filters.location) queryParams.location = params.filters.location;
    if (params.filters.verification !== undefined) queryParams.verification = params.filters.verification;
    if (params.filters.price?.min) queryParams.priceMin = params.filters.price.min;
    if (params.filters.price?.max) queryParams.priceMax = params.filters.price.max;
  }
  
  if (params?.page) queryParams.page = params.page;
  if (params?.limit) queryParams.limit = params.limit;
  if (params?.sortBy) queryParams.sortBy = params.sortBy;

  const qs = Object.keys(queryParams).length > 0
    ? '?' +
      Object.entries(queryParams)
        .filter(([, v]) => v !== undefined && v !== null && v !== '')
        .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`)
        .join('&')
    : '';
  
  // Try edge function BFF first (deployed with Lovable Cloud)
  // Two-strike breaker: try twice with 5s timeout each before falling back
  if (SUPABASE_URL && SUPABASE_ANON_KEY) {
    const hardTimeout = (ms: number) => new Promise<never>((_, reject) => 
      setTimeout(() => reject(new Error('Timeout')), ms)
    );
    
    const url = `${SUPABASE_URL}/functions/v1/services-list${qs}`;
    if (import.meta.env.DEV) {
      console.info('[Services] Attempting BFF call:', url);
    }
    
    // First attempt
    try {
      const services = await Promise.race([
        fetchJson<ServiceCard[]>(url, {
          headers: { Authorization: `Bearer ${SUPABASE_ANON_KEY}` },
        }),
        hardTimeout(5000),
      ]);
      if (import.meta.env.DEV) {
        console.info('[Services] ✓ Loaded from BFF edge function:', services.length);
      }
      return services;
    } catch (error) {
      if (import.meta.env.DEV) {
        console.warn('[Services] First BFF attempt failed:', error);
      }
      
      // Second attempt (strike two)
      try {
        const services = await Promise.race([
          fetchJson<ServiceCard[]>(url, {
            headers: { Authorization: `Bearer ${SUPABASE_ANON_KEY}` },
          }),
          hardTimeout(5000),
        ]);
        if (import.meta.env.DEV) {
          console.info('[Services] ✓ Second attempt succeeded:', services.length);
        }
        return services;
      } catch (secondError) {
        if (import.meta.env.DEV) {
          console.warn('[Services] Second BFF attempt failed, falling back:', secondError);
        }
      }
    }
  }
  
  // If external API base is set, try it
  if (API) {
    try {
      return await fetchJson<ServiceCard[]>(`${API}/api/services${qs}`);
    } catch (error) {
      if (import.meta.env.DEV) {
        console.warn('[Services] External API failed, falling back to fixtures:', error);
      }
    }
  }
  
  // Fallback to local fixtures (last resort)
  if (import.meta.env.DEV) {
    console.warn('[Services] ⚠ Using local fixtures fallback');
  }
  const response = await fetch('/fixtures/services.json');
  const services = await response.json() as ServiceCard[];
  
  // Apply client-side filtering for fixture mode
  let filtered = services;
  
  if (params?.filters) {
    if (params.filters.category) {
      filtered = filtered.filter((s) => s.category === params.filters?.category);
    }
    if (params.filters.search) {
      const search = params.filters.search.toLowerCase();
      filtered = filtered.filter((s) => 
        s.name.toLowerCase().includes(search) || 
        s.tagline.toLowerCase().includes(search)
      );
    }
    if (params.filters.location) {
      const location = params.filters.location.toLowerCase();
      filtered = filtered.filter((s) => 
        s.serviceAreas.some((area) => area.toLowerCase().includes(location))
      );
    }
    if (params.filters.rating) {
      filtered = filtered.filter((s) => s.rating >= (params.filters?.rating || 0));
    }
    if (params.filters.verification) {
      filtered = filtered.filter((s) => s.vendor.verified);
    }
  }
  
  return filtered;
}

/** Service detail (funnel). */
export async function getServiceById(
  id: string
): Promise<ServiceFunnel | null> {
  if (!id) return null;
  
  if (!API) {
    const response = await fetch('/fixtures/services.json');
    const services = await response.json() as ServiceFunnel[];
    const service = services.find((s) => s.id === id);
    return service || null;
  }
  
  try {
    const data = await fetchJson<{ card: ServiceCard; funnel: ServiceFunnel }>(`${API}/api/services/${id}`);
    // For now, return the funnel directly (BFF will merge card + funnel)
    // In fixture mode, we already have full ServiceFunnel
    return data.funnel || (data as unknown as ServiceFunnel);
  } catch {
    return null;
  }
}
