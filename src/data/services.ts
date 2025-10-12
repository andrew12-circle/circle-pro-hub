import { ServiceCard, ServiceFunnel } from "../../contracts/marketplace";
import servicesFixtures from "../../fixtures/services.json";

export interface ServiceFilters {
  category?: string;
  minRating?: number;
  maxPrice?: number;
  verified?: boolean;
  search?: string;
}

export interface GetServicesParams {
  filters?: ServiceFilters;
  limit?: number;
  offset?: number;
  sortBy?: "rating" | "price" | "reviews";
}

function matchesFilters(service: ServiceFunnel, filters?: ServiceFilters): boolean {
  if (!filters) return true;

  if (filters.category && service.category !== filters.category) {
    return false;
  }

  if (filters.minRating && service.rating < filters.minRating) {
    return false;
  }

  if (filters.maxPrice && service.pricing.retail.amount > filters.maxPrice) {
    return false;
  }

  if (filters.verified !== undefined && service.vendor.verified !== filters.verified) {
    return false;
  }

  if (filters.search) {
    const searchLower = filters.search.toLowerCase();
    const searchableText = `${service.name} ${service.tagline} ${service.category} ${service.vendor.name}`.toLowerCase();
    if (!searchableText.includes(searchLower)) {
      return false;
    }
  }

  return true;
}

function sortServices(services: ServiceFunnel[], sortBy?: string): ServiceFunnel[] {
  const sorted = [...services];

  switch (sortBy) {
    case "rating":
      sorted.sort((a, b) => b.rating - a.rating);
      break;
    case "price":
      sorted.sort((a, b) => a.pricing.retail.amount - b.pricing.retail.amount);
      break;
    case "reviews":
      sorted.sort((a, b) => b.reviews - a.reviews);
      break;
    default:
      // Default: featured first, then rating
      sorted.sort((a, b) => {
        if (a.featured && !b.featured) return -1;
        if (!a.featured && b.featured) return 1;
        return b.rating - a.rating;
      });
  }

  return sorted;
}

export async function getServices(params: GetServicesParams = {}): Promise<ServiceCard[]> {
  const { filters, limit, offset = 0, sortBy } = params;

  // Cast fixtures to ServiceFunnel[] (they contain all funnel data)
  const allServices = servicesFixtures as ServiceFunnel[];

  // Apply filters
  let filtered = allServices.filter((service) => matchesFilters(service, filters));

  // Apply sorting
  filtered = sortServices(filtered, sortBy);

  // Apply pagination
  const paginated = filtered.slice(offset, limit ? offset + limit : undefined);

  // Map to ServiceCard (subset of ServiceFunnel)
  return paginated.map((service) => ({
    id: service.id,
    name: service.name,
    vendor: service.vendor,
    tagline: service.tagline,
    category: service.category,
    rating: service.rating,
    reviews: service.reviews,
    reviewHighlight: service.reviewHighlight,
    pricing: service.pricing,
    featured: service.featured,
    badges: service.badges,
  }));
}

export async function getServiceById(id: string): Promise<ServiceFunnel | null> {
  const allServices = servicesFixtures as ServiceFunnel[];
  const service = allServices.find((s) => s.id === id);
  return service || null;
}
