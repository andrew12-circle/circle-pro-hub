import { ServiceCard } from "./ServiceCard";
import type { ServiceCard as ServiceCardType } from "@/types/marketplace";

interface MarketplaceGridProps {
  services: ServiceCardType[];
}

export const MarketplaceGrid = ({ services }: MarketplaceGridProps) => {
  if (services.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No services found</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {services.map((service) => (
        <ServiceCard key={service.id} service={service} />
      ))}
    </div>
  );
};
