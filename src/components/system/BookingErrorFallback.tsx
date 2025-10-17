import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle } from "lucide-react";
import { Link } from "react-router-dom";

/**
 * Fallback UI for Booking feature errors
 * Prevents app crash when booking system fails
 */
export function BookingErrorFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <Card className="max-w-md w-full">
        <CardHeader>
          <div className="flex items-center gap-2 text-warning mb-2">
            <AlertTriangle className="h-6 w-6" />
            <CardTitle>Booking System Unavailable</CardTitle>
          </div>
          <CardDescription>
            We're experiencing technical difficulties with the booking system. Your data is safe.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Please try again in a few moments, or contact support if the issue persists.
          </p>
          <div className="flex gap-2">
            <Button asChild variant="default" className="flex-1">
              <Link to="/marketplace">Browse Services</Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/support">Contact Support</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
