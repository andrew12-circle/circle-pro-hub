import { useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { CategoryGrid } from "@/components/home/CategoryGrid";
import { FeaturedVendors } from "@/components/home/FeaturedVendors";
import { ServiceDetailModal } from "@/components/home/ServiceDetailModal";
import { Search, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

const Marketplace = () => {
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [priceRange, setPriceRange] = useState([0, 500]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [minRating, setMinRating] = useState(0);
  const [verifiedOnly, setVerifiedOnly] = useState(false);

  return (
    <div className="min-h-screen">
      <Navbar />
      
      {/* Hero Section with Search */}
      <section className="w-full py-12 bg-gradient-to-b from-primary/5 to-background border-b">
        <div className="container px-4">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <h1 className="text-3xl md:text-4xl font-bold">
              Complete Marketplace
            </h1>
            <p className="text-lg text-muted-foreground">
              Browse all services, vendors, and exclusive deals
            </p>
            
            {/* Search Bar */}
            <div className="relative max-w-2xl mx-auto">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search for services, vendors, categories..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 pr-4 py-6 text-lg rounded-xl"
              />
            </div>
          </div>
        </div>
      </section>

      <div className="w-full">
        <div className="max-w-screen-2xl mx-auto px-4 lg:px-8 py-8">
          <div className="flex gap-12">
            {/* Mobile Filter Button */}
            <div className="lg:hidden fixed bottom-4 right-4 z-40">
              <Sheet>
                <SheetTrigger asChild>
                  <Button size="lg" className="rounded-full shadow-lg">
                    <SlidersHorizontal className="h-5 w-5 mr-2" />
                    Filters
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-80 overflow-y-auto">
                  <SheetHeader>
                    <SheetTitle>Filters</SheetTitle>
                    <SheetDescription>
                      Refine your search results
                    </SheetDescription>
                  </SheetHeader>
                  <FilterContent
                    priceRange={priceRange}
                    setPriceRange={setPriceRange}
                    minRating={minRating}
                    setMinRating={setMinRating}
                    verifiedOnly={verifiedOnly}
                    setVerifiedOnly={setVerifiedOnly}
                  />
                </SheetContent>
              </Sheet>
            </div>

            {/* Desktop Sidebar Filter */}
            <aside className="hidden lg:block w-72 flex-shrink-0">
              <div className="sticky top-20 space-y-6">
                <div>
                  <h3 className="font-semibold text-lg mb-4">Filters</h3>
                  <FilterContent
                    priceRange={priceRange}
                    setPriceRange={setPriceRange}
                    minRating={minRating}
                    setMinRating={setMinRating}
                    verifiedOnly={verifiedOnly}
                    setVerifiedOnly={setVerifiedOnly}
                  />
                </div>
              </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 min-w-0 space-y-16">
              <CategoryGrid />
              <FeaturedVendors onServiceClick={setSelectedServiceId} />
            </main>
          </div>
        </div>
      </div>

      <ServiceDetailModal 
        open={!!selectedServiceId}
        onOpenChange={(open) => !open && setSelectedServiceId(null)}
        serviceId={selectedServiceId || ""}
      />
    </div>
  );
};

// Filter Content Component (reusable for both mobile and desktop)
const FilterContent = ({
  priceRange,
  setPriceRange,
  minRating,
  setMinRating,
  verifiedOnly,
  setVerifiedOnly,
}: {
  priceRange: number[];
  setPriceRange: (value: number[]) => void;
  minRating: number;
  setMinRating: (value: number) => void;
  verifiedOnly: boolean;
  setVerifiedOnly: (value: boolean) => void;
}) => {
  return (
    <div className="space-y-6">
      {/* Price Range */}
      <div className="space-y-3">
        <Label className="text-sm font-medium">Price Range</Label>
        <div className="space-y-2">
          <Slider
            value={priceRange}
            onValueChange={setPriceRange}
            max={500}
            step={10}
            className="w-full"
          />
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>${priceRange[0]}</span>
            <span>${priceRange[1]}</span>
          </div>
        </div>
      </div>

      {/* Rating Filter */}
      <div className="space-y-3">
        <Label className="text-sm font-medium">Minimum Rating</Label>
        <div className="space-y-2">
          {[4.5, 4.0, 3.5, 3.0].map((rating) => (
            <div key={rating} className="flex items-center space-x-2">
              <Checkbox
                id={`rating-${rating}`}
                checked={minRating === rating}
                onCheckedChange={(checked) => {
                  setMinRating(checked ? rating : 0);
                }}
              />
              <Label
                htmlFor={`rating-${rating}`}
                className="text-sm cursor-pointer"
              >
                {rating}+ stars
              </Label>
            </div>
          ))}
        </div>
      </div>

      {/* Verified Only */}
      <div className="space-y-3">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="verified"
            checked={verifiedOnly}
            onCheckedChange={(checked) => setVerifiedOnly(checked as boolean)}
          />
          <Label htmlFor="verified" className="text-sm cursor-pointer">
            Verified vendors only
          </Label>
        </div>
      </div>

      {/* Reset Filters */}
      <Button
        variant="outline"
        className="w-full"
        onClick={() => {
          setPriceRange([0, 500]);
          setMinRating(0);
          setVerifiedOnly(false);
        }}
      >
        Reset Filters
      </Button>
    </div>
  );
};

export default Marketplace;
