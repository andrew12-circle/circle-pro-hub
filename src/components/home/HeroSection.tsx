import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";

export const HeroSection = () => {
  return (
    <section className="w-full py-16 md:py-24 bg-gradient-to-b from-primary/5 to-background">
      <div className="container px-4">
        <div className="max-w-3xl mx-auto text-center space-y-8">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
            Find the perfect service for your{" "}
            <span className="text-primary">real estate business</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Connect with verified vendors, access exclusive Pro pricing, and grow your business with Circle Marketplace
          </p>
          
          {/* Hero Search */}
          <div className="max-w-2xl mx-auto">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <input
                type="search"
                placeholder="Search for photography, marketing, staging, and more..."
                className="w-full pl-12 pr-4 py-4 text-lg rounded-2xl border-2 border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent shadow-lg"
              />
            </div>
          </div>

          {/* Popular Searches */}
          <div className="flex flex-wrap items-center justify-center gap-2">
            <span className="text-sm text-muted-foreground">Popular:</span>
            {["Photography", "Virtual Staging", "Social Media", "SEO", "Video Tours"].map((term) => (
              <Button key={term} variant="outline" size="sm" className="rounded-full">
                {term}
              </Button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
