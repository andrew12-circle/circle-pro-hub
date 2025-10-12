import { Star, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const vendors = [
  {
    id: 1,
    name: "Premium Real Estate Photos",
    tagline: "Professional HDR photography that sells homes faster",
    rating: 4.9,
    reviews: 847,
    startingPrice: 149,
    verified: true,
    pro: true,
  },
  {
    id: 2,
    name: "Social Media Mastery",
    tagline: "Daily content creation for real estate agents",
    rating: 4.8,
    reviews: 623,
    startingPrice: 299,
    verified: true,
    pro: true,
  },
  {
    id: 3,
    name: "Virtual Staging Pro",
    tagline: "Transform empty rooms into dream homes",
    rating: 5.0,
    reviews: 412,
    startingPrice: 39,
    verified: true,
    pro: false,
  },
  {
    id: 4,
    name: "SEO & Lead Generation",
    tagline: "Get ranked #1 in your local market",
    rating: 4.7,
    reviews: 534,
    startingPrice: 499,
    verified: true,
    pro: true,
  },
];

export const FeaturedVendors = () => {
  return (
    <section className="w-full py-16 bg-muted/50">
      <div className="container px-4">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold mb-2">Top Rated Vendors</h2>
            <p className="text-lg text-muted-foreground">Trusted by thousands of agents nationwide</p>
          </div>
          <Button variant="outline">View All</Button>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {vendors.map((vendor) => (
            <div key={vendor.id} className="group">
              <div className="bg-card rounded-2xl border overflow-hidden hover-lift cursor-pointer">
                {/* Vendor Image Placeholder */}
                <div className="aspect-video bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                  <span className="text-4xl font-bold text-primary/30">{vendor.name.charAt(0)}</span>
                </div>

                <div className="p-5 space-y-3">
                  {/* Badges */}
                  <div className="flex gap-2 flex-wrap">
                    {vendor.verified && (
                      <Badge className="badge-verified text-xs">
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        Verified
                      </Badge>
                    )}
                    {vendor.pro && (
                      <Badge className="badge-pro text-xs">
                        Pro Available
                      </Badge>
                    )}
                  </div>

                  {/* Vendor Info */}
                  <div>
                    <h3 className="font-semibold text-lg mb-1 group-hover:text-primary transition-colors">
                      {vendor.name}
                    </h3>
                    <p className="text-sm text-muted-foreground line-clamp-2">{vendor.tagline}</p>
                  </div>

                  {/* Rating */}
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="font-semibold text-sm">{vendor.rating}</span>
                    </div>
                    <span className="text-sm text-muted-foreground">({vendor.reviews})</span>
                  </div>

                  {/* Price */}
                  <div className="pt-3 border-t">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-xs text-muted-foreground">From</span>
                        <div className="font-bold text-lg">${vendor.startingPrice}</div>
                      </div>
                      <Button size="sm">View Details</Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
