import { useState, useEffect } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { ServiceDetailModal } from "@/components/home/ServiceDetailModal";
import { Star, CheckCircle2, Share2, Heart, Crown, HandshakeIcon, SlidersHorizontal } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { useSearchParams } from "react-router-dom";
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

// Vendor data
const vendors = [
  {
    id: 1,
    name: "Premium Real Estate Photos",
    vendor: "Pro Photography Studio",
    avatar: "📷",
    logo: "PP",
    tagline: "Real Agents. Real Results. This isn't theory. Thousands of agents just like you trust us for professional HDR photography that sells homes 40% faster.",
    rating: 4.9,
    reviews: 847,
    retailPrice: 149,
    proPrice: 119,
    proDiscount: 20,
    copayPrice: 75,
    copayWithVendor: 75,
    copayNonSettlement: 75,
    verified: true,
    discount: "20% OFF",
    reviewHighlight: "These photos made my listing look like a million bucks! Sold in 3 days."
  },
  {
    id: 2,
    name: "Social Media Mastery",
    vendor: "Digital Marketing Pro",
    avatar: "📱",
    logo: "SM",
    tagline: "Daily content creation for busy agents. Stop posting sporadically and start building a brand that attracts leads on autopilot.",
    rating: 4.8,
    reviews: 623,
    retailPrice: 299,
    proPrice: 239,
    proDiscount: 20,
    copayPrice: 150,
    copayWithVendor: 150,
    copayNonSettlement: 150,
    verified: true,
    discount: "20% OFF",
    reviewHighlight: "My engagement tripled in the first month. Worth every penny!"
  },
  {
    id: 3,
    name: "Virtual Staging Pro",
    vendor: "Staging Experts",
    avatar: "🏠",
    logo: "VS",
    tagline: "Transform empty rooms into dream homes. Professional virtual staging that helps buyers visualize the lifestyle, not just the space.",
    rating: 5.0,
    reviews: 412,
    retailPrice: 39,
    proPrice: 35,
    proDiscount: 10,
    copayPrice: 20,
    copayWithVendor: 20,
    copayNonSettlement: 20,
    verified: true,
    discount: "10% OFF",
    reviewHighlight: "Incredible quality and fast turnaround. Helps vacant homes sell faster."
  },
  {
    id: 4,
    name: "SEO & Lead Generation",
    vendor: "Growth Hackers Inc",
    avatar: "🎯",
    logo: "GH",
    tagline: "Get ranked #1 in your local market. Our proven SEO system gets you found by buyers and sellers actively searching right now.",
    rating: 4.7,
    reviews: 534,
    retailPrice: 499,
    proPrice: 399,
    proDiscount: 20,
    copayPrice: 250,
    copayWithVendor: 250,
    copayNonSettlement: 250,
    verified: true,
    discount: "20% OFF",
    reviewHighlight: "Went from page 3 to #1 on Google in 60 days. Leads are pouring in!"
  },
];

const Marketplace = () => {
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null);
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get("search") || "";
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

  // Vendor cards
  const vendorCards = vendors.map((vendor) => (
    <div key={vendor.id} className="group">
      <div className="bg-card rounded-2xl border overflow-hidden hover-lift">
        {/* Header */}
        <div className="p-4 border-b flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center text-xl">
              {vendor.avatar}
            </div>
            <div>
              <div className="font-semibold text-sm">{vendor.vendor}</div>
              <div className="flex items-center gap-1 text-xs">
                <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                <span className="font-semibold">{vendor.rating}</span>
                <span className="text-muted-foreground">({vendor.reviews})</span>
              </div>
            </div>
          </div>
          <div className="flex gap-1">
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Share2 className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Heart className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Description */}
        <div className="p-4 border-b">
          <p className="text-sm text-muted-foreground line-clamp-3 mb-2">
            🔥 {vendor.tagline}
          </p>
          <button 
            onClick={() => setSelectedServiceId(vendor.id.toString())}
            className="text-sm text-primary hover:underline font-medium"
          >
            See more
          </button>
        </div>

        {/* Logo */}
        <div className="aspect-[4/3] bg-gradient-to-br from-background to-muted/30 flex items-center justify-center border-b">
          <div className="text-center">
            <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-2">
              <span className="text-2xl font-bold text-primary">{vendor.logo}</span>
            </div>
            <div className="text-lg font-bold">{vendor.name}</div>
          </div>
        </div>

        {/* Reviews Highlight */}
        <div className="p-4 bg-muted/30 border-b">
          <div className="flex gap-1 mb-2">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`h-4 w-4 ${
                  i < Math.floor(vendor.rating)
                    ? "fill-yellow-400 text-yellow-400"
                    : "text-muted-foreground/30"
                }`}
              />
            ))}
          </div>
          <p className="text-sm italic text-muted-foreground">
            "{vendor.reviewHighlight}"
          </p>
          <button 
            onClick={() => setSelectedServiceId(vendor.id.toString())}
            className="text-xs text-primary hover:underline font-medium mt-1 inline-block"
          >
            Read {vendor.reviews} reviews →
          </button>
        </div>

        {/* Pricing */}
        <div className="p-4 space-y-3">
          {/* Retail Price */}
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Retail Price:</span>
            <span className="font-bold text-lg">${vendor.retailPrice}/mo</span>
          </div>

          {/* Pro Price */}
          <div className="flex items-center justify-between p-2 bg-primary/5 rounded-lg border border-primary/20">
            <div className="flex items-center gap-1 text-sm">
              <Crown className="h-4 w-4 text-primary" />
              <span className="font-medium text-primary">Unlock Pro Price</span>
            </div>
            <span className="font-bold text-lg text-primary">${vendor.proPrice}/mo</span>
          </div>

          {/* Co-pay Section */}
          <div className="p-3 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800 space-y-2">
            <div className="flex items-center gap-1 text-sm font-medium text-green-700 dark:text-green-400">
              <HandshakeIcon className="h-4 w-4" />
              <span>Unlock Co-Pay</span>
            </div>
            <p className="text-xs text-green-600 dark:text-green-500">
              We have vendors lined up: Lender's, Title, HOI, Warranty, Moving Etc. click quick apply waiting to help reduce your bill
            </p>
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-green-700 dark:text-green-400">With Vendor Help:</span>
                <span className="font-bold text-green-700 dark:text-green-400">${vendor.copayWithVendor}/mo</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-green-700 dark:text-green-400">Non Settlement Service Provider:</span>
                <span className="font-bold text-green-700 dark:text-green-400">${vendor.copayNonSettlement}/mo</span>
              </div>
            </div>
          </div>

          {/* Discount Badge */}
          {vendor.discount && (
            <div className="flex justify-center">
              <Badge className="bg-red-500 text-white hover:bg-red-600">
                {vendor.discount}
              </Badge>
            </div>
          )}

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-2 pt-2">
            <Button variant="outline" size="sm">
              Add
            </Button>
            <Button 
              size="sm"
              onClick={() => setSelectedServiceId(vendor.id.toString())}
            >
              Learn more
            </Button>
          </div>

          {/* Guarantee Text */}
          <p className="text-[10px] text-muted-foreground leading-tight pt-2">
            <span className="font-semibold">Pro Savings Guarantee.</span> If your first month Pro credits and coverage do not equal or exceed your membership fee we credit the difference as marketplace credit.
          </p>
        </div>
      </div>
    </div>
  ));

  return (
    <div className="min-h-screen">
      <Navbar />
      
      {/* Hero Section */}
      <section className="w-full py-16 md:py-24 bg-background border-b">
        <div className="container px-4">
          <div className="max-w-4xl">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-4">
              Find proven services. Buy outcomes, not tools.
            </h1>
            <p className="text-xl text-muted-foreground">
              Pro members save 10–40% on select listings
            </p>
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
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="photography">Photography</SelectItem>
                <SelectItem value="print-mail">Print & Mail</SelectItem>
                <SelectItem value="signage">Signage & Branding</SelectItem>
                <SelectItem value="open-house">Open House</SelectItem>
                <SelectItem value="gifting">Client Gifting</SelectItem>
                <SelectItem value="property-access">Lockboxes</SelectItem>
                <SelectItem value="presentations">Presentations</SelectItem>
                <SelectItem value="website-seo">Website & SEO</SelectItem>
                <SelectItem value="social-media">Social Media</SelectItem>
                <SelectItem value="lead-gen">Lead Generation</SelectItem>
                <SelectItem value="video-media">Video & Media</SelectItem>
                <SelectItem value="automation">Automation</SelectItem>
                <SelectItem value="crm">CRM & Database</SelectItem>
                <SelectItem value="transaction">Transaction Tools</SelectItem>
                <SelectItem value="coaching">Coaching</SelectItem>
                <SelectItem value="finance">Finance & Ops</SelectItem>
                <SelectItem value="compliance">Compliance</SelectItem>
                <SelectItem value="insurance">Insurance</SelectItem>
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
      <div className="w-full px-4 lg:px-8 py-8 bg-muted/30">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {vendorCards}
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

export default Marketplace;
