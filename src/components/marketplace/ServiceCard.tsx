import { Link } from "react-router-dom";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star } from "lucide-react";
import type { ServiceCard as ServiceCardType } from "@/types/marketplace";

interface ServiceCardProps {
  service: ServiceCardType;
}

export const ServiceCard = ({ service }: ServiceCardProps) => {
  const formatPrice = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <Card className="flex flex-col h-full hover:shadow-lg transition-shadow">
      <CardContent className="p-6 flex-1">
        <div className="flex items-start gap-4 mb-4">
          {service.vendor_logo && (
            <img
              src={service.vendor_logo}
              alt={service.vendor_name}
              className="w-12 h-12 rounded-lg object-cover"
            />
          )}
          <div className="flex-1">
            <h3 className="font-semibold text-lg mb-1">{service.title}</h3>
            <p className="text-sm text-muted-foreground">{service.vendor_name}</p>
          </div>
        </div>

        {service.cover_image && (
          <img
            src={service.cover_image}
            alt={service.title}
            className="w-full h-48 object-cover rounded-lg mb-4"
          />
        )}

        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
          {service.subtitle}
        </p>

        <div className="flex items-center gap-2 mb-4">
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4 fill-primary text-primary" />
            <span className="font-medium">{service.rating.toFixed(1)}</span>
          </div>
          <span className="text-sm text-muted-foreground">
            ({service.review_count} reviews)
          </span>
        </div>

        {service.badges.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {service.badges.slice(0, 3).map((badge) => (
              <Badge key={badge} variant="secondary">
                {badge}
              </Badge>
            ))}
          </div>
        )}

        {service.roi_note && (
          <p className="text-sm font-medium text-primary mb-2">
            {service.roi_note}
          </p>
        )}

        {service.time_to_value && (
          <p className="text-sm text-muted-foreground">
            Time to value: {service.time_to_value}
          </p>
        )}
      </CardContent>

      <CardFooter className="p-6 pt-0 flex flex-col gap-3">
        <div className="flex items-baseline gap-2 w-full">
          <span className="text-2xl font-bold">
            {formatPrice(service.pricing.retail.amount, service.pricing.retail.currency)}
          </span>
          {service.pricing.pro && (
            <span className="text-sm text-muted-foreground line-through">
              {formatPrice(service.pricing.pro.amount, service.pricing.pro.currency)}
            </span>
          )}
        </div>
        <Link to={`/services/${service.slug}`} className="w-full">
          <Button className="w-full">Learn More</Button>
        </Link>
      </CardFooter>
    </Card>
  );
};
