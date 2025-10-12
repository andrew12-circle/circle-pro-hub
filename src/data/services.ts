import { ServiceCard, ServiceFunnel } from "../../contracts/marketplace";

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

export async function getServices(params: GetServicesParams): Promise<ServiceCard[]> {
  // TODO: Implement with cache.getOrSet → adapters.search.listServices
  throw new Error("Not implemented");
}

export async function getServiceById(id: string): Promise<ServiceFunnel | null> {
  // TODO: Implement with cache.getOrSet → adapters.db.query
  throw new Error("Not implemented");
}
