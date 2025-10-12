import { useState } from "react";
import { MapPin, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { useLocation } from "@/hooks/use-location";

export function LocationSelector() {
  const { location, detecting, updateLocation, refetchLocation } =
    useLocation();
  const [open, setOpen] = useState(false);
  const [manualCity, setManualCity] = useState("");

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualCity.trim()) {
      updateLocation({
        city: manualCity.trim(),
        state: "",
        formatted: manualCity.trim(),
      });
      setManualCity("");
      setOpen(false);
    }
  };

  const handleAutoDetect = async () => {
    await refetchLocation();
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="hidden lg:flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <MapPin className="h-4 w-4" />
          <span className="max-w-[150px] truncate">
            {detecting
              ? "Detecting..."
              : location?.formatted || "Set location"}
          </span>
          <ChevronDown className="h-3 w-3" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-72" align="start">
        <div className="space-y-4">
          <div>
            <h4 className="font-medium text-sm mb-1">Your Location</h4>
            <p className="text-xs text-muted-foreground">
              Find services available in your area
            </p>
          </div>

          <Button
            variant="outline"
            size="sm"
            className="w-full justify-start"
            onClick={handleAutoDetect}
            disabled={detecting}
          >
            <MapPin className="h-4 w-4 mr-2" />
            {detecting ? "Detecting..." : "Auto-detect my location"}
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-popover px-2 text-muted-foreground">Or</span>
            </div>
          </div>

          <form onSubmit={handleManualSubmit} className="space-y-2">
            <Input
              placeholder="Enter city name"
              value={manualCity}
              onChange={(e) => setManualCity(e.target.value)}
              className="text-sm"
            />
            <Button type="submit" size="sm" className="w-full">
              Set Location
            </Button>
          </form>
        </div>
      </PopoverContent>
    </Popover>
  );
}
