import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Eye, CheckCircle, Loader2, Clock } from 'lucide-react';
import { ServiceCardEditor } from './ServiceCardEditor';
import { ServicePricingEditor } from './ServicePricingEditor';
import { ServiceFunnelEditor } from './ServiceFunnelEditor';
import { getServiceVersions, publishServiceVersion, rollbackService } from '@/data/admin-services';
import { useToast } from '@/hooks/use-toast';
import { isFeatureEnabled } from '@/lib/featureFlags';
import { formatDistanceToNow } from 'date-fns';

export function ServicesManagement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'card' | 'pricing' | 'funnel' | 'history'>('card');

  // Check feature flag
  if (!isFeatureEnabled('admin_services_v2')) {
    return <LegacyServicesEditor />;
  }

  // Fetch services list
  const { data: services, isLoading } = useQuery({
    queryKey: ['admin', 'services', 'list'],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('services-list');
      if (error) throw error;
      return data as any[];
    }
  });

  // Fetch selected service detail (draft + published)
  const { data: serviceDetail, isLoading: isLoadingDetail } = useQuery({
    queryKey: ['admin', 'service', selectedServiceId],
    queryFn: () => getServiceVersions(selectedServiceId!),
    enabled: !!selectedServiceId
  });

  // Publish mutation
  const publishMutation = useMutation({
    mutationFn: async () => {
      if (!serviceDetail?.draft?.id) throw new Error('No draft to publish');
      await publishServiceVersion(serviceDetail.draft.id);
    },
    onSuccess: () => {
      toast({ title: 'Published', description: 'Service is now live' });
      queryClient.invalidateQueries({ queryKey: ['admin', 'service', selectedServiceId] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'services', 'list'] });
    },
    onError: (error: any) => {
      if (error.status === 409) {
        toast({
          title: 'Conflict Detected',
          description: 'Someone else edited this. Reload?',
          variant: 'destructive',
          action: (
            <Button 
              size="sm" 
              onClick={() => queryClient.invalidateQueries({ queryKey: ['admin', 'service', selectedServiceId] })}
            >
              Reload
            </Button>
          )
        });
      } else {
        toast({ title: 'Publish Failed', description: error.message, variant: 'destructive' });
      }
    }
  });

  // Rollback mutation
  const rollbackMutation = useMutation({
    mutationFn: async (toVersionId: string) => {
      if (!selectedServiceId) throw new Error('No service selected');
      await rollbackService(selectedServiceId, toVersionId);
    },
    onSuccess: () => {
      toast({ title: 'Rolled Back', description: 'Service has been rolled back to previous version' });
      queryClient.invalidateQueries({ queryKey: ['admin', 'service', selectedServiceId] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'services', 'list'] });
    },
    onError: (error: any) => {
      toast({ title: 'Rollback Failed', description: error.message, variant: 'destructive' });
    }
  });

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
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {services?.map(service => (
              <div
                key={service.id}
                onClick={() => setSelectedServiceId(service.id)}
                className="border rounded-lg p-4 cursor-pointer hover:bg-muted transition-colors"
              >
                <h3 className="font-semibold">{service.name}</h3>
                <p className="text-sm text-muted-foreground line-clamp-2">{service.tagline}</p>
                <div className="mt-2 flex gap-2 flex-wrap">
                  <Badge variant="secondary">{service.category}</Badge>
                  {service.featured && <Badge>Featured</Badge>}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Detail Sheet */}
      <Sheet open={!!selectedServiceId} onOpenChange={(open) => !open && setSelectedServiceId(null)}>
        <SheetContent className="w-full sm:max-w-3xl overflow-y-auto">
          {isLoadingDetail && <Loader2 className="h-8 w-8 animate-spin mx-auto mt-20" />}
          
          {serviceDetail && (
            <>
              <SheetHeader>
                <div className="flex justify-between items-start">
                  <SheetTitle>{serviceDetail.service.name}</SheetTitle>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4 mr-2" />
                      Preview
                    </Button>
                    <Button 
                      size="sm" 
                      onClick={() => publishMutation.mutate()}
                      disabled={publishMutation.isPending || !serviceDetail.draft}
                    >
                      {publishMutation.isPending ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <CheckCircle className="h-4 w-4 mr-2" />
                      )}
                      Publish
                    </Button>
                  </div>
                </div>
              </SheetHeader>

              <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="mt-6">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="card">Card</TabsTrigger>
                  <TabsTrigger value="pricing">Pricing</TabsTrigger>
                  <TabsTrigger value="funnel">Funnel</TabsTrigger>
                  <TabsTrigger value="history">History</TabsTrigger>
                </TabsList>

                <TabsContent value="card" className="mt-4">
                  <ServiceCardEditor serviceId={selectedServiceId!} draft={serviceDetail.draft} />
                </TabsContent>

                <TabsContent value="pricing" className="mt-4">
                  <ServicePricingEditor serviceId={selectedServiceId!} draft={serviceDetail.draft} />
                </TabsContent>

                <TabsContent value="funnel" className="mt-4">
                  <ServiceFunnelEditor serviceId={selectedServiceId!} draft={serviceDetail.draft} />
                </TabsContent>

                <TabsContent value="history" className="mt-4">
                  <div className="space-y-3">
                    {serviceDetail.history && serviceDetail.history.length > 0 ? (
                      serviceDetail.history.map((version: any) => (
                        <div 
                          key={version.id} 
                          className="border rounded-lg p-4 flex justify-between items-center"
                        >
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <Badge variant={version.state === 'published' ? 'default' : 'secondary'}>
                                {version.state}
                              </Badge>
                              {version.state === 'published' && serviceDetail.service.published_version_id === version.id && (
                                <Badge variant="outline">Current Live</Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {formatDistanceToNow(new Date(version.created_at), { addSuffix: true })}
                            </p>
                          </div>
                          {version.state === 'published' && version.id !== serviceDetail.service.published_version_id && (
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => rollbackMutation.mutate(version.id)}
                              disabled={rollbackMutation.isPending}
                            >
                              {rollbackMutation.isPending ? (
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              ) : null}
                              Rollback
                            </Button>
                          )}
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground text-center py-8">No version history available</p>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}

// Legacy fallback (current JSON editor)
function LegacyServicesEditor() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Services Management</CardTitle>
        <CardDescription>Enable admin_services_v2 feature flag to use the new editor</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">The new services editor is disabled. Contact an administrator to enable it.</p>
      </CardContent>
    </Card>
  );
}
