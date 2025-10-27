import { useState, useEffect } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { HeroSection } from "@/components/home/HeroSection";
import { CategoryGrid } from "@/components/home/CategoryGrid";
import { PromotedRail } from "@/components/home/PromotedRail";
import { ServiceDetailModal } from "@/components/home/ServiceDetailModal";
import { getPromotedCards } from "@/data/marketplaceApi";
import type { PromotedCard } from "@/types/marketplace";

const Home = () => {
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null);
  const [promotedCards, setPromotedCards] = useState<PromotedCard[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadPromotedCards = async () => {
      try {
        setIsLoading(true);
        const data = await getPromotedCards();
        setPromotedCards(data);
      } catch (error) {
        console.error('Failed to load promoted cards:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadPromotedCards();
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <HeroSection />
        <CategoryGrid />
        {!isLoading && promotedCards.length > 0 && (
          <PromotedRail cards={promotedCards} />
        )}
      </main>
      <Footer />
      
      <ServiceDetailModal 
        open={!!selectedServiceId}
        onOpenChange={(open) => !open && setSelectedServiceId(null)}
        serviceId={selectedServiceId || ""}
      />
    </div>
  );
};

export default Home;
