import { useState, useEffect } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ServiceDetailModal } from "@/components/home/ServiceDetailModal";
import { Star, CheckCircle2, Share2, Heart, Crown, HandshakeIcon, SlidersHorizontal, ChevronDown, ChevronUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { useSearchParams } from "react-router-dom";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
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
  const [adviceSectionOpen, setAdviceSectionOpen] = useState(true);
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get("search") || "";
  const [priceRange, setPriceRange] = useState([0, 500]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [minRating, setMinRating] = useState(0);
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [topRated, setTopRated] = useState(false);

  // Read category from URL params on mount
  useEffect(() => {
    const categoryParam = searchParams.get("category");
    if (categoryParam) {
      setSelectedCategory(categoryParam);
    }
  }, [searchParams]);

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
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      {/* Advice Engine Hero - Condensed & Collapsible */}
      <Collapsible open={adviceSectionOpen} onOpenChange={setAdviceSectionOpen}>
        <section className="w-full bg-gradient-to-b from-primary/5 to-background border-b">
          <div className="container px-4 py-4">
            <div className="max-w-4xl mx-auto">
              {/* Header with Toggle */}
              <div className="relative mb-4">
                <div className="flex items-center justify-center gap-2">
                  <h2 className="text-3xl md:text-5xl font-bold text-primary">
                    Need Advice?
                  </h2>
                  <Badge className="bg-yellow-400 text-black hover:bg-yellow-500 text-xs font-semibold">
                    BETA
                  </Badge>
                </div>
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" size="sm" className="absolute right-0 top-1/2 -translate-y-1/2 gap-2">
                    {adviceSectionOpen ? (
                      <>
                        <ChevronUp className="h-4 w-4" />
                        Collapse
                      </>
                    ) : (
                      <>
                        <ChevronDown className="h-4 w-4" />
                        Expand
                      </>
                    )}
                  </Button>
                </CollapsibleTrigger>
              </div>

              <CollapsibleContent className="space-y-4">
                <p className="text-sm text-muted-foreground max-w-2xl text-center mx-auto">
                  Built on real purchase data from top agents. Get clear choices you can trust.
                </p>

                {/* Search Input */}
                <div>
                  <div className="relative max-w-2xl mx-auto">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                    <input
                      type="text"
                      placeholder="Search or ask us anything..."
                      className="w-full pl-10 pr-20 py-3 text-sm rounded-full border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent shadow-sm"
                    />
                    <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                        </svg>
                      </Button>
                      <Button size="icon" className="h-8 w-8 rounded-full">
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                        </svg>
                      </Button>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground text-center mt-2">
                    Try: <span className="text-primary font-medium italic">best CRM for 20 deals a year</span>
                  </p>
                </div>

                {/* Category Icons - Compact */}
                <div className="flex flex-wrap items-center justify-center gap-6">
                  {[
                    { icon: "🏠", label: "CRM", color: "bg-blue-100" },
                    { icon: "📊", label: "Marketing", color: "bg-cyan-100" },
                    { icon: "✨", label: "Leads", color: "bg-pink-100" },
                    { icon: "🎓", label: "Schools", color: "bg-green-100" },
                    { icon: "⚡", label: "Licensing", color: "bg-orange-100" },
                    { icon: "👥", label: "Coaching", color: "bg-purple-100" },
                    { icon: "💛", label: "More", color: "bg-yellow-100" },
                  ].map((cat) => (
                    <button
                      key={cat.label}
                      className="flex flex-col items-center gap-2 hover:scale-105 transition-transform"
                    >
                      <div className={`h-16 w-16 rounded-full ${cat.color} flex items-center justify-center text-2xl`}>
                        {cat.icon}
                      </div>
                      <span className="text-xs font-medium text-center">{cat.label}</span>
                    </button>
                  ))}
                </div>

                {/* Bottom Actions - Compact */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3 text-center pb-4">
                  <Button variant="outline" size="sm" className="rounded-full text-xs">
                    <svg className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    Book Agent Concierge
                  </Button>
                  <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                    <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                    Powered by agent data
                  </p>
                </div>
              </CollapsibleContent>
            </div>
          </div>
        </section>
      </Collapsible>

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

      {/* Main Content */}
      <div className="py-8 bg-muted/30">
        <div className="container px-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {vendorCards}
          </div>
        </div>
      </div>

      <Footer />

      <ServiceDetailModal 
        open={!!selectedServiceId}
        onOpenChange={(open) => !open && setSelectedServiceId(null)}
        serviceId={selectedServiceId || ""}
      />
    </div>
  );
};

export default Marketplace;
