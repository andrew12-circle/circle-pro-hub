import { supabase } from '@/integrations/supabase/client';
import type { ServiceCard, PromotedCard } from '@/types/marketplace';

export async function getMarketplaceCards(): Promise<ServiceCard[]> {
  const { data, error } = await supabase
    .from('service_cards')
    .select('*')
    .order('is_featured', { ascending: false })
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data || []) as ServiceCard[];
}

export async function getPromotedCards(): Promise<PromotedCard[]> {
  const { data, error } = await supabase
    .from('promoted_cards')
    .select('*')
    .order('slot', { ascending: true });

  if (error) throw error;
  return (data || []) as PromotedCard[];
}
