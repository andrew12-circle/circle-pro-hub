import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star } from "lucide-react";
import type { PromotedCard } from "@/types/marketplace";

interface PromotedRailProps {
  cards: PromotedCard[];
}

export const PromotedRail = ({ cards }: PromotedRailProps) => {
  if (cards.length === 0) return null;

  const [heroCard, ...restCards] = cards;

  const formatPrice = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <section className="py-12 px-4 md:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-3xl font-bold mb-8">Featured Services</h2>
        
        {/* Hero Card - Slot 1 */}
        {heroCard && (
          <Card className="mb-8 overflow-hidden hover:shadow-xl transition-shadow">
            <div className="grid md:grid-cols-2 gap-6">
              {heroCard.cover_image && (
                <img
                  src={heroCard.cover_image}
                  alt={heroCard.title}
                  className="w-full h-full object-cover min-h-[300px]"
                />
              )}
              <CardContent className="p-8 flex flex-col justify-center">
                <div className="flex items-center gap-3 mb-4">
                  {heroCard.vendor_logo && (
                    <img
                      src={heroCard.vendor_logo}
                      alt={heroCard.vendor_name}
                      className="w-16 h-16 rounded-lg object-cover"
                    />
                  )}
                  <div>
                    <h3 className="text-2xl font-bold">{heroCard.title}</h3>
                    <p className="text-muted-foreground">{heroCard.vendor_name}</p>
                  </div>
                </div>

                <p className="text-lg mb-4">{heroCard.subtitle}</p>

                {heroCard.roi_note && (
                  <p className="text-lg font-semibold text-primary mb-4">
                    {heroCard.roi_note}
                  </p>
                )}

                <div className="flex items-center gap-2 mb-4">
                  <div className="flex items-center gap-1">
                    <Star className="w-5 h-5 fill-primary text-primary" />
                    <span className="font-bold text-lg">{heroCard.rating.toFixed(1)}</span>
                  </div>
                  <span className="text-muted-foreground">
                    ({heroCard.review_count} reviews)
                  </span>
                </div>

                {heroCard.badges.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-6">
                    {heroCard.badges.map((badge) => (
                      <Badge key={badge} variant="secondary" className="text-sm">
                        {badge}
                      </Badge>
                    ))}
                  </div>
                )}

                <div className="flex items-baseline gap-3 mb-6">
                  <span className="text-3xl font-bold">
                    {formatPrice(heroCard.pricing.retail.amount, heroCard.pricing.retail.currency)}
                  </span>
                  {heroCard.pricing.pro && (
                    <span className="text-lg text-muted-foreground line-through">
                      {formatPrice(heroCard.pricing.pro.amount, heroCard.pricing.pro.currency)}
                    </span>
                  )}
                </div>

                <Link to={`/services/${heroCard.slug}`}>
                  <Button size="lg" className="w-full md:w-auto">
                    Learn More
                  </Button>
                </Link>
              </CardContent>
            </div>
          </Card>
        )}

        {/* Standard Cards - Slots 2-5 */}
        {restCards.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {restCards.slice(0, 4).map((card) => (
              <Card key={card.id} className="flex flex-col hover:shadow-lg transition-shadow">
                <CardContent className="p-4 flex-1">
                  {card.cover_image && (
                    <img
                      src={card.cover_image}
                      alt={card.title}
                      className="w-full h-32 object-cover rounded-lg mb-3"
                    />
                  )}
                  
                  <div className="flex items-center gap-2 mb-2">
                    {card.vendor_logo && (
                      <img
                        src={card.vendor_logo}
                        alt={card.vendor_name}
                        className="w-8 h-8 rounded object-cover"
                      />
                    )}
                    <h4 className="font-semibold text-sm line-clamp-1">{card.title}</h4>
                  </div>

                  <div className="flex items-center gap-1 mb-3">
                    <Star className="w-3 h-3 fill-primary text-primary" />
                    <span className="text-sm font-medium">{card.rating.toFixed(1)}</span>
                    <span className="text-xs text-muted-foreground">
                      ({card.review_count})
                    </span>
                  </div>

                  {card.roi_note && (
                    <p className="text-xs font-medium text-primary mb-2 line-clamp-2">
                      {card.roi_note}
                    </p>
                  )}

                  <div className="flex items-baseline gap-2 mb-3">
                    <span className="text-lg font-bold">
                      {formatPrice(card.pricing.retail.amount, card.pricing.retail.currency)}
                    </span>
                  </div>

                  <Link to={`/services/${card.slug}`}>
                    <Button size="sm" className="w-full">
                      View
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};
