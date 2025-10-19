import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Star, MapPin, Shield, Heart, Share2, Check } from "lucide-react";
import { getServices } from "@/data/services";
import { ServiceCard } from "../../contracts/marketplace";
import { useLocation } from "@/hooks/use-location";
import { createShareLink } from "@/data/share";
import { useToast } from "@/hooks/use-toast";

const Services = () => {
  const [searchParams] = useSearchParams();
  const { location: userLocation } = useLocation();
  const { toast } = useToast();
  const [services, setServices] = useState<ServiceCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [shareButtonStates, setShareButtonStates] = useState<Record<string, "idle" | "copied">>({});

  useEffect(() => {
    const loadServices = async () => {
      setLoading(true);
      // Hard timeout: guarantee loading stops after 5.5s
      const hardTimeout = setTimeout(() => {
        setLoading(false);
        if (import.meta.env.DEV) {
          console.warn('[Services Page] Hard timeout hit - forced loading stop');
        }
      }, 5500);
      
      try {
        const category = searchParams.get("category") || undefined;
        const search = searchParams.get("search") || undefined;
        const locationParam = searchParams.get("location") || undefined;

        const location = locationParam || userLocation?.city;

        const results = await getServices({
          filters: { category, search, location },
        });
        setServices(results);
      } catch (error) {
        if (import.meta.env.DEV) {
          console.error("Failed to load services:", error);
        }
      } finally {
        clearTimeout(hardTimeout);
        setLoading(false);
      }
    };

    loadServices();
  }, [searchParams, userLocation]);

  const formatPrice = (amount: number): string => {
    return `$${amount.toLocaleString()}`;
  };

  const handleShare = async (serviceId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    try {
      const shortId = await createShareLink(serviceId);
      const shareUrl = `${window.location.origin}/s/${shortId}`;
      
      await navigator.clipboard.writeText(shareUrl);
      setShareButtonStates((prev) => ({ ...prev, [serviceId]: "copied" }));
      
      toast({
        title: "Link Copied!",
        description: "Share this service with others",
      });
      
      setTimeout(() => {
        setShareButtonStates((prev) => ({ ...prev, [serviceId]: "idle" }));
      }, 2000);
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error("Failed to create share link:", error);
      }
      toast({
        title: "Error",
        description: "Failed to create share link",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 container px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-1/2 mt-2" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-20 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 container px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Services</h1>
          <p className="text-muted-foreground">
            {(searchParams.get("location") || userLocation?.formatted) && (
              <span className="inline-flex items-center gap-1 mr-2">
                <MapPin className="h-4 w-4" />
                {searchParams.get("location") || userLocation?.formatted}
              </span>
            )}
            {services.length} services available
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service) => (
            <Card key={service.id} className="flex flex-col hover:shadow-lg transition-shadow">
              <CardHeader className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <img
                      src={service.vendor.logo}
                      alt={service.vendor.name}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-lg leading-tight line-clamp-1">
                        {service.name}
                      </h3>
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        {service.vendor.name}
                        {service.vendor.verified && (
                          <Shield className="w-3 h-3 text-primary" />
                        )}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Heart className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8"
                      onClick={(e) => handleShare(service.id, e)}
                      disabled={shareButtonStates[service.id] === "copied"}
                    >
                      {shareButtonStates[service.id] === "copied" ? (
                        <Check className="h-4 w-4 text-green-600" />
                      ) : (
                        <Share2 className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm font-medium">{service.rating}</span>
                  </div>
                  <span className="text-sm text-muted-foreground">({service.reviews})</span>
                  {service.badges.map((badge) => (
                    <Badge key={badge} variant="secondary" className="text-xs">
                      {badge}
                    </Badge>
                  ))}
                </div>

                <p className="text-sm text-muted-foreground line-clamp-2">{service.tagline}</p>
              </CardHeader>

              <CardContent className="flex-1 flex flex-col justify-end space-y-3">
                <div className="space-y-2">
                  <div className="flex items-baseline justify-between">
                    <div>
                      <span className="text-xs text-muted-foreground">Retail</span>
                      <p className="text-lg font-bold">
                        {formatPrice(service.pricing.retail.amount)}
                      </p>
                    </div>
                    {service.pricing.pro && (
                      <div className="text-right">
                        <span className="text-xs text-muted-foreground">Pro Member</span>
                        <p className="text-lg font-bold text-primary">
                          {formatPrice(service.pricing.pro.amount)}
                        </p>
                        {service.pricing.proPctSavings && (
                          <Badge variant="default" className="text-xs">
                            Save {service.pricing.proPctSavings}%
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>
                  {service.pricing.copay && (
                    <div className="text-center p-2 bg-accent rounded-md">
                      <span className="text-xs text-muted-foreground">Co-Pay Partner</span>
                      <p className="text-sm font-semibold">
                        You pay {formatPrice(service.pricing.copay.amount)}
                      </p>
                    </div>
                  )}
                </div>

                <Link to={`/services/${service.id}`} className="w-full">
                  <Button className="w-full">View Details</Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>

        {services.length === 0 && (
          <div className="text-center py-12">
            <MapPin className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">No services found</h3>
            <p className="text-muted-foreground">
              Try adjusting your filters or search terms
            </p>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default Services;
