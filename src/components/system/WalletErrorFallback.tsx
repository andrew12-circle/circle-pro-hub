import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle } from "lucide-react";
import { Link } from "react-router-dom";

/**
 * Fallback UI for Wallet feature errors
 * Prevents the entire app from crashing if Points/Wallet fails
 */
export function WalletErrorFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <Card className="max-w-md w-full">
        <CardHeader>
          <div className="flex items-center gap-2 text-warning mb-2">
            <AlertTriangle className="h-6 w-6" />
            <CardTitle>Wallet Temporarily Unavailable</CardTitle>
          </div>
          <CardDescription>
            We're having trouble loading your wallet. Your points are safe, and you can still browse and purchase services.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Try refreshing the page, or continue shopping with standard payment methods.
          </p>
          <div className="flex gap-2">
            <Button asChild variant="default" className="flex-1">
              <Link to="/marketplace">Browse Services</Link>
            </Button>
            <Button onClick={() => window.location.reload()} variant="outline">
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
