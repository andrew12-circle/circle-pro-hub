import { ServiceCard } from "../../contracts/marketplace";

export interface Vendor {
  id: string;
  name: string;
  logo: string;
  verified: boolean;
  rating: number;
  reviews: number;
  services: ServiceCard[];
}

export async function getVendorById(id: string): Promise<Vendor | null> {
  // TODO: Implement
  throw new Error("Not implemented");
}

export async function getVendors(): Promise<Vendor[]> {
  // TODO: Implement
  throw new Error("Not implemented");
}
