import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Eye, Loader2 } from 'lucide-react';
import ServicesEditor from './ServicesEditor';
import { getServices } from '@/data/services';
import { isFeatureEnabled } from '@/lib/featureFlags';

export function ServicesManagement() {
  const queryClient = useQueryClient();
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null);

  // Check feature flag
  if (!isFeatureEnabled('admin_services_v2')) {
    return <LegacyServicesEditor />;
  }

  // Fetch services list
  const { data: services, isLoading, error: servicesError } = useQuery({
    queryKey: ['admin', 'services', 'list'],
    queryFn: () => getServices()
  });
  
  // Show error state if services failed to load
  if (servicesError) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Services</CardTitle>
          <CardDescription>Unable to load services</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-destructive">
            Error: {servicesError instanceof Error ? servicesError.message : 'Failed to load services'}
          </p>
          <Button 
            onClick={() => queryClient.invalidateQueries({ queryKey: ['admin', 'services', 'list'] })}
            className="mt-4"
          >
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Services</CardTitle>
          <CardDescription>Manage service cards, pricing, and funnels</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading && (
            <div className="text-center py-8">
              <Loader2 className="h-8 w-8 animate-spin mx-auto" />
            </div>
          )}
          
          {!isLoading && services && (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {services.map((service: any) => (
                <Card 
                  key={service.id} 
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => setSelectedServiceId(service.id)}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-base">{service.name}</CardTitle>
                        <p className="text-sm text-muted-foreground mt-1">
                          {service.category || 'No category'}
                        </p>
                      </div>
                      <Button variant="ghost" size="sm" onClick={(e) => {
                        e.stopPropagation();
                        setSelectedServiceId(service.id);
                      }}>
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex gap-2 flex-wrap">
                      {service.featured && <Badge>Featured</Badge>}
                      {service.is_active ? (
                        <Badge variant="default">Active</Badge>
                      ) : (
                        <Badge variant="secondary">Inactive</Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Service Editor Sheet */}
      <Sheet open={!!selectedServiceId} onOpenChange={(open) => !open && setSelectedServiceId(null)}>
        <SheetContent side="right" className="w-full sm:max-w-4xl overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Edit Service</SheetTitle>
          </SheetHeader>
          
          {selectedServiceId && (
            <div className="mt-6">
              <ServicesEditor serviceId={selectedServiceId} />
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}

// Legacy fallback when feature flag is disabled
function LegacyServicesEditor() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Services Management</CardTitle>
        <CardDescription>
          The new services editor is disabled. Enable the <code>admin_services_v2</code> feature flag to use the improved editor.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">
          To enable, go to <code>src/lib/featureFlags.ts</code> and set <code>admin_services_v2: true</code>
        </p>
      </CardContent>
    </Card>
  );
}
