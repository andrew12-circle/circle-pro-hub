import { useState, useEffect } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ServiceDetailModal } from "@/components/home/ServiceDetailModal";
import { SlidersHorizontal, ChevronDown, ChevronUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import type { User } from "@supabase/supabase-js";
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
import { MarketplaceGrid } from "@/components/marketplace/MarketplaceGrid";
import { getMarketplaceCards } from "@/data/marketplaceApi";
import type { ServiceCard } from "@/types/marketplace";
const Marketplace = () => {
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null);
  const [services, setServices] = useState<ServiceCard[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [adviceSectionOpen, setAdviceSectionOpen] = useState(true);
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get("search") || "";
  const [priceRange, setPriceRange] = useState([0, 10000]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [minRating, setMinRating] = useState(0);
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [topRated, setTopRated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isPro, setIsPro] = useState(false);

  // Check authentication state and pro status
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Fetch user's pro status
  useEffect(() => {
    if (user) {
      const fetchProStatus = async () => {
        const { data: roleData } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id)
          .eq('role', 'pro')
          .maybeSingle();

        setIsPro(!!roleData);
      };

      fetchProStatus();
    } else {
      setIsPro(false);
    }
  }, [user]);

  // Load services from database
  useEffect(() => {
    const loadServices = async () => {
      try {
        setIsLoading(true);
        const data = await getMarketplaceCards();
        setServices(data);
      } catch (error) {
        console.error('Failed to load services:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadServices();
  }, []);

  // Read category from URL params on mount
  useEffect(() => {
    const categoryParam = searchParams.get("category");
    if (categoryParam) {
      setSelectedCategory(categoryParam);
    }
  }, [searchParams]);

  const resetFilters = () => {
    setSelectedCategory("all");
    setPriceRange([0, 10000]);
    setMinRating(0);
    setVerifiedOnly(false);
    setTopRated(false);
  };

  const filteredServices = services.filter((service) => {
    const price = service.pricing.retail.amount;
    const matchesPrice = price >= priceRange[0] && price <= priceRange[1];
    const matchesCategory = selectedCategory === "all" || service.category === selectedCategory;
    const matchesRating = service.rating >= minRating;
    
    return matchesPrice && matchesCategory && matchesRating;
  });


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
                        <span className="hidden sm:inline">Collapse</span>
                      </>
                    ) : (
                      <>
                        <ChevronDown className="h-4 w-4" />
                        <span className="hidden sm:inline">Expand</span>
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
                <div className="hidden md:flex flex-wrap items-center justify-center gap-6">
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
        <div className="w-full px-4 lg:px-8 py-2 md:py-4">
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-muted-foreground hidden md:inline">Filters:</span>
            
            {/* Mobile: Dropdown + More button in same row */}
            <div className="flex items-center gap-2 flex-1 md:flex-initial">
              {/* Category Dropdown */}
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-full md:w-[200px]">
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
              
              {/* More Filters Popover - Mobile position */}
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm" className="md:hidden">
                    <SlidersHorizontal className="h-4 w-4" />
                    <span className="ml-2">More</span>
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80" align="end">
                  <div className="space-y-6">
                    {/* Mobile-only Quick Toggles */}
                    <div className="space-y-3 pb-6 border-b">
                      <div className="flex items-center gap-2">
                        <Checkbox 
                          id="verified-filter-mobile" 
                          checked={verifiedOnly} 
                          onCheckedChange={(checked) => setVerifiedOnly(checked as boolean)}
                        />
                        <Label htmlFor="verified-filter-mobile" className="text-sm cursor-pointer">
                          Verified only
                        </Label>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Checkbox 
                          id="top-rated-mobile" 
                          checked={topRated} 
                          onCheckedChange={(checked) => setTopRated(checked as boolean)}
                        />
                        <Label htmlFor="top-rated-mobile" className="text-sm cursor-pointer">
                          Top rated (4.5+)
                        </Label>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium mb-4">Price Range</h4>
                      <div className="space-y-2">
                <Slider
                  value={priceRange}
                  onValueChange={setPriceRange}
                  max={10000}
                  step={100}
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
                              id={`rating-${rating}-mobile`}
                              checked={minRating === rating}
                              onCheckedChange={(checked) => {
                                setMinRating(checked ? rating : 0);
                              }}
                            />
                            <Label
                              htmlFor={`rating-${rating}-mobile`}
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
            </div>
            
            {/* Desktop Quick Toggles */}
            <div className="hidden md:flex items-center gap-2">
              <Checkbox 
                id="verified-filter" 
                checked={verifiedOnly} 
                onCheckedChange={(checked) => setVerifiedOnly(checked as boolean)}
              />
              <Label htmlFor="verified-filter" className="text-sm cursor-pointer">
                Verified only
              </Label>
            </div>
            
            <div className="hidden md:flex items-center gap-2">
              <Checkbox 
                id="top-rated" 
                checked={topRated} 
                onCheckedChange={(checked) => setTopRated(checked as boolean)}
              />
              <Label htmlFor="top-rated" className="text-sm cursor-pointer">
                Top rated (4.5+)
              </Label>
            </div>
            
            {/* More Filters Popover - Desktop */}
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="hidden md:flex">
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
          {isLoading ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Loading services...</p>
            </div>
          ) : (
            <MarketplaceGrid services={filteredServices} />
          )}
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
