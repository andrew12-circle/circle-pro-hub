// src/components/commerce/AddToCartModal.tsx
'use client';
import * as React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Shield, Star, ArrowRight } from 'lucide-react';
import type { ServiceCard } from '../../../contracts/marketplace';
import type { PricingSelection, PricingMode } from '../../../contracts/cart/pricing-selection';
import type { VendorPartner } from '../../../contracts/affiliates/partner';
import type { PointsBalance } from '@/data/wallet';

type Props = {
  service: ServiceCard;
  userIsPro: boolean;
  wallet?: PointsBalance | null;
  /** Optional pre-filtered partners (use lib/eligiblePartners upstream). */
  eligiblePartners?: VendorPartner[];
  /** Called when user confirms a pricing mode (push to your cart store here). */
  onConfirm: (selection: PricingSelection) => void;
  /** Optional trigger (e.g., "Add to cart" button). If omitted, render a default trigger. */
  trigger?: React.ReactNode;
};

export function AddToCartModal({
  service,
  userIsPro,
  wallet,
  eligiblePartners = [],
  onConfirm,
  trigger,
}: Props) {
  const [open, setOpen] = React.useState(false);
  const [mode, setMode] = React.useState<PricingMode>('retail');
  const [selectedPartnerId, setSelectedPartnerId] = React.useState<string | undefined>(undefined);
  const [pointsToUse, setPointsToUse] = React.useState<number>(0);

  const copayAvailable = userIsPro && eligiblePartners.length > 0 && !!service.pricing.copay;
  const proAvailable = userIsPro && !!service.pricing.pro;
  const pointsAvailable = userIsPro && (wallet?.points ?? 0) > 0;

  // Ensure invalid combos get reset when toggling modes or losing eligibility
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
    onConfirm(selection);
    // close + reset light state
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
          {/* Modes */}
          <div className="grid grid-cols-2 gap-3">
            <ModeButton
              label="Retail"
              active={mode === 'retail'}
              onClick={() => setMode('retail')}
              helper="Pay standard price"
            />
            <ModeButton
              label="Pro"
              active={mode === 'pro'}
              onClick={() => setMode('pro')}
              disabled={!proAvailable}
              helper={proAvailable ? 'Member savings' : 'Requires Pro'}
            />
            <ModeButton
              label="Co-Pay"
              active={mode === 'copay'}
              onClick={() => setMode('copay')}
              disabled={!copayAvailable}
              helper={copayAvailable ? 'Get vendor help' : 'Not available'}
            />
            <ModeButton
              label="Use Points"
              active={mode === 'points'}
              onClick={() => setMode('points')}
              disabled={!pointsAvailable}
              helper={pointsAvailable ? 'Spend Circle Points' : 'No points available'}
            />
          </div>

          {/* Co-Pay partner selector */}
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
                      className={`cursor-pointer p-3 border ${
                        selectedPartnerId === p.id ? 'ring-2 ring-primary' : 'hover:border-primary/50'
                      }`}
                      onClick={() => setSelectedPartnerId(p.id)}
                    >
                      <div className="flex items-start gap-2">
                        <img
                          src={p.logo}
                          alt={p.name}
                          className="w-10 h-10 rounded object-cover flex-shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1 mb-1">
                            <div className="font-semibold text-sm truncate">{p.name}</div>
                            {p.verified && (
                              <Shield className="h-3 w-3 text-primary flex-shrink-0" />
                            )}
                          </div>
                          <div className="text-xs text-muted-foreground line-clamp-1">
                            {p.markets.slice(0, 2).join(', ')}
                            {p.markets.length > 2 && '…'}
                          </div>
                          {p.rating && (
                            <div className="flex items-center gap-1 mt-1">
                              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                              <span className="text-xs font-medium">{p.rating}</span>
                              {p.reviews && (
                                <span className="text-xs text-muted-foreground">({p.reviews})</span>
                              )}
                            </div>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0"
                          onClick={(e) => {
                            e.stopPropagation();
                            // TODO: Open partner preview sheet
                          }}
                        >
                          <ArrowRight className="h-3 w-3" />
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Points selector */}
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
                className="w-32 rounded-md border px-2 py-1 text-sm"
              />
            </div>
          )}
        </div>

        <DialogFooter className="mt-4">
          <Button variant="ghost" onClick={() => setOpen(false)}>
            Cancel
          </Button>
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
  label,
  helper,
  active,
  disabled,
  onClick,
}: {
  label: string;
  helper?: string;
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={`text-left rounded-xl border p-3 transition ${
        active ? 'border-primary/60 bg-primary/[0.03]' : 'border-border hover:border-primary/25'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      <div className="text-sm font-medium">{label}</div>
      {helper && <div className="mt-0.5 text-xs text-muted-foreground">{helper}</div>}
    </button>
  );
}

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}
function safeInt(v: string) {
  const n = Number(v);
  return Number.isFinite(n) ? Math.max(0, Math.floor(n)) : 0;
}
