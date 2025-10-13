import { useState, useEffect } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { X, AlertTriangle } from "lucide-react";
import { featureFlags } from "@/lib/featureFlags";

const STORAGE_KEY = "degraded-banner-dismissed";

export function DegradedBanner() {
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const isDismissed = localStorage.getItem(STORAGE_KEY) === "true";
    setDismissed(isDismissed);
  }, []);

  if (!featureFlags.degraded_mode || dismissed) {
    return null;
  }

  const handleDismiss = () => {
    localStorage.setItem(STORAGE_KEY, "true");
    setDismissed(true);
  };

  return (
    <Alert className="border-amber-500 bg-amber-50 text-amber-900 dark:border-amber-600 dark:bg-amber-950 dark:text-amber-200 mb-4 mx-4 mt-4">
      <AlertTriangle className="h-4 w-4" />
      <AlertTitle>Service Degradation Active</AlertTitle>
      <AlertDescription className="flex items-center justify-between gap-4">
        <span>
          Some features are temporarily unavailable. Co-Pay and Points are disabled. 
          Retail and Pro pricing remain active.
        </span>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleDismiss}
          className="ml-4 h-6 w-6 p-0 text-amber-900 hover:bg-amber-100 dark:text-amber-200 dark:hover:bg-amber-900 shrink-0"
          aria-label="Dismiss banner"
        >
          <X className="h-4 w-4" />
        </Button>
      </AlertDescription>
    </Alert>
  );
}
