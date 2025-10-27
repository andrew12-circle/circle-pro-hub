/**
 * Unified Service Editor - Direct-to-Live
 * Edits marketplace cards AND funnel content in one place
 */

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { getServiceForEdit, updateService, type ServiceEditData } from "@/data/adminServices";

interface ServicesEditorProps {
  serviceId: string;
  onClose: () => void;
}

export function ServicesEditor({ serviceId, onClose }: ServicesEditorProps) {
  const [originalData, setOriginalData] = useState<ServiceEditData | null>(null);
  const [localData, setLocalData] = useState<ServiceEditData | null>(null);
  const [isDirty, setIsDirty] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadService();
  }, [serviceId]);

  async function loadService() {
    setLoading(true);
    try {
      const data = await getServiceForEdit(serviceId);
      setOriginalData(data);
      setLocalData(data);
      setIsDirty(false);
    } catch (error) {
      console.error('[ServicesEditor] Load error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to load service');
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    if (!localData) return;

    setSaving(true);
    try {
      const updated = await updateService(serviceId, localData);
      setOriginalData(updated);
      setLocalData(updated);
      setIsDirty(false);
      toast.success("Service updated successfully - changes are live!");
    } catch (error) {
      console.error('[ServicesEditor] Save error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to save');
    } finally {
      setSaving(false);
    }
  }

  function updateData(updates: Partial<ServiceEditData>) {
    if (!localData) return;
    setLocalData({ ...localData, ...updates });
    setIsDirty(true);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <p className="text-muted-foreground">Loading service...</p>
      </div>
    );
  }

  if (!localData) {
    return (
      <div className="flex items-center justify-center p-8">
        <p className="text-destructive">Failed to load service</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold">Edit Service: {localData.name}</h2>
          {isDirty && <span className="text-xs text-amber-600 font-medium">(unsaved changes)</span>}
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={handleSave}
            disabled={!isDirty || saving}
            variant="default"
          >
            {saving ? "Saving..." : "Save & Publish"}
          </Button>
          <Button onClick={onClose} variant="outline">
            Close
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex-1 overflow-auto p-4">
        <Tabs defaultValue="card" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="card">Marketplace Card</TabsTrigger>
            <TabsTrigger value="pricing">Pricing</TabsTrigger>
            <TabsTrigger value="funnel">Service Detail (Funnel)</TabsTrigger>
          </TabsList>

          <TabsContent value="card">
            <MarketplaceCardEditor value={localData} onChange={updateData} />
          </TabsContent>

          <TabsContent value="pricing">
            <PricingEditor value={localData} onChange={updateData} />
          </TabsContent>

          <TabsContent value="funnel">
            <FunnelEditor value={localData} onChange={updateData} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

// Marketplace Card Editor - all fields shown on /marketplace grid
function MarketplaceCardEditor({ 
  value, 
  onChange 
}: { 
  value: ServiceEditData; 
  onChange: (v: Partial<ServiceEditData>) => void 
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Marketplace Card Fields</CardTitle>
        <p className="text-sm text-muted-foreground">These fields appear on the marketplace grid</p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="name">Service Name</Label>
          <Input
            id="name"
            value={value.name}
            onChange={(e) => onChange({ name: e.target.value })}
            maxLength={90}
          />
        </div>

        <div>
          <Label htmlFor="tagline">Tagline / Subtitle</Label>
          <Input
            id="tagline"
            value={value.tagline || ""}
            onChange={(e) => onChange({ tagline: e.target.value })}
            maxLength={140}
          />
        </div>

        <div>
          <Label htmlFor="slug">URL Slug</Label>
          <Input
            id="slug"
            value={value.slug || ""}
            onChange={(e) => onChange({ slug: e.target.value })}
            placeholder="seo-friendly-url"
          />
          <p className="text-xs text-muted-foreground mt-1">Used in /services/:slug URLs</p>
        </div>

        <div>
          <Label htmlFor="category">Category</Label>
          <Input
            id="category"
            value={value.category || ""}
            onChange={(e) => onChange({ category: e.target.value })}
            placeholder="Marketing, SEO, Design, etc."
          />
        </div>

        <div>
          <Label htmlFor="badges">Badges (comma-separated)</Label>
          <Input
            id="badges"
            value={value.badges?.join(", ") || ""}
            onChange={(e) => onChange({ badges: e.target.value.split(",").map(s => s.trim()).filter(Boolean) })}
            placeholder="Top Rated, Verified, New"
          />
        </div>

        <div>
          <Label htmlFor="cover_image">Cover Image URL</Label>
          <Input
            id="cover_image"
            type="url"
            value={value.cover_image || ""}
            onChange={(e) => onChange({ cover_image: e.target.value })}
            placeholder="https://..."
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="rating">Rating (0-5)</Label>
            <Input
              id="rating"
              type="number"
              min="0"
              max="5"
              step="0.1"
              value={value.rating}
              onChange={(e) => onChange({ rating: parseFloat(e.target.value) || 0 })}
            />
          </div>
          <div>
            <Label htmlFor="reviews">Review Count</Label>
            <Input
              id="reviews"
              type="number"
              min="0"
              value={value.reviews}
              onChange={(e) => onChange({ reviews: parseInt(e.target.value) || 0 })}
            />
          </div>
        </div>

        <div>
          <Label htmlFor="roi_note">ROI Note</Label>
          <Input
            id="roi_note"
            value={value.roi_note || ""}
            onChange={(e) => onChange({ roi_note: e.target.value })}
            placeholder="3X ROI in 6 months"
            maxLength={50}
          />
        </div>

        <div>
          <Label htmlFor="time_to_value">Time to Value</Label>
          <Input
            id="time_to_value"
            value={value.time_to_value || ""}
            onChange={(e) => onChange({ time_to_value: e.target.value })}
            placeholder="2-4 weeks"
            maxLength={30}
          />
        </div>

        <div className="space-y-2 pt-4 border-t">
          <Label>Flags</Label>
          <div className="flex items-center space-x-2">
            <Switch
              checked={value.is_active}
              onCheckedChange={(is_active) => onChange({ is_active })}
            />
            <Label>Active (visible on marketplace)</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              checked={value.featured}
              onCheckedChange={(featured) => onChange({ featured })}
            />
            <Label>Featured (promoted placement)</Label>
          </div>
        </div>

        <div>
          <Label htmlFor="service_areas">Service Areas (comma-separated)</Label>
          <Input
            id="service_areas"
            value={value.service_areas?.join(", ") || ""}
            onChange={(e) => onChange({ service_areas: e.target.value.split(",").map(s => s.trim()).filter(Boolean) })}
            placeholder="New York, Los Angeles, nationwide"
          />
        </div>

        <div>
          <Label htmlFor="sort_order">Sort Order (lower = first)</Label>
          <Input
            id="sort_order"
            type="number"
            value={value.sort_order}
            onChange={(e) => onChange({ sort_order: parseInt(e.target.value) || 1000 })}
          />
        </div>
      </CardContent>
    </Card>
  );
}

// Pricing Editor
function PricingEditor({ 
  value, 
  onChange 
}: { 
  value: ServiceEditData; 
  onChange: (v: Partial<ServiceEditData>) => void 
}) {
  const [pricingJson, setPricingJson] = useState(JSON.stringify(value.pricing, null, 2));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pricing Configuration</CardTitle>
        <p className="text-sm text-muted-foreground">
          Define retail, pro, and copay pricing tiers
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label>Pricing JSON</Label>
          <Textarea
            value={pricingJson}
            onChange={(e) => {
              setPricingJson(e.target.value);
              try {
                const parsed = JSON.parse(e.target.value);
                onChange({ pricing: parsed });
              } catch {
                // Invalid JSON, don't update
              }
            }}
            rows={12}
            className="font-mono text-sm"
            placeholder={`{
  "retail": { "amount": 999, "currency": "USD" },
  "pro": { "amount": 799, "currency": "USD" },
  "proPctSavings": 20
}`}
          />
          <p className="text-xs text-muted-foreground mt-1">
            Format: retail, pro, proPctSavings, copayWithVendor, copayNonSettlement
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

// Funnel Editor - packages, FAQ, media, compliance
function FunnelEditor({ 
  value, 
  onChange 
}: { 
  value: ServiceEditData; 
  onChange: (v: Partial<ServiceEditData>) => void 
}) {
  const [packagesJson, setPackagesJson] = useState(JSON.stringify(value.packages, null, 2));
  const [faqJson, setFaqJson] = useState(JSON.stringify(value.faq, null, 2));
  const [mediaJson, setMediaJson] = useState(JSON.stringify(value.media, null, 2));
  const [complianceJson, setComplianceJson] = useState(JSON.stringify(value.compliance, null, 2));

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Packages</CardTitle>
          <p className="text-sm text-muted-foreground">
            Service tiers/packages shown in detail modal
          </p>
        </CardHeader>
        <CardContent>
          <Textarea
            value={packagesJson}
            onChange={(e) => {
              setPackagesJson(e.target.value);
              try {
                const parsed = JSON.parse(e.target.value);
                onChange({ packages: parsed });
              } catch {}
            }}
            rows={10}
            className="font-mono text-sm"
            placeholder={`[
  {
    "id": "basic",
    "name": "Basic Package",
    "price": 999,
    "description": "...",
    "features": ["Feature 1", "Feature 2"]
  }
]`}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>FAQ</CardTitle>
          <p className="text-sm text-muted-foreground">
            Frequently asked questions
          </p>
        </CardHeader>
        <CardContent>
          <Textarea
            value={faqJson}
            onChange={(e) => {
              setFaqJson(e.target.value);
              try {
                const parsed = JSON.parse(e.target.value);
                onChange({ faq: parsed });
              } catch {}
            }}
            rows={8}
            className="font-mono text-sm"
            placeholder={`[
  {
    "question": "How long does it take?",
    "answer": "Typically 2-4 weeks"
  }
]`}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Media</CardTitle>
          <p className="text-sm text-muted-foreground">
            Gallery images, videos, etc.
          </p>
        </CardHeader>
        <CardContent>
          <Textarea
            value={mediaJson}
            onChange={(e) => {
              setMediaJson(e.target.value);
              try {
                const parsed = JSON.parse(e.target.value);
                onChange({ media: parsed });
              } catch {}
            }}
            rows={6}
            className="font-mono text-sm"
            placeholder={`{
  "gallery": ["https://...", "https://..."],
  "video": "https://youtube.com/..."
}`}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Compliance</CardTitle>
          <p className="text-sm text-muted-foreground">
            Legal notices, disclaimers
          </p>
        </CardHeader>
        <CardContent>
          <Textarea
            value={complianceJson}
            onChange={(e) => {
              setComplianceJson(e.target.value);
              try {
                const parsed = JSON.parse(e.target.value);
                onChange({ compliance: parsed });
              } catch {}
            }}
            rows={5}
            className="font-mono text-sm"
            placeholder={`{
  "notices": ["This is not financial advice", "..."]
}`}
          />
        </CardContent>
      </Card>
    </div>
  );
}
