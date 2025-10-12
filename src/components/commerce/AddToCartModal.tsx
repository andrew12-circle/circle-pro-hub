import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Lock, Crown, Users, Coins, ShoppingCart, TrendingDown } from "lucide-react";
import { PricingMode, PricingSelection } from "../../../contracts/cart/pricing-selection";
import { PricePlan } from "../../../contracts/marketplace";
import { useCart } from "@/lib/cartStore";
import { useProMember } from "@/hooks/use-pro-member";
import { featureFlags } from "@/lib/featureFlags";
import { useToast } from "@/hooks/use-toast";

interface AddToCartModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  serviceId: string;
  serviceName: string;
  vendorName: string;
  packageId?: string;
  packageName?: string;
  pricing: PricePlan;
}

export function AddToCartModal({
  open,
  onOpenChange,
  serviceId,
  serviceName,
  vendorName,
  packageId,
  packageName,
  pricing,
}: AddToCartModalProps) {
  const navigate = useNavigate();
  const { addItem } = useCart();
  const { isPro, loading: proLoading } = useProMember();
  const { toast } = useToast();
  
  const [selectedMode, setSelectedMode] = useState<PricingMode>("retail");

  useEffect(() => {
    if (proLoading) return;
    
    if (isPro && pricing.pro) {
      setSelectedMode("pro");
    } else {
      setSelectedMode("retail");
    }
  }, [isPro, proLoading, pricing.pro]);

  const formatPrice = (amount: number, currency: string = "USD"): string => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
    }).format(amount);
  };

  const getPricingForMode = (mode: PricingMode) => {
    switch (mode) {
      case "pro":
        return pricing.pro || pricing.retail;
      case "copay":
        return pricing.copay || pricing.retail;
      case "retail":
      default:
        return pricing.retail;
    }
  };

  const handleAddToCart = () => {
    const selectedPrice = getPricingForMode(selectedMode);

    const pricingSelection: Omit<PricingSelection, never> = {
      serviceId,
      packageId,
      mode: selectedMode,
      price: selectedPrice,
      pointsCost: selectedMode === "points" ? undefined : undefined,
      copayPartnerShare: selectedMode === "copay" ? pricing.copayWithVendor : undefined,
      userShare: selectedMode === "copay" ? pricing.copay : undefined,
    };

    addItem({
      ...pricingSelection,
      serviceName,
      vendorName,
      packageName,
    });

    toast({
      title: "Added to cart",
      description: `${serviceName} has been added to your cart.`,
    });

    onOpenChange(false);
  };

  const handleAddAndViewCart = () => {
    handleAddToCart();
    navigate("/cart");
  };

  const getProUpsellMessage = () => {
    if (pricing.pro && pricing.proPctSavings) {
      const savings = pricing.retail.amount - pricing.pro.amount;
      return `Upgrade to Pro and save ${formatPrice(savings)} (${pricing.proPctSavings}%) on this service!`;
    }
    return "Upgrade to Pro for exclusive member pricing!";
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Choose Your Pricing</DialogTitle>
          <DialogDescription>
            Select how you'd like to purchase {serviceName}
            {packageName && ` - ${packageName}`}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {!isPro && pricing.pro && (
            <Alert className="border-primary/50 bg-primary/5">
              <Crown className="h-4 w-4 text-primary" />
              <AlertDescription className="text-sm">
                {getProUpsellMessage()}{" "}
                <Button
                  variant="link"
                  className="h-auto p-0 text-primary"
                  onClick={() => navigate("/account/billing")}
                >
                  Upgrade now →
                </Button>
              </AlertDescription>
            </Alert>
          )}

          <RadioGroup value={selectedMode} onValueChange={(v) => setSelectedMode(v as PricingMode)}>
            <div className="flex items-start space-x-3 rounded-lg border p-4 cursor-pointer hover:bg-accent/50 transition-colors">
              <RadioGroupItem value="retail" id="retail" className="mt-1" />
              <Label htmlFor="retail" className="flex-1 cursor-pointer">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold">Retail Price</span>
                  <span className="text-xl font-bold">
                    {formatPrice(pricing.retail.amount, pricing.retail.currency)}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Standard pricing available to everyone
                </p>
              </Label>
            </div>

            <div
              className={`flex items-start space-x-3 rounded-lg border p-4 ${
                isPro && pricing.pro
                  ? "cursor-pointer hover:bg-accent/50 transition-colors"
                  : "opacity-50 cursor-not-allowed"
              }`}
            >
              <RadioGroupItem
                value="pro"
                id="pro"
                disabled={!isPro || !pricing.pro}
                className="mt-1"
              />
              <Label htmlFor="pro" className={`flex-1 ${isPro && pricing.pro ? "cursor-pointer" : "cursor-not-allowed"}`}>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">Pro Member Price</span>
                    <Crown className="h-4 w-4 text-yellow-600" />
                    {pricing.proPctSavings && (
                      <Badge variant="default" className="text-xs">
                        Save {pricing.proPctSavings}%
                      </Badge>
                    )}
                  </div>
                  {pricing.pro && (
                    <span className="text-xl font-bold text-primary">
                      {formatPrice(pricing.pro.amount, pricing.pro.currency)}
                    </span>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">
                  {isPro
                    ? "Exclusive pricing for Pro members"
                    : "Requires Pro membership"}
                </p>
                {!isPro && (
                  <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                    <Lock className="h-3 w-3" />
                    <span>Pro membership required</span>
                  </div>
                )}
              </Label>
            </div>

            <div className="flex items-start space-x-3 rounded-lg border p-4 opacity-50 cursor-not-allowed">
              <RadioGroupItem value="copay" id="copay" disabled className="mt-1" />
              <Label htmlFor="copay" className="flex-1 cursor-not-allowed">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">Co-Pay Pricing</span>
                    <Users className="h-4 w-4 text-blue-600" />
                    <Badge variant="secondary" className="text-xs">Coming Soon</Badge>
                  </div>
                  {pricing.copay && (
                    <span className="text-xl font-bold text-blue-600">
                      {formatPrice(pricing.copay.amount, pricing.copay.currency)}
                    </span>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">
                  Your brokerage covers part of the cost
                </p>
                <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                  <Lock className="h-3 w-3" />
                  <span>Partner eligibility required</span>
                </div>
              </Label>
            </div>

            {featureFlags.wallet && (
              <div className="flex items-start space-x-3 rounded-lg border p-4 opacity-50 cursor-not-allowed">
                <RadioGroupItem value="points" id="points" disabled className="mt-1" />
                <Label htmlFor="points" className="flex-1 cursor-not-allowed">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">Pay with Points</span>
                      <Coins className="h-4 w-4 text-yellow-600" />
                      <Badge variant="secondary" className="text-xs">Coming Soon</Badge>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Redeem your Circle Points for this service
                  </p>
                  <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                    <Lock className="h-3 w-3" />
                    <span>Insufficient points balance</span>
                  </div>
                </Label>
              </div>
            )}
          </RadioGroup>

          {selectedMode === "pro" && pricing.pro && pricing.proPctSavings && (
            <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-900">
              <TrendingDown className="h-5 w-5 text-green-600" />
              <div className="flex-1">
                <p className="text-sm font-semibold text-green-700 dark:text-green-400">
                  You're saving {formatPrice(pricing.retail.amount - pricing.pro.amount)}!
                </p>
                <p className="text-xs text-green-600 dark:text-green-500">
                  That's {pricing.proPctSavings}% off retail pricing
                </p>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="w-full sm:w-auto">
            Cancel
          </Button>
          <div className="flex gap-2 w-full sm:w-auto">
            <Button onClick={handleAddToCart} variant="secondary" className="flex-1 sm:flex-initial">
              <ShoppingCart className="mr-2 h-4 w-4" />
              Add to Cart
            </Button>
            <Button onClick={handleAddAndViewCart} className="flex-1 sm:flex-initial">
              Add & View Cart
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
