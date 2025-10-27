export interface ServiceCard {
  id: string;
  slug: string;
  title: string;
  subtitle: string | null;
  category: string | null;
  badges: string[];
  roi_note: string | null;
  time_to_value: string | null;
  cover_image: string | null;
  rating: number;
  review_count: number;
  is_featured: boolean;
  vendor_name: string;
  vendor_logo: string | null;
  pricing: {
    retail: { amount: number; currency: string };
    pro?: { amount: number; currency: string };
    proPctSavings?: number;
    copayWithVendor?: { amount: number; currency: string };
    copayNonSettlement?: { amount: number; currency: string };
  };
}

export interface PromotedCard extends ServiceCard {
  slot: number;
}
