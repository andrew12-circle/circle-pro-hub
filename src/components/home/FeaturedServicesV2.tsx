import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Star } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";

interface FeaturedServicesV2Props {
  onServiceClick: (serviceId: string) => void;
  featured?: boolean;
}

export const FeaturedServicesV2 = ({ onServiceClick, featured = false }: FeaturedServicesV2Props) => {
  const { data: services, isLoading } = useQuery({
    queryKey: ['services', 'featured'],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('services-list', {
        body: { featured: true, limit: 4 }
      });
      if (error) throw error;
      return data;
    }
  });

  if (isLoading) {
    return (
      <section className="py-12">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-8">Featured Services</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <Skeleton className="h-6 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-full mb-4" />
                  <Skeleton className="h-8 w-20 mb-4" />
                  <Skeleton className="h-10 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    );
  }

  const displayServices = services || [];

  return (
    <section className="py-12">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold mb-8">Featured Services</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {displayServices.map((service: any) => (
            <Card key={service.id} className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => onServiceClick(service.id)}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-lg mb-1">{service.name}</h3>
                    <p className="text-sm text-muted-foreground">{service.tagline}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 mb-4">
                  {service.badges?.map((badge: string, idx: number) => (
                    <Badge key={idx} variant="secondary">{badge}</Badge>
                  ))}
                </div>

                {service.rating && (
                  <div className="flex items-center gap-2 mb-4">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-semibold">{service.rating}</span>
                    <span className="text-sm text-muted-foreground">({service.reviews} reviews)</span>
                  </div>
                )}

                <Button className="w-full" size="sm">
                  Learn More
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};
