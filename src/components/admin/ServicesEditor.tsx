/**
 * MVASE: Minimum Viable Admin Services Editor
 * One draft per service, one Save button, no autosave
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
import { getServiceDraft, saveServiceDraft } from "@/data/adminServices";
import type { TServiceDraft, TCard, TPricing, TFunnel } from "@/schemas/service";

interface ServicesEditorProps {
  serviceId: string;
  onClose: () => void;
}

export function ServicesEditor({ serviceId, onClose }: ServicesEditorProps) {
  const [serverDraft, setServerDraft] = useState<TServiceDraft | null>(null);
  const [localDraft, setLocalDraft] = useState<TServiceDraft | null>(null);
  const [isDirty, setIsDirty] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Load draft on mount
  useEffect(() => {
    loadDraft();
  }, [serviceId]);

  async function loadDraft() {
    setLoading(true);
    try {
      const response = await getServiceDraft(serviceId);
      setServerDraft(response.draft);
      setLocalDraft(response.draft);
      setIsDirty(false);
    } catch (error) {
      console.error('[ServicesEditor] Load error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to load draft');
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    if (!localDraft) return;

    setSaving(true);
    try {
      const response = await saveServiceDraft(serviceId, localDraft);
      setServerDraft(response.draft);
      setLocalDraft(response.draft);
      setIsDirty(false);
      toast.success("Saved successfully");
    } catch (error: any) {
      console.error('[ServicesEditor] Save error:', error);
      
      if (error.status === 409) {
        toast.error("Version conflict detected. Reloading latest version...");
        await loadDraft();
      } else {
        toast.error(error instanceof Error ? error.message : 'Failed to save');
      }
    } finally {
      setSaving(false);
    }
  }

  function updateCard(updates: Partial<TCard>) {
    if (!localDraft) return;
    setLocalDraft({
      ...localDraft,
      card: { ...localDraft.card, ...updates },
    });
    setIsDirty(true);
  }

  function updatePricing(updates: Partial<TPricing>) {
    if (!localDraft) return;
    setLocalDraft({
      ...localDraft,
      pricing: { ...localDraft.pricing, ...updates },
    });
    setIsDirty(true);
  }

  function updateFunnel(updates: Partial<TFunnel>) {
    if (!localDraft) return;
    setLocalDraft({
      ...localDraft,
      funnel: { ...localDraft.funnel, ...updates },
    });
    setIsDirty(true);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <p className="text-muted-foreground">Loading draft...</p>
      </div>
    );
  }

  if (!localDraft) {
    return (
      <div className="flex items-center justify-center p-8">
        <p className="text-destructive">Failed to load draft</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold">Edit Service</h2>
          {isDirty && <span className="text-xs text-muted-foreground">(unsaved changes)</span>}
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={handleSave}
            disabled={!isDirty || saving}
            variant="default"
          >
            {saving ? "Saving..." : "Save"}
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
            <TabsTrigger value="card">Card</TabsTrigger>
            <TabsTrigger value="pricing">Pricing</TabsTrigger>
            <TabsTrigger value="funnel">Funnel</TabsTrigger>
          </TabsList>

          <TabsContent value="card">
            <CardEditor value={localDraft.card} onChange={updateCard} />
          </TabsContent>

          <TabsContent value="pricing">
            <PricingEditor value={localDraft.pricing} onChange={updatePricing} />
          </TabsContent>

          <TabsContent value="funnel">
            <FunnelEditor value={localDraft.funnel} onChange={updateFunnel} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

// Card Editor
function CardEditor({ value, onChange }: { value: TCard; onChange: (v: Partial<TCard>) => void }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Service Card</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="title">Title</Label>
          <Input
            id="title"
            value={value.title}
            onChange={(e) => onChange({ title: e.target.value })}
            maxLength={90}
          />
        </div>

        <div>
          <Label htmlFor="subtitle">Subtitle</Label>
          <Input
            id="subtitle"
            value={value.subtitle || ""}
            onChange={(e) => onChange({ subtitle: e.target.value })}
            maxLength={140}
          />
        </div>

        <div>
          <Label htmlFor="category">Category</Label>
          <Input
            id="category"
            value={value.category}
            onChange={(e) => onChange({ category: e.target.value })}
          />
        </div>

        <div>
          <Label htmlFor="badges">Badges (comma-separated)</Label>
          <Input
            id="badges"
            value={value.badges?.join(", ") || ""}
            onChange={(e) => onChange({ badges: e.target.value.split(",").map(s => s.trim()).filter(Boolean) })}
          />
        </div>

        <div>
          <Label htmlFor="tags">Tags (comma-separated)</Label>
          <Input
            id="tags"
            value={value.tags?.join(", ") || ""}
            onChange={(e) => onChange({ tags: e.target.value.split(",").map(s => s.trim()).filter(Boolean) })}
          />
        </div>

        <div>
          <Label htmlFor="thumbnail">Thumbnail URL</Label>
          <Input
            id="thumbnail"
            type="url"
            value={value.thumbnail || ""}
            onChange={(e) => onChange({ thumbnail: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label>Flags</Label>
          <div className="flex items-center space-x-2">
            <Switch
              checked={value.flags?.active ?? true}
              onCheckedChange={(active) => onChange({ flags: { ...value.flags, active } })}
            />
            <Label>Active</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              checked={value.flags?.verified ?? false}
              onCheckedChange={(verified) => onChange({ flags: { ...value.flags, verified } })}
            />
            <Label>Verified</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              checked={value.flags?.booking ?? false}
              onCheckedChange={(booking) => onChange({ flags: { ...value.flags, booking } })}
            />
            <Label>Booking Enabled</Label>
          </div>
        </div>

        <div>
          <Label htmlFor="complianceNotes">Compliance Notes</Label>
          <Textarea
            id="complianceNotes"
            value={value.complianceNotes || ""}
            onChange={(e) => onChange({ complianceNotes: e.target.value })}
            maxLength={1000}
            rows={3}
          />
        </div>
      </CardContent>
    </Card>
  );
}

// Pricing Editor
function PricingEditor({ value, onChange }: { value: TPricing; onChange: (v: Partial<TPricing>) => void }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Pricing</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="currency">Currency</Label>
          <Input
            id="currency"
            value={value.currency}
            onChange={(e) => onChange({ currency: e.target.value })}
            maxLength={3}
          />
        </div>

        <div>
          <Label>Tiers (JSON)</Label>
          <Textarea
            value={JSON.stringify(value.tiers, null, 2)}
            onChange={(e) => {
              try {
                const tiers = JSON.parse(e.target.value);
                onChange({ tiers });
              } catch {
                // Invalid JSON, ignore
              }
            }}
            rows={10}
            className="font-mono text-sm"
          />
        </div>

        <div>
          <Label htmlFor="billingTerms">Billing Terms</Label>
          <Textarea
            id="billingTerms"
            value={value.billing?.terms || ""}
            onChange={(e) => onChange({ billing: { ...value.billing, terms: e.target.value } })}
            maxLength={500}
            rows={3}
          />
        </div>
      </CardContent>
    </Card>
  );
}

// Funnel Editor
function FunnelEditor({ value, onChange }: { value: TFunnel; onChange: (v: Partial<TFunnel>) => void }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Funnel Steps</CardTitle>
      </CardHeader>
      <CardContent>
        <Label>Steps (JSON)</Label>
        <Textarea
          value={JSON.stringify(value.steps, null, 2)}
          onChange={(e) => {
            try {
              const steps = JSON.parse(e.target.value);
              onChange({ steps });
            } catch {
              // Invalid JSON, ignore
            }
          }}
          rows={15}
          className="font-mono text-sm"
        />
      </CardContent>
    </Card>
  );
}
