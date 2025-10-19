import { useEffect, useMemo, useRef, useState } from "react";
import type { TCard, TPricing, TFunnel, TServiceDraft } from "@/schemas/service";
import { ZCard, ZPricing, ZFunnel } from "@/schemas/service";
import { useToast } from "@/hooks/use-toast";
import { getServiceDraft, patchCard, patchPricing, patchFunnel, publishVersion } from "@/data/adminServices";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Loader2 } from "lucide-react";

const DEBOUNCE_MS = 900;

export default function ServicesEditor({ serviceId }: { serviceId: string }) {
  const { toast } = useToast();
  const [draft, setDraft] = useState<TServiceDraft | null>(null);
  const [published, setPublished] = useState<TServiceDraft | null>(null);
  const [saving, setSaving] = useState<null | "card" | "pricing" | "funnel">(null);
  const [lastSaved, setLastSaved] = useState<number | null>(null);
  const timer = useRef<number | null>(null);

  // Load draft and published versions
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const data = await getServiceDraft(serviceId);
        if (!alive) return;
        setDraft(data.draft);
        setPublished(data.published);
      } catch {
        toast({ title: "Failed to load service", variant: "destructive" });
      }
    })();
    return () => { alive = false; };
  }, [serviceId, toast]);

  // Save card (explicit)
  async function saveCard(next: TCard) {
    if (!draft) return;
    try {
      setSaving("card");
      const updated = await patchCard(serviceId, next, draft.row_version);
      setDraft(updated);
      setLastSaved(Date.now());
      toast({ title: "Card saved" });
    } catch (e: any) {
      if (e?.status === 409) {
        toast({ title: "Version conflict", description: "Reloading latest version" });
        const data = await getServiceDraft(serviceId);
        setDraft(data.draft);
      } else {
        toast({ title: "Save failed", variant: "destructive" });
      }
    } finally {
      setSaving(null);
    }
  }

  // Save pricing (explicit)
  async function savePricing(next: TPricing) {
    if (!draft) return;
    try {
      setSaving("pricing");
      const updated = await patchPricing(serviceId, next, draft.row_version);
      setDraft(updated);
      setLastSaved(Date.now());
      toast({ title: "Pricing saved" });
    } catch (e: any) {
      if (e?.status === 409) {
        toast({ title: "Version conflict", description: "Reloading latest version" });
        const data = await getServiceDraft(serviceId);
        setDraft(data.draft);
      } else {
        toast({ title: "Save failed", variant: "destructive" });
      }
    } finally {
      setSaving(null);
    }
  }

  // Save funnel (debounced)
  function saveFunnelDebounced(next: TFunnel) {
    if (!draft) return;
    if (timer.current) window.clearTimeout(timer.current);
    timer.current = window.setTimeout(async () => {
      try {
        setSaving("funnel");
        const updated = await patchFunnel(serviceId, next, draft.row_version);
        setDraft(updated);
        setLastSaved(Date.now());
      } catch (e: any) {
        if (e?.status === 409) {
          toast({ title: "Version conflict", description: "Reloading latest version" });
          const data = await getServiceDraft(serviceId);
          setDraft(data.draft);
        } else {
          toast({ title: "Save failed", variant: "destructive" });
        }
      } finally {
        setSaving(null);
      }
    }, DEBOUNCE_MS) as unknown as number;
  }

  const savedMsg = useMemo(() => 
    lastSaved ? `Saved ${Math.round((Date.now() - lastSaved) / 1000)}s ago` : "", 
    [lastSaved]
  );

  if (!draft) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">{savedMsg}</div>
        <div className="space-x-2">
          <Button
            variant="outline"
            onClick={() => window.open(`/vendor-preview?service=${serviceId}`, "_blank")}
          >
            Preview
          </Button>
          <Button
            onClick={async () => {
              if (!draft.id) {
                toast({ title: "Cannot publish: draft ID missing", variant: "destructive" });
                return;
              }
              try {
                await publishVersion({ id: draft.id });
                toast({ title: "Published successfully" });
                const data = await getServiceDraft(serviceId);
                setDraft(data.draft);
                setPublished(data.published);
              } catch {
                toast({ title: "Publish failed", variant: "destructive" });
              }
            }}
          >
            Publish
          </Button>
        </div>
      </header>

      <Tabs defaultValue="card">
        <TabsList>
          <TabsTrigger value="card">Card</TabsTrigger>
          <TabsTrigger value="pricing">Pricing</TabsTrigger>
          <TabsTrigger value="funnel">Funnel</TabsTrigger>
        </TabsList>

        <TabsContent value="card">
          <CardForm 
            value={draft.card} 
            onChange={v => saveCard(ZCard.parse(v))} 
            saving={saving === "card"} 
          />
        </TabsContent>

        <TabsContent value="pricing">
          <PricingForm 
            value={draft.pricing} 
            onChange={v => savePricing(ZPricing.parse(v))} 
            saving={saving === "pricing"} 
          />
        </TabsContent>

        <TabsContent value="funnel">
          <FunnelEditor
            value={draft.funnel}
            onChange={v => saveFunnelDebounced(ZFunnel.parse(v))}
            saving={saving === "funnel"}
            pricingTiers={draft?.pricing?.tiers?.map(t => t.id) ?? []}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function CardForm({ value, onChange, saving }: { value: TCard; onChange: (v: TCard) => void; saving: boolean }) {
  const [formData, setFormData] = useState<TCard>(() => ({
    ...value,
    flags: value.flags || { active: true, verified: false, affiliate: false, booking: false },
    cta: value.cta || { type: "book", label: "Book Now", url: "" }
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Service Card</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={e => setFormData({ ...formData, title: e.target.value })}
              placeholder="Service title"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="subtitle">Subtitle</Label>
            <Input
              id="subtitle"
              value={formData.subtitle || ""}
              onChange={e => setFormData({ ...formData, subtitle: e.target.value })}
              placeholder="Optional subtitle"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="category">Category</Label>
          <Input
            id="category"
            value={formData.category}
            onChange={e => setFormData({ ...formData, category: e.target.value })}
            placeholder="Service category"
          />
        </div>

        <div className="flex items-center space-x-2">
          <Switch
            id="active"
            checked={formData.flags.active}
            onCheckedChange={active => 
              setFormData({ ...formData, flags: { ...formData.flags, active } })
            }
          />
          <Label htmlFor="active">Active</Label>
        </div>

        <Button onClick={() => onChange(formData)} disabled={saving}>
          {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
          Save Card
        </Button>
      </CardContent>
    </Card>
  );
}

function PricingForm({ value, onChange, saving }: { value: TPricing; onChange: (v: TPricing) => void; saving: boolean }) {
  const [formData, setFormData] = useState(value);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pricing Tiers</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="currency">Currency</Label>
          <Input
            id="currency"
            value={formData.currency}
            onChange={e => setFormData({ ...formData, currency: e.target.value })}
            placeholder="USD"
          />
        </div>

        {formData.tiers.map((tier, idx) => (
          <div key={tier.id} className="p-4 border rounded-lg space-y-3">
            <div className="grid md:grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Tier Name</Label>
                <Input
                  value={tier.name}
                  onChange={e => {
                    const updated = [...formData.tiers];
                    updated[idx] = { ...tier, name: e.target.value };
                    setFormData({ ...formData, tiers: updated });
                  }}
                />
              </div>
              <div className="space-y-2">
                <Label>Price</Label>
                <Input
                  type="number"
                  value={tier.price}
                  onChange={e => {
                    const updated = [...formData.tiers];
                    updated[idx] = { ...tier, price: Number(e.target.value) };
                    setFormData({ ...formData, tiers: updated });
                  }}
                />
              </div>
            </div>
          </div>
        ))}

        <Button onClick={() => onChange(formData)} disabled={saving}>
          {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
          Save Pricing
        </Button>
      </CardContent>
    </Card>
  );
}

function FunnelEditor({ value, onChange, saving, pricingTiers }: { value: TFunnel; onChange: (v: TFunnel) => void; saving: boolean; pricingTiers: string[] }) {
  const [jsonValue, setJsonValue] = useState(JSON.stringify(value, null, 2));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Funnel Configuration</CardTitle>
        <p className="text-sm text-muted-foreground">
          Auto-saves after {DEBOUNCE_MS / 1000}s of inactivity
        </p>
      </CardHeader>
      <CardContent>
        <Textarea
          value={jsonValue}
          onChange={e => {
            setJsonValue(e.target.value);
            try {
              const parsed = JSON.parse(e.target.value);
              onChange(parsed);
            } catch {
              // Invalid JSON, wait for valid input
            }
          }}
          className="font-mono min-h-[400px]"
          placeholder="Funnel JSON configuration"
        />
        {saving && <div className="text-xs text-muted-foreground mt-2">Saving...</div>}
      </CardContent>
    </Card>
  );
}
