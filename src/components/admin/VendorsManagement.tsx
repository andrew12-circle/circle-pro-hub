import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Building2, MapPin, TrendingUp } from "lucide-react";

export function VendorsManagement() {
  const { toast } = useToast();
  const [sampleCity, setSampleCity] = useState("Austin");
  const [sampleDealsPerYear, setSampleDealsPerYear] = useState(50);

  const handlePreviewEligibility = () => {
    toast({
      title: "Eligibility Preview",
      description: `Sample agent in ${sampleCity} with ${sampleDealsPerYear} deals/year`,
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Vendors Management</CardTitle>
        <CardDescription>Edit vendor rules, intake, and preview eligibility</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <h3 className="text-sm font-semibold">Vendor Rules</h3>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label>Minimum Deals/Year</Label>
              <Input type="number" defaultValue={25} />
            </div>
            <div>
              <Label>Verification Required</Label>
              <Input type="checkbox" className="mt-2" />
            </div>
          </div>
        </div>

        <div className="border-t pt-6 space-y-4">
          <h3 className="text-sm font-semibold flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            Eligibility Preview Panel
          </h3>
          <p className="text-sm text-muted-foreground">
            Test eligibility rules with sample agent profiles
          </p>
          
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="sample-city" className="flex items-center gap-2">
                <MapPin className="h-3 w-3" />
                Sample City
              </Label>
              <Input
                id="sample-city"
                value={sampleCity}
                onChange={(e) => setSampleCity(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="sample-deals" className="flex items-center gap-2">
                <TrendingUp className="h-3 w-3" />
                Deals Per Year
              </Label>
              <Input
                id="sample-deals"
                type="number"
                value={sampleDealsPerYear}
                onChange={(e) => setSampleDealsPerYear(Number(e.target.value))}
              />
            </div>
          </div>

          <Button onClick={handlePreviewEligibility} className="w-full">
            Preview Eligible Services
          </Button>

          <div className="mt-4 p-4 bg-muted rounded-lg">
            <p className="text-xs text-muted-foreground mb-2">Preview Results:</p>
            <div className="flex flex-wrap gap-2">
              <Badge>Home Inspection</Badge>
              <Badge>Pest Control</Badge>
              <Badge>Title Services</Badge>
              <Badge variant="secondary">Photography (Not Eligible)</Badge>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
