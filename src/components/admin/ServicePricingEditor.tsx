import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAutosave } from '@/hooks/use-autosave';
import { useToast } from '@/hooks/use-toast';
import { updateServicePricing } from '@/data/admin-services';
import type { ServicePricingEdit } from '@/contracts/admin/service-version';
import { Loader2 } from 'lucide-react';

interface ServicePricingEditorProps {
  serviceId: string;
  draft: any | null;
}

export function ServicePricingEditor({ serviceId, draft }: ServicePricingEditorProps) {
  const { toast } = useToast();
  const [pricingData, setPricingData] = useState<ServicePricingEdit>({
    retail: draft?.pricing?.retail || { amount: 0, currency: 'USD' },
    pro: draft?.pricing?.pro,
    copay: draft?.pricing?.copay,
    proPctSavings: draft?.pricing?.proPctSavings,
  });

  useEffect(() => {
    if (draft?.pricing) {
      setPricingData(draft.pricing);
    }
  }, [draft]);

  const { isSaving, lastSaved } = useAutosave({
    data: pricingData,
    onSave: async (data) => {
      await updateServicePricing(serviceId, data, draft?.card || {});
      toast({
        title: 'Saved',
        description: 'Pricing updated successfully'
      });
    },
    debounceMs: 1000,
    enabled: true
  });

  const handleRetailChange = (field: 'amount' | 'currency', value: any) => {
    setPricingData(prev => ({
      ...prev,
      retail: { ...prev.retail, [field]: field === 'amount' ? Number(value) : value }
    }));
  };

  const handleProChange = (field: 'amount' | 'currency', value: any) => {
    setPricingData(prev => ({
      ...prev,
      pro: prev.pro 
        ? { ...prev.pro, [field]: field === 'amount' ? Number(value) : value }
        : { amount: field === 'amount' ? Number(value) : 0, currency: field === 'currency' ? value : 'USD' }
    }));
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Pricing</CardTitle>
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
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <h3 className="font-semibold">Retail Pricing</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="retail-amount">Amount</Label>
              <Input
                id="retail-amount"
                type="number"
                value={pricingData.retail.amount}
                onChange={(e) => handleRetailChange('amount', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="retail-currency">Currency</Label>
              <Input
                id="retail-currency"
                value={pricingData.retail.currency}
                onChange={(e) => handleRetailChange('currency', e.target.value)}
                placeholder="USD"
              />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="font-semibold">Pro Member Pricing (Optional)</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="pro-amount">Amount</Label>
              <Input
                id="pro-amount"
                type="number"
                value={pricingData.pro?.amount || ''}
                onChange={(e) => handleProChange('amount', e.target.value)}
                placeholder="Optional"
              />
            </div>
            <div>
              <Label htmlFor="pro-currency">Currency</Label>
              <Input
                id="pro-currency"
                value={pricingData.pro?.currency || 'USD'}
                onChange={(e) => handleProChange('currency', e.target.value)}
                placeholder="USD"
              />
            </div>
          </div>
        </div>

        <div>
          <Label htmlFor="pro-savings">Pro % Savings (Optional)</Label>
          <Input
            id="pro-savings"
            type="number"
            min="0"
            max="100"
            value={pricingData.proPctSavings || ''}
            onChange={(e) => setPricingData(prev => ({ ...prev, proPctSavings: Number(e.target.value) }))}
            placeholder="0-100"
          />
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
