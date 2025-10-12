import { useState } from "react";
import { Star, CheckCircle2, Share2, Heart, Crown, HandshakeIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface FeaturedVendorsProps {
  onServiceClick: (serviceId: string) => void;
  featured?: boolean;
  noContainer?: boolean;
}

const vendors = [
  {
    id: 1,
    name: "Premium Real Estate Photos",
    vendor: "Pro Photography Studio",
    avatar: "📷",
    logo: "PP",
    tagline: "Real Agents. Real Results. This isn't theory. Thousands of agents just like you trust us for professional HDR photography that sells homes 40% faster.",
    rating: 4.9,
    reviews: 847,
    retailPrice: 149,
    proPrice: 119,
    proDiscount: 20,
    copayPrice: 75,
    copayWithVendor: 75,
    copayNonSettlement: 75,
    verified: true,
    discount: "20% OFF",
    reviewHighlight: "These photos made my listing look like a million bucks! Sold in 3 days."
  },
  {
    id: 2,
    name: "Social Media Mastery",
    vendor: "Digital Marketing Pro",
    avatar: "📱",
    logo: "SM",
    tagline: "Daily content creation for busy agents. Stop posting sporadically and start building a brand that attracts leads on autopilot.",
    rating: 4.8,
    reviews: 623,
    retailPrice: 299,
    proPrice: 239,
    proDiscount: 20,
    copayPrice: 150,
    copayWithVendor: 150,
    copayNonSettlement: 150,
    verified: true,
    discount: "20% OFF",
    reviewHighlight: "My engagement tripled in the first month. Worth every penny!"
  },
  {
    id: 3,
    name: "Virtual Staging Pro",
    vendor: "Staging Experts",
    avatar: "🏠",
    logo: "VS",
    tagline: "Transform empty rooms into dream homes. Professional virtual staging that helps buyers visualize the lifestyle, not just the space.",
    rating: 5.0,
    reviews: 412,
    retailPrice: 39,
    proPrice: 35,
    proDiscount: 10,
    copayPrice: 20,
    copayWithVendor: 20,
    copayNonSettlement: 20,
    verified: true,
    discount: "10% OFF",
    reviewHighlight: "Incredible quality and fast turnaround. Helps vacant homes sell faster."
  },
  {
    id: 4,
    name: "SEO & Lead Generation",
    vendor: "Growth Hackers Inc",
    avatar: "🎯",
    logo: "GH",
    tagline: "Get ranked #1 in your local market. Our proven SEO system gets you found by buyers and sellers actively searching right now.",
    rating: 4.7,
    reviews: 534,
    retailPrice: 499,
    proPrice: 399,
    proDiscount: 20,
    copayPrice: 250,
    copayWithVendor: 250,
    copayNonSettlement: 250,
    verified: true,
    discount: "20% OFF",
    reviewHighlight: "Went from page 3 to #1 on Google in 60 days. Leads are pouring in!"
  },
];

export const FeaturedVendors = ({ onServiceClick, featured = false, noContainer = false }: FeaturedVendorsProps) => {
  const displayVendors = featured ? vendors.slice(0, 4) : vendors;
  const [expandedCards, setExpandedCards] = useState<Record<number, boolean>>({});

  const toggleCardExpansion = (id: number) => {
    setExpandedCards(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

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
          {displayVendors.map((vendor) => (
            <div key={vendor.id} className="group">
              <div className="bg-card rounded-2xl border overflow-hidden hover-lift">
                {/* Mobile: Horizontal Layout */}
                <div className="md:hidden flex h-full">
                  {/* Left: Logo Section */}
                  <div className="w-24 flex-shrink-0 border-r bg-gradient-to-br from-background to-muted/30 flex items-center justify-center p-2">
                    <div className="text-center">
                      <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-1">
                        <span className="text-xl font-bold text-primary">{vendor.logo}</span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Content */}
                  <div className="flex-1 flex flex-col">
                    {/* Header */}
                    <div className="p-3 border-b flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-sm line-clamp-2 mb-1">{vendor.name}</div>
                        <div className="flex items-center gap-1 text-xs mb-1">
                          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400 flex-shrink-0" />
                          <span className="font-semibold">{vendor.rating}</span>
                          <span className="text-muted-foreground">({vendor.reviews})</span>
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
                      <p className={`text-xs text-muted-foreground mb-1 ${expandedCards[vendor.id] ? '' : 'line-clamp-2'}`}>
                        🔥 {vendor.tagline}
                      </p>
                      <button 
                        onClick={() => toggleCardExpansion(vendor.id)}
                        className="text-xs text-primary hover:underline font-medium"
                      >
                        {expandedCards[vendor.id] ? 'See less' : 'See more'}
                      </button>
                    </div>

                    {/* Pricing */}
                    <div className="p-3 space-y-2">
                      {/* Retail Price */}
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">Retail:</span>
                        <span className="font-bold">${vendor.retailPrice}/mo</span>
                      </div>

                      {/* Pro Price */}
                      <div className="flex items-center justify-between p-1.5 bg-primary/5 rounded border border-primary/20">
                        <div className="flex items-center gap-1 text-xs">
                          <Crown className="h-3 w-3 text-primary" />
                          <span className="font-medium text-primary">Pro</span>
                        </div>
                        <span className="font-bold text-xs text-primary">${vendor.proPrice}/mo</span>
                      </div>

                      {/* Co-pay Section */}
                      <div className="p-2 bg-green-50 dark:bg-green-950/20 rounded border border-green-200 dark:border-green-800">
                        <div className="flex items-center gap-1 text-xs font-medium text-green-700 dark:text-green-400 mb-1">
                          <HandshakeIcon className="h-3 w-3" />
                          <span>Co-Pay</span>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-green-700 dark:text-green-400">From:</span>
                          <span className="font-bold text-green-700 dark:text-green-400">${vendor.copayWithVendor}/mo</span>
                        </div>
                      </div>

                      {/* Discount Badge */}
                      {vendor.discount && (
                        <Badge className="bg-red-500 text-white hover:bg-red-600 text-xs w-full justify-center">
                          {vendor.discount}
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
                          onClick={() => onServiceClick(vendor.id.toString())}
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
                        {vendor.avatar}
                      </div>
                      <div>
                        <div className="font-semibold text-sm">{vendor.vendor}</div>
                        <div className="flex items-center gap-1 text-xs">
                          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                          <span className="font-semibold">{vendor.rating}</span>
                          <span className="text-muted-foreground">({vendor.reviews})</span>
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
                    <p className={`text-sm text-muted-foreground mb-2 ${expandedCards[vendor.id] ? '' : 'line-clamp-3'}`}>
                      🔥 {vendor.tagline}
                    </p>
                    <button 
                      onClick={() => toggleCardExpansion(vendor.id)}
                      className="text-sm text-primary hover:underline font-medium"
                    >
                      {expandedCards[vendor.id] ? 'See less' : 'See more'}
                    </button>
                  </div>

                  {/* Logo */}
                  <div className="aspect-[4/3] bg-gradient-to-br from-background to-muted/30 flex items-center justify-center border-b">
                    <div className="text-center">
                      <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-2">
                        <span className="text-2xl font-bold text-primary">{vendor.logo}</span>
                      </div>
                      <div className="text-lg font-bold">{vendor.name}</div>
                    </div>
                  </div>

                  {/* Reviews - Condensed, only shown if reviews exist */}
                  {vendor.reviews > 0 && (
                    <div className="px-4 py-2 bg-muted/20 border-b">
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-3 w-3 ${
                              i < Math.floor(vendor.rating)
                                ? "fill-yellow-400 text-yellow-400"
                                : "text-muted-foreground/30"
                            }`}
                          />
                        ))}
                        <span className="text-xs text-muted-foreground ml-1">({vendor.reviews})</span>
                      </div>
                    </div>
                  )}

                  {/* Pricing */}
                  <div className="p-4 space-y-3">
                    {/* Retail Price */}
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Retail Price:</span>
                      <span className="font-bold text-lg">${vendor.retailPrice}/mo</span>
                    </div>

                    {/* Pro Price */}
                    <div className="flex items-center justify-between p-2 bg-primary/5 rounded-lg border border-primary/20">
                      <div className="flex items-center gap-1 text-sm">
                        <Crown className="h-4 w-4 text-primary" />
                        <span className="font-medium text-primary">Unlock Pro Price</span>
                      </div>
                      <span className="font-bold text-lg text-primary">${vendor.proPrice}/mo</span>
                    </div>

                    {/* Co-pay Section */}
                    <div className="p-3 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800 space-y-2">
                      <div className="flex items-center gap-1 text-sm font-medium text-green-700 dark:text-green-400">
                        <HandshakeIcon className="h-4 w-4" />
                        <span>Unlock Co-Pay</span>
                      </div>
                      <p className="text-xs text-green-600 dark:text-green-500">
                        We have vendors lined up: Lender's, Title, HOI, Warranty, Moving Etc. click quick apply waiting to help reduce your bill
                      </p>
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-green-700 dark:text-green-400">With Vendor Help:</span>
                          <span className="font-bold text-green-700 dark:text-green-400">${vendor.copayWithVendor}/mo</span>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-green-700 dark:text-green-400">Non Settlement Service Provider:</span>
                          <span className="font-bold text-green-700 dark:text-green-400">${vendor.copayNonSettlement}/mo</span>
                        </div>
                      </div>
                    </div>

                    {/* Discount Badge */}
                    {vendor.discount && (
                      <div className="flex justify-center">
                        <Badge className="bg-red-500 text-white hover:bg-red-600">
                          {vendor.discount}
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
                        onClick={() => onServiceClick(vendor.id.toString())}
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
