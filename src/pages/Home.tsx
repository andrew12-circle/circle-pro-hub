import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Navbar } from "@/components/layout/Navbar";
import { HeroSection } from "@/components/home/HeroSection";
import { CategoryGrid } from "@/components/home/CategoryGrid";
import { FeaturedVendors } from "@/components/home/FeaturedVendors";

const Home = () => {
  const location = useLocation();

  useEffect(() => {
    if (location.state?.vendorId) {
      setTimeout(() => {
        const element = document.getElementById(`vendor-${location.state.vendorId}`);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 100);
    }
  }, [location]);

  return (
    <div className="min-h-screen">
      <Navbar />
      <main>
        <HeroSection />
        <CategoryGrid />
        <FeaturedVendors />
      </main>
    </div>
  );
};

export default Home;
