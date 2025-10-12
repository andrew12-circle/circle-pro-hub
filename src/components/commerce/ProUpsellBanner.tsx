import { useNavigate } from "react-router-dom";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Crown, TrendingDown, Zap, Gift, X } from "lucide-react";
import { useState } from "react";

interface ProUpsellBannerProps {
  variant?: "default" | "compact";
  dismissible?: boolean;
  className?: string;
}

export function ProUpsellBanner({ 
  variant = "default", 
  dismissible = false,
  className = "" 
}: ProUpsellBannerProps) {
  const navigate = useNavigate();
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  if (variant === "compact") {
    return (
      <Alert className={`border-primary/50 bg-gradient-to-r from-primary/5 to-primary/10 relative ${className}`}>
        {dismissible && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-2 right-2 h-6 w-6"
            onClick={() => setDismissed(true)}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
        <Crown className="h-4 w-4 text-primary" />
        <AlertDescription className="text-sm flex items-center justify-between gap-4">
          <div>
            <span className="font-semibold">Not a Pro Member?</span> Save 15-30% on every service
          </div>
          <Button
            variant="default"
            size="sm"
            onClick={() => navigate("/pricing")}
            className="whitespace-nowrap"
          >
            Upgrade Now
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Alert className={`border-primary/50 bg-gradient-to-r from-primary/5 to-primary/10 relative ${className}`}>
      {dismissible && (
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-2 right-2 h-6 w-6"
          onClick={() => setDismissed(true)}
        >
          <X className="h-4 w-4" />
        </Button>
      )}
      <div className="space-y-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Crown className="h-5 w-5 text-primary" />
            <h3 className="font-semibold text-lg">What you're missing without Pro</h3>
          </div>
          <p className="text-sm text-muted-foreground">
            Unlock exclusive savings and benefits with Pro membership
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="flex items-start gap-2">
            <TrendingDown className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-semibold text-sm">Save 15-30%</p>
              <p className="text-xs text-muted-foreground">On every service</p>
            </div>
          </div>

          <div className="flex items-start gap-2">
            <Crown className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-semibold text-sm">Pro Badge</p>
              <p className="text-xs text-muted-foreground">Show your status</p>
            </div>
          </div>

          <div className="flex items-start gap-2">
            <Zap className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-semibold text-sm">Priority Support</p>
              <p className="text-xs text-muted-foreground">Get help faster</p>
            </div>
          </div>

          <div className="flex items-start gap-2">
            <Gift className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-semibold text-sm">Bonus Points</p>
              <p className="text-xs text-muted-foreground">Earn more rewards</p>
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            onClick={() => navigate("/pricing")}
            size="sm"
          >
            <Crown className="h-4 w-4 mr-2" />
            Upgrade to Pro
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate("/pricing")}
          >
            Learn More
          </Button>
        </div>
      </div>
    </Alert>
  );
}
