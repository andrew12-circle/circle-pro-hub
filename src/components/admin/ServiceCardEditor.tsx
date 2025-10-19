import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { useAutosave } from '@/hooks/use-autosave';
import { useToast } from '@/hooks/use-toast';
import { updateServiceCard } from '@/data/admin-services';
import type { ServiceCardEdit, ServicePricingEdit } from '@/contracts/admin/service-version';
import { Badge } from '@/components/ui/badge';
import { Loader2 } from 'lucide-react';

interface ServiceCardEditorProps {
  serviceId: string;
  draft: any | null;
}

export function ServiceCardEditor({ serviceId, draft }: ServiceCardEditorProps) {
  const { toast } = useToast();
  const [cardData, setCardData] = useState<ServiceCardEdit>({
    name: draft?.card?.name || '',
    tagline: draft?.card?.tagline || '',
    category: draft?.card?.category || '',
    badges: draft?.card?.badges || [],
    serviceAreas: draft?.card?.serviceAreas || [],
    cityScope: draft?.card?.cityScope || 'any',
    vendorId: draft?.card?.vendorId || '',
    rating: draft?.card?.rating,
    reviews: draft?.card?.reviews,
    reviewHighlight: draft?.card?.reviewHighlight,
    featured: draft?.card?.featured || false,
  });

  useEffect(() => {
    if (draft?.card) {
      setCardData(draft.card);
    }
  }, [draft]);

  const { isSaving, lastSaved } = useAutosave({
    data: cardData,
    onSave: async (data) => {
      await updateServiceCard(serviceId, data, draft?.pricing || {});
      toast({
        title: 'Saved',
        description: 'Card updated successfully'
      });
    },
    debounceMs: 1000,
    enabled: true
  });

  const handleFieldChange = (field: keyof ServiceCardEdit, value: any) => {
    setCardData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Service Card</CardTitle>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            {isSaving && (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Saving...</span>
              </>
            )}
            {!isSaving && lastSaved && (
              <span>Saved {Math.round((Date.now() - lastSaved.getTime()) / 1000)}s ago</span>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="name">Service Name</Label>
          <Input
            id="name"
            value={cardData.name}
            onChange={(e) => handleFieldChange('name', e.target.value)}
            placeholder="Premium SEO Services"
          />
        </div>

        <div>
          <Label htmlFor="tagline">Tagline</Label>
          <Textarea
            id="tagline"
            value={cardData.tagline}
            onChange={(e) => handleFieldChange('tagline', e.target.value)}
            placeholder="Dominate Local Search Results"
            rows={2}
          />
        </div>

        <div>
          <Label htmlFor="category">Category</Label>
          <Input
            id="category"
            value={cardData.category}
            onChange={(e) => handleFieldChange('category', e.target.value)}
            placeholder="seo"
          />
        </div>

        <div>
          <Label htmlFor="reviewHighlight">Review Highlight</Label>
          <Textarea
            id="reviewHighlight"
            value={cardData.reviewHighlight || ''}
            onChange={(e) => handleFieldChange('reviewHighlight', e.target.value)}
            placeholder="Increased our leads by 300% in 3 months!"
            rows={2}
          />
        </div>

        <div className="flex items-center space-x-2">
          <Switch
            id="featured"
            checked={cardData.featured}
            onCheckedChange={(checked) => handleFieldChange('featured', checked)}
          />
          <Label htmlFor="featured">Featured Service</Label>
        </div>

        <div className="pt-4 border-t">
          <p className="text-sm text-muted-foreground">
            Changes are automatically saved as you type
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
