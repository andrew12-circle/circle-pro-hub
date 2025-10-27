import { Link } from "react-router-dom";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, Crown, Handshake, Share2, Heart } from "lucide-react";
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

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < Math.floor(rating)
            ? 'fill-yellow-400 text-yellow-400'
            : 'fill-none text-gray-300'
        }`}
      />
    ));
  };

  return (
    <Card className="flex flex-col h-full hover:shadow-lg transition-shadow">
      <CardContent className="p-6 flex-1 space-y-4">
        {/* Vendor Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {service.vendor_logo && (
              <img
                src={service.vendor_logo}
                alt={service.vendor_name}
                className="w-10 h-10 rounded-full object-cover"
              />
            )}
            <div>
              <h4 className="font-semibold text-base">{service.vendor_name}</h4>
              <div className="flex items-center gap-1 text-sm">
                <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                <span className="font-medium">{service.rating.toFixed(1)}</span>
                <span className="text-muted-foreground">({service.review_count})</span>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Share2 className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Heart className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Description */}
        {service.subtitle && (
          <div>
            <p className="text-sm text-muted-foreground line-clamp-3">
              🔥 {service.subtitle}
            </p>
            <button className="text-sm text-primary font-medium mt-1">See more</button>
          </div>
        )}

        {/* Service Package Section */}
        <div className="flex flex-col items-center py-4">
          <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-3">
            <span className="text-2xl font-bold text-primary">
              {getInitials(service.title)}
            </span>
          </div>
          <h3 className="font-bold text-xl text-center mb-3">{service.title}</h3>
          <div className="flex items-center gap-1">
            {renderStars(service.rating)}
            <span className="text-sm text-muted-foreground ml-1">({service.review_count})</span>
          </div>
        </div>

        {/* Pricing Section */}
        <div className="space-y-3">
          {/* Retail Price */}
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Retail Price:</span>
            <span className="text-xl font-bold">
              {formatPrice(service.pricing.retail.amount, service.pricing.retail.currency)}/mo
            </span>
          </div>

          {/* Pro Price */}
          {service.pricing.pro && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Crown className="w-5 h-5 text-blue-600" />
                <span className="font-semibold text-blue-600">Unlock Pro Price</span>
              </div>
              <span className="text-xl font-bold text-blue-600">
                {formatPrice(service.pricing.pro.amount, service.pricing.pro.currency)}/mo
              </span>
            </div>
          )}

          {/* Co-Pay Section */}
          {service.pricing.copayWithVendor && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 space-y-2">
              <div className="flex items-center gap-2 mb-2">
                <Handshake className="w-5 h-5 text-green-600" />
                <span className="font-semibold text-green-600">Unlock Co-Pay</span>
              </div>
              <p className="text-sm text-green-700">
                We have vendors lined up: Lender's, Title, HOI, Warranty, Moving Etc. click quick apply waiting to help reduce your bill
              </p>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-green-700">With Vendor Help:</span>
                  <span className="font-bold text-green-700">
                    {formatPrice(service.pricing.copayWithVendor.amount, service.pricing.copayWithVendor.currency)}/mo
                  </span>
                </div>
                {service.pricing.copayNonSettlement && (
                  <div className="flex justify-between">
                    <span className="text-green-700">Non Settlement Service Provider:</span>
                    <span className="font-bold text-green-700">
                      {formatPrice(service.pricing.copayNonSettlement.amount, service.pricing.copayNonSettlement.currency)}/mo
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Promotional Badge */}
        {service.badges.length > 0 && (
          <div className="flex justify-center">
            <Badge variant="destructive" className="text-sm font-bold px-4 py-1">
              {service.badges[0]}
            </Badge>
          </div>
        )}
      </CardContent>

      <CardFooter className="p-6 pt-0 flex flex-col gap-3">
        {/* Action Buttons */}
        <div className="flex gap-3 w-full">
          <Button variant="outline" className="flex-1">
            Add
          </Button>
          <Link to={`/services/${service.slug}`} className="flex-1">
            <Button className="w-full">Learn more</Button>
          </Link>
        </div>

        {/* Pro Savings Guarantee */}
        <p className="text-xs text-muted-foreground text-center">
          <span className="font-semibold">Pro Savings Guarantee.</span> If your first month Pro credits and coverage do not equal or exceed your membership fee we credit the difference as marketplace credit.
        </p>
      </CardFooter>
    </Card>
  );
};
