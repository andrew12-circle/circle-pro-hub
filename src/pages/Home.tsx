import { useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { HeroSection } from "@/components/home/HeroSection";
import { CategoryGrid } from "@/components/home/CategoryGrid";
import { FeaturedVendors } from "@/components/home/FeaturedVendors";
import { ServiceDetailModal } from "@/components/home/ServiceDetailModal";

const Home = () => {
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null);

  return (
    <div className="min-h-screen">
      <Navbar />
      <main>
        <HeroSection />
        <CategoryGrid featured />
        <FeaturedVendors onServiceClick={setSelectedServiceId} featured />
      </main>
      
      <ServiceDetailModal 
        open={!!selectedServiceId}
        onOpenChange={(open) => !open && setSelectedServiceId(null)}
        serviceId={selectedServiceId || ""}
      />
    </div>
  );
};

export default Home;
