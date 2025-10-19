import { useState } from "react";
import { Star, Share2, Heart, Crown, HandshakeIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import { getServices } from "@/data/services";

interface FeaturedVendorsProps {
  onServiceClick: (serviceId: string) => void;
  featured?: boolean;
  noContainer?: boolean;
}

export const FeaturedVendors = ({ onServiceClick, featured = false, noContainer = false }: FeaturedVendorsProps) => {
  const [expandedCards, setExpandedCards] = useState<Record<string, boolean>>({});

  const { data: services, isLoading } = useQuery({
    queryKey: ['services', 'featured'],
    queryFn: async () => {
      const data = await getServices({ 
        filters: { category: featured ? undefined : undefined },
        limit: featured ? 4 : 100
      });
      return data;
    },
  });

  const toggleCardExpansion = (id: string) => {
    setExpandedCards(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  if (isLoading) {
    return (
      <section className="w-full py-16 bg-background">
        <div className={noContainer ? "" : "container px-4"}>
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-2">{featured ? "Top Rated Vendors" : "All Vendors"}</h2>
              <p className="text-lg text-muted-foreground">Trusted by thousands of agents nationwide</p>
            </div>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-card rounded-2xl border overflow-hidden p-4">
                <Skeleton className="h-24 w-full mb-4" />
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-full mb-4" />
                <Skeleton className="h-10 w-full" />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  const displayServices = services || [];

  const content = (
    <>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl md:text-4xl font-bold mb-2">{featured ? "Top Rated Vendors" : "All Vendors"}</h2>
          <p className="text-lg text-muted-foreground">Trusted by thousands of agents nationwide</p>
        </div>
        {featured && (
          <Button variant="outline" asChild>
            <a href="/marketplace">View All</a>
          </Button>
        )}
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {displayServices.map((service) => (
            <div key={service.id} className="group">
              <div className="bg-card rounded-2xl border overflow-hidden hover-lift">
                {/* Mobile: Horizontal Layout */}
                <div className="md:hidden flex h-full">
                  {/* Left: Logo Section */}
                  <div className="w-24 flex-shrink-0 border-r bg-gradient-to-br from-background to-muted/30 flex items-center justify-center p-2">
                    <div className="text-center">
                      <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-1">
                        {service.vendor.logo ? (
                          <img src={service.vendor.logo} alt={service.vendor.name} className="h-8 w-8 rounded-full object-cover" />
                        ) : (
                          <span className="text-xl font-bold text-primary">{service.vendor.name.substring(0, 2).toUpperCase()}</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right: Content */}
                  <div className="flex-1 flex flex-col">
                    {/* Header */}
                    <div className="p-3 border-b flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-sm line-clamp-2 mb-1">{service.name}</div>
                        <div className="flex items-center gap-1 text-xs mb-1">
                          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400 flex-shrink-0" />
                          <span className="font-semibold">{service.rating}</span>
                          <span className="text-muted-foreground">({service.reviews})</span>
                        </div>
                      </div>
                      <div className="flex gap-1 flex-shrink-0">
                        <Button variant="ghost" size="icon" className="h-7 w-7">
                          <Share2 className="h-3.5 w-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7">
                          <Heart className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>

                    {/* Description */}
                    <div className="p-3 border-b">
                      <p className={`text-xs text-muted-foreground mb-1 ${expandedCards[service.id] ? '' : 'line-clamp-2'}`}>
                        🔥 {service.tagline}
                      </p>
                      <button 
                        onClick={() => toggleCardExpansion(service.id)}
                        className="text-xs text-primary hover:underline font-medium"
                      >
                        {expandedCards[service.id] ? 'See less' : 'See more'}
                      </button>
                    </div>

                    {/* Pricing */}
                    <div className="p-3 space-y-2">
                      {/* Retail Price */}
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">Retail:</span>
                        <span className="font-bold">${service.pricing.retail.amount}/mo</span>
                      </div>

                      {/* Pro Price */}
                      {service.pricing.pro && (
                        <div className="flex items-center justify-between p-1.5 bg-primary/5 rounded border border-primary/20">
                          <div className="flex items-center gap-1 text-xs">
                            <Crown className="h-3 w-3 text-primary" />
                            <span className="font-medium text-primary">Pro</span>
                          </div>
                          <span className="font-bold text-xs text-primary">${service.pricing.pro.amount}/mo</span>
                        </div>
                      )}

                      {/* Co-pay Section */}
                      {service.pricing.copayWithVendor && (
                        <div className="p-2 bg-copay-muted rounded border border-copay/30">
                          <div className="flex items-center gap-1 text-xs font-medium text-copay mb-1">
                            <HandshakeIcon className="h-3 w-3" />
                            <span>Co-Pay</span>
                          </div>
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-copay">From:</span>
                            <span className="font-bold text-copay">${service.pricing.copayWithVendor.amount}/mo</span>
                          </div>
                        </div>
                      )}

                      {/* Discount Badge */}
                      {service.pricing.proPctSavings && (
                        <Badge className="bg-destructive text-destructive-foreground hover:bg-destructive/90 text-xs w-full justify-center">
                          {service.pricing.proPctSavings}% OFF
                        </Badge>
                      )}

                      {/* Action Buttons */}
                      <div className="grid grid-cols-2 gap-2">
                        <Button variant="outline" size="sm" className="text-xs h-8">
                          Add
                        </Button>
                        <Button 
                          size="sm"
                          className="text-xs h-8"
                          onClick={() => onServiceClick(service.id)}
                        >
                          Learn more
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Desktop: Vertical Layout */}
                <div className="hidden md:block">
                  {/* Header */}
                  <div className="p-4 border-b flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center text-xl">
                        {service.vendor.logo ? (
                          <img src={service.vendor.logo} alt={service.vendor.name} className="h-10 w-10 rounded-full object-cover" />
                        ) : (
                          <span className="text-sm font-bold text-primary">{service.vendor.name.substring(0, 2).toUpperCase()}</span>
                        )}
                      </div>
                      <div>
                        <div className="font-semibold text-sm">{service.vendor.name}</div>
                        <div className="flex items-center gap-1 text-xs">
                          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                          <span className="font-semibold">{service.rating}</span>
                          <span className="text-muted-foreground">({service.reviews})</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Share2 className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Heart className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Description */}
                  <div className="p-4 border-b">
                    <p className={`text-sm text-muted-foreground mb-2 ${expandedCards[service.id] ? '' : 'line-clamp-3'}`}>
                      🔥 {service.tagline}
                    </p>
                    <button 
                      onClick={() => toggleCardExpansion(service.id)}
                      className="text-sm text-primary hover:underline font-medium"
                    >
                      {expandedCards[service.id] ? 'See less' : 'See more'}
                    </button>
                  </div>

                  {/* Logo */}
                  <div className="aspect-[4/3] bg-gradient-to-br from-background to-muted/30 flex items-center justify-center border-b">
                    <div className="text-center">
                      <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-2">
                        {service.vendor.logo ? (
                          <img src={service.vendor.logo} alt={service.vendor.name} className="h-16 w-16 rounded-full object-cover" />
                        ) : (
                          <span className="text-2xl font-bold text-primary">{service.vendor.name.substring(0, 2).toUpperCase()}</span>
                        )}
                      </div>
                      <div className="text-lg font-bold">{service.name}</div>
                    </div>
                  </div>

                  {/* Reviews - Condensed, only shown if reviews exist */}
                  {service.reviews > 0 && (
                    <div className="px-4 py-2 bg-muted/20 border-b">
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-3 w-3 ${
                              i < Math.floor(service.rating)
                                ? "fill-yellow-400 text-yellow-400"
                                : "text-muted-foreground/30"
                            }`}
                          />
                        ))}
                        <span className="text-xs text-muted-foreground ml-1">({service.reviews})</span>
                      </div>
                    </div>
                  )}

                  {/* Pricing */}
                  <div className="p-4 space-y-3">
                    {/* Retail Price */}
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Retail Price:</span>
                      <span className="font-bold text-lg">${service.pricing.retail.amount}/mo</span>
                    </div>

                    {/* Pro Price */}
                    {service.pricing.pro && (
                      <div className="flex items-center justify-between p-2 bg-primary/5 rounded-lg border border-primary/20">
                        <div className="flex items-center gap-1 text-sm">
                          <Crown className="h-4 w-4 text-primary" />
                          <span className="font-medium text-primary">Unlock Pro Price</span>
                        </div>
                        <span className="font-bold text-lg text-primary">${service.pricing.pro.amount}/mo</span>
                      </div>
                    )}

                    {/* Co-pay Section */}
                    {(service.pricing.copayWithVendor || service.pricing.copayNonSettlement) && (
                      <div className="p-3 bg-copay-muted rounded-lg border border-copay/30 space-y-2">
                        <div className="flex items-center gap-1 text-sm font-medium text-copay">
                          <HandshakeIcon className="h-4 w-4" />
                          <span>Unlock Co-Pay</span>
                        </div>
                        <p className="text-xs text-copay/80">
                          We have vendors lined up: Lender's, Title, HOI, Warranty, Moving Etc. click quick apply waiting to help reduce your bill
                        </p>
                        <div className="space-y-1">
                          {service.pricing.copayWithVendor && (
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-copay">With Vendor Help:</span>
                              <span className="font-bold text-copay">${service.pricing.copayWithVendor.amount}/mo</span>
                            </div>
                          )}
                          {service.pricing.copayNonSettlement && (
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-copay">Non Settlement Service Provider:</span>
                              <span className="font-bold text-copay">${service.pricing.copayNonSettlement.amount}/mo</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Discount Badge */}
                    {service.pricing.proPctSavings && (
                      <div className="flex justify-center">
                        <Badge className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                          {service.pricing.proPctSavings}% OFF
                        </Badge>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="grid grid-cols-2 gap-2 pt-2">
                      <Button variant="outline" size="sm">
                        Add
                      </Button>
                      <Button 
                        size="sm"
                        onClick={() => onServiceClick(service.id)}
                      >
                        Learn more
                      </Button>
                    </div>

                    {/* Guarantee Text */}
                    <p className="text-[10px] text-muted-foreground leading-tight pt-2">
                      <span className="font-semibold">Pro Savings Guarantee.</span> If your first month Pro credits and coverage do not equal or exceed your membership fee we credit the difference as marketplace credit.
                    </p>
                  </div>
                </div>
              </div>
            </div>
        ))}
      </div>
    </>
  );

  return (
    <section className="w-full py-16 bg-background">
      {noContainer ? content : <div className="container px-4">{content}</div>}
    </section>
  );
};