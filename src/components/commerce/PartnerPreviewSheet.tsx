import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Shield, Star, CheckCircle2, MapPin } from "lucide-react";
import { VendorPartner } from "../../../contracts/affiliates/partner";

interface PartnerPreviewSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  partner: VendorPartner | null;
  onConfirm: (partnerId: string) => void;
}

export function PartnerPreviewSheet({
  open,
  onOpenChange,
  partner,
  onConfirm,
}: PartnerPreviewSheetProps) {
  if (!partner) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader className="space-y-4">
          <div className="flex items-start gap-4">
            <img
              src={partner.logo}
              alt={partner.name}
              className="w-16 h-16 rounded-lg object-cover"
            />
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <SheetTitle className="text-xl">{partner.name}</SheetTitle>
                {partner.verified && (
                  <Badge variant="secondary" className="gap-1">
                    <Shield className="h-3 w-3" />
                    Verified
                  </Badge>
                )}
              </div>
              {partner.rating && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-semibold">{partner.rating}</span>
                  </div>
                  {partner.reviews && <span>({partner.reviews} reviews)</span>}
                </div>
              )}
            </div>
          </div>
          <SheetDescription className="text-left">
            {partner.description}
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-6 mt-6">
          {/* Markets */}
          <div>
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <MapPin className="h-4 w-4 text-primary" />
              Available Markets
            </h3>
            <div className="flex flex-wrap gap-2">
              {partner.markets.map((market) => (
                <Badge key={market} variant="outline">
                  {market}
                </Badge>
              ))}
            </div>
          </div>

          <Separator />

          {/* Benefits */}
          <div>
            <h3 className="font-semibold mb-3">Program Benefits</h3>
            <ul className="space-y-2">
              {partner.benefits.map((benefit, idx) => (
                <li key={idx} className="flex items-start gap-2 text-sm">
                  <CheckCircle2 className="h-4 w-4 text-success mt-0.5 flex-shrink-0" />
                  <span>{benefit}</span>
                </li>
              ))}
            </ul>
          </div>

          <Separator />

          {/* Eligibility */}
          <div>
            <h3 className="font-semibold mb-3">Eligibility Requirements</h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-success" />
                <span>
                  Minimum {partner.copayEligibility.minAgentDealsPerYear} deals per year
                </span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-success" />
                <span>Active in eligible markets</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 pt-6 border-t">
          <Button
            size="lg"
            className="w-full"
            onClick={() => {
              onConfirm(partner.id);
              onOpenChange(false);
            }}
          >
            Select This Partner
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
