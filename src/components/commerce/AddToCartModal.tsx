// src/components/commerce/AddToCartModal.tsx
'use client';
import * as React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { logUXEvent } from '@/lib/analytics';
import type { ServiceCard } from '../../../contracts/marketplace';
import type { PricingSelection } from '../../../contracts/cart/pricing-selection';
import type { VendorPartner } from '@/lib/vendor_rules';
import type { Wallet } from '../../../contracts/account/wallet';

type Mode = 'retail' | 'pro' | 'copay' | 'points';

type Props = {
  service: ServiceCard;
  userIsPro: boolean;
  wallet?: Wallet | null;
  eligiblePartners?: VendorPartner[];
  /** Called when user confirms. */
  onConfirm: (selection: PricingSelection) => void;
  /** Optional trigger (e.g., "Add to cart" button). */
  trigger?: React.ReactNode;
};

export function AddToCartModal({ service, userIsPro, wallet, eligiblePartners = [], onConfirm, trigger }: Props) {
  const [open, setOpen] = React.useState(false);
  const [mode, setMode] = React.useState<Mode>('retail');
  const [selectedPartnerId, setSelectedPartnerId] = React.useState<string | undefined>(undefined);
  const [pointsToUse, setPointsToUse] = React.useState<number>(0);

  const copayAvailable = userIsPro && !!service.pricing.copay && eligiblePartners.length > 0;
  const proAvailable = userIsPro && !!service.pricing.pro;
  const pointsAvailable = userIsPro && (wallet?.points ?? 0) > 0;

  React.useEffect(() => {
    if (mode === 'copay' && !copayAvailable) {
      setMode(proAvailable ? 'pro' : 'retail');
      setSelectedPartnerId(undefined);
    }
    if (mode === 'pro' && !proAvailable) setMode('retail');
    if (mode === 'points' && !pointsAvailable) setMode(userIsPro ? 'pro' : 'retail');
  }, [mode, copayAvailable, proAvailable, pointsAvailable, userIsPro]);

  function confirm() {
    const selection: PricingSelection = {
      serviceId: service.id,
      mode,
      price: mode === 'pro' && service.pricing.pro 
        ? service.pricing.pro 
        : mode === 'copay' && service.pricing.copay
        ? service.pricing.copay
        : service.pricing.retail,
      vendorPartnerId: mode === 'copay' ? selectedPartnerId : undefined,
      pointsCost: mode === 'points' ? clamp(pointsToUse, 0, wallet?.points ?? 0) : undefined,
      copayPartnerShare: mode === 'copay' ? service.pricing.copayWithVendor : undefined,
      userShare: mode === 'copay' ? service.pricing.copay : undefined,
    };
    
    // Log UX events
    logUXEvent({ type: 'PricingModeChosen', mode, serviceId: service.id });
    logUXEvent({ type: 'CartItemAdded', serviceId: service.id, mode });
    
    if (mode === 'copay' && selectedPartnerId) {
      logUXEvent({ type: 'VendorPartnerSelected', partnerId: selectedPartnerId, serviceId: service.id });
    }
    
    onConfirm(selection);
    setOpen(false);
    setSelectedPartnerId(undefined);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? <Button aria-label="Add to cart">Add to cart</Button>}
      </DialogTrigger>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Select how you want to cover this</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <ModeButton label="Retail" helper="Pay standard price" active={mode==='retail'} onClick={()=>setMode('retail')} />
            <ModeButton label="Pro" helper={proAvailable?'Member savings':'Requires Pro'} active={mode==='pro'} disabled={!proAvailable} onClick={()=>setMode('pro')} />
            <ModeButton label="Co-Pay" helper={copayAvailable?'Get vendor help':'Not available'} active={mode==='copay'} disabled={!copayAvailable} onClick={()=>setMode('copay')} />
            <ModeButton label="Use Points" helper={pointsAvailable?'Spend Circle Points':'No points'} active={mode==='points'} disabled={!pointsAvailable} onClick={()=>setMode('points')} />
          </div>

          {mode === 'copay' && (
            <div className="space-y-2">
              <div className="text-sm font-medium">Select a vendor partner</div>
              {eligiblePartners.length === 0 ? (
                <div className="text-sm text-muted-foreground">No eligible partners found for your market.</div>
              ) : (
                <div className="grid grid-cols-2 gap-3 max-h-60 overflow-auto pr-1">
                  {eligiblePartners.map((p) => (
                    <Card
                      key={p.id}
                      className={`cursor-pointer p-3 border ${selectedPartnerId===p.id ? 'ring-2 ring-primary' : 'hover:border-foreground/20'}`}
                      onClick={() => setSelectedPartnerId(p.id)}
                    >
                      <div className="text-sm font-medium">{p.name}</div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {p.markets.slice(0,2).join(', ')}{p.markets.length>2 && '…'}
                      </div>
                      {p.copayPolicy?.sharePct ? (
                        <div className="mt-2 text-xs">Covers up to {p.copayPolicy.sharePct}%</div>
                      ) : null}
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}

          {mode === 'points' && (
            <div className="space-y-2">
              <div className="text-sm font-medium">Use Circle Points</div>
              <div className="text-xs text-muted-foreground">
                Available: {wallet?.points ?? 0} pts (no public $/pt value shown)
              </div>
              <input
                type="number"
                min={0}
                max={wallet?.points ?? 0}
                value={pointsToUse}
                onChange={(e) => setPointsToUse(safeInt(e.target.value))}
                className="w-32 rounded-md border border-input bg-background px-2 py-1 text-sm"
              />
            </div>
          )}
        </div>

        <DialogFooter className="mt-4">
          <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
          <Button
            onClick={confirm}
            disabled={
              (mode === 'copay' && !selectedPartnerId) ||
              (mode === 'points' && (wallet?.points ?? 0) <= 0)
            }
          >
            Confirm
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function ModeButton({
  label, helper, active, disabled, onClick,
}: { label: string; helper?: string; active?: boolean; disabled?: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={`text-left rounded-xl border p-3 transition ${
        active ? 'border-foreground/60 bg-accent' : 'border-border hover:border-foreground/25'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      <div className="text-sm font-medium">{label}</div>
      {helper && <div className="mt-0.5 text-xs text-muted-foreground">{helper}</div>}
    </button>
  );
}

function clamp(n: number, min: number, max: number) { return Math.max(min, Math.min(max, n)); }
function safeInt(v: string) { const n = Number(v); return Number.isFinite(n) ? Math.max(0, Math.floor(n)) : 0; }
