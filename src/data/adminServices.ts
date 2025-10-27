/**
 * Admin Services data facade - Direct-to-Live
 * Reads/writes directly to services table (single source of truth)
 */

import { supabase } from "@/integrations/supabase/client";

export interface ServiceEditData {
  // Card fields
  name: string;
  tagline: string | null;
  category: string | null;
  badges: string[];
  slug: string | null;
  roi_note: string | null;
  time_to_value: string | null;
  cover_image: string | null;
  rating: number;
  reviews: number;
  featured: boolean;
  
  // Pricing (JSONB)
  pricing: any;
  
  // Funnel fields (JSONB)
  packages: any;
  faq: any;
  media: any;
  compliance: any;
  
  // Metadata
  vendor_id: string;
  is_active: boolean;
  service_areas: string[];
  city_scope: string;
  sort_order: number;
}

/**
 * GET service for editing - loads all fields from services table
 */
export async function getServiceForEdit(serviceId: string): Promise<ServiceEditData> {
  const { data, error } = await supabase
    .from('services')
    .select('*')
    .eq('id', serviceId)
    .single();

  if (error) {
    throw new Error(`Failed to load service: ${error.message}`);
  }

  if (!data) {
    throw new Error('Service not found');
  }

  return data as ServiceEditData;
}

/**
 * UPDATE service - saves directly to services table
 */
export async function updateService(
  serviceId: string,
  updates: Partial<ServiceEditData>
): Promise<ServiceEditData> {
  const { data, error } = await supabase
    .from('services')
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq('id', serviceId)
    .select('*')
    .single();

  if (error) {
    throw new Error(`Failed to update service: ${error.message}`);
  }

  if (!data) {
    throw new Error('Service not found after update');
  }

  return data as ServiceEditData;
}

/**
 * LIST all services for admin management
 */
export async function listServicesForAdmin(): Promise<Array<{
  id: string;
  name: string;
  category: string | null;
  is_active: boolean;
  featured: boolean;
  vendor_id: string;
}>> {
  const { data, error } = await supabase
    .from('services')
    .select('id, name, category, is_active, featured, vendor_id')
    .order('name', { ascending: true });

  if (error) {
    throw new Error(`Failed to list services: ${error.message}`);
  }

  return data || [];
}
