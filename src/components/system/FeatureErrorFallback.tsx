import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle } from "lucide-react";
import { Link } from "react-router-dom";

interface FeatureErrorFallbackProps {
  featureName: string;
  description?: string;
}

/**
 * Generic fallback UI for feature errors
 * Prevents app crash when any optional feature fails
 */
export function FeatureErrorFallback({ 
  featureName, 
  description = "We're experiencing technical difficulties with this feature."
}: FeatureErrorFallbackProps) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <Card className="max-w-md w-full">
        <CardHeader>
          <div className="flex items-center gap-2 text-warning mb-2">
            <AlertTriangle className="h-6 w-6" />
            <CardTitle>{featureName} Unavailable</CardTitle>
          </div>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            You can continue using other features of the app. This issue has been logged.
          </p>
          <div className="flex gap-2">
            <Button asChild variant="default" className="flex-1">
              <Link to="/">Go Home</Link>
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
