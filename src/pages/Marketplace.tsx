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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

const Marketplace = () => {
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [priceRange, setPriceRange] = useState([0, 500]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [minRating, setMinRating] = useState(0);
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [topRated, setTopRated] = useState(false);

  const resetFilters = () => {
    setSelectedCategory("all");
    setPriceRange([0, 500]);
    setMinRating(0);
    setVerifiedOnly(false);
    setTopRated(false);
  };

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

      {/* Horizontal Sticky Filter Bar */}
      <div className="sticky top-[64px] z-30 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 border-b">
        <div className="w-full px-4 lg:px-8 py-4">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-sm font-medium text-muted-foreground">Filters:</span>
            
            {/* Category Dropdown */}
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="photography">Photography</SelectItem>
                <SelectItem value="social-media">Social Media</SelectItem>
                <SelectItem value="website-seo">Website & SEO</SelectItem>
                <SelectItem value="video">Video Production</SelectItem>
                <SelectItem value="staging">Virtual Staging</SelectItem>
              </SelectContent>
            </Select>
            
            {/* Quick Toggles */}
            <div className="flex items-center gap-2">
              <Checkbox 
                id="verified-filter" 
                checked={verifiedOnly} 
                onCheckedChange={(checked) => setVerifiedOnly(checked as boolean)}
              />
              <Label htmlFor="verified-filter" className="text-sm cursor-pointer">
                Verified only
              </Label>
            </div>
            
            <div className="flex items-center gap-2">
              <Checkbox 
                id="top-rated" 
                checked={topRated} 
                onCheckedChange={(checked) => setTopRated(checked as boolean)}
              />
              <Label htmlFor="top-rated" className="text-sm cursor-pointer">
                Top rated (4.5+)
              </Label>
            </div>
            
            {/* More Filters Popover */}
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm">
                  <SlidersHorizontal className="h-4 w-4 mr-2" />
                  More Filters
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80" align="start">
                <div className="space-y-6">
                  <div>
                    <h4 className="font-medium mb-4">Price Range</h4>
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
                  
                  <div>
                    <h4 className="font-medium mb-3">Minimum Rating</h4>
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
                </div>
              </PopoverContent>
            </Popover>
            
            {/* Reset Button */}
            <Button variant="ghost" size="sm" onClick={resetFilters}>
              Reset
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content - Full Width */}
      <div className="w-full px-4 lg:px-8 py-8">
        <main className="space-y-16">
          <div>
            <CategoryGrid noContainer />
          </div>
          <div>
            <FeaturedVendors onServiceClick={setSelectedServiceId} noContainer />
          </div>
        </main>
      </div>

      <ServiceDetailModal 
        open={!!selectedServiceId}
        onOpenChange={(open) => !open && setSelectedServiceId(null)}
        serviceId={selectedServiceId || ""}
      />
    </div>
  );
};

export default Marketplace;
