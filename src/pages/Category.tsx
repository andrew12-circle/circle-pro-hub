import { useParams, Link } from "react-router-dom";
import { Navbar } from "@/components/layout/Navbar";
import { FeaturedVendors } from "@/components/home/FeaturedVendors";
import { ServiceDetailModal } from "@/components/home/ServiceDetailModal";
import { useState } from "react";
import { ChevronRight, Home } from "lucide-react";
import { 
  Camera, Mail, FileText, Gift, Lock, 
  TrendingUp, Globe, BarChart3, Video, 
  Zap, DollarSign, Users, Headphones, Shield, Scale,
  Presentation, Home as HouseIcon
} from "lucide-react";

const categoryData: Record<string, {
  name: string;
  icon: any;
  description: string;
  color: string;
}> = {
  "photography": { name: "Photography", icon: Camera, description: "Professional real estate photography services", color: "bg-purple-100 text-purple-600" },
  "print-mail": { name: "Print & Mail", icon: Mail, description: "Direct mail and print marketing solutions", color: "bg-cyan-100 text-cyan-600" },
  "signage": { name: "Signage & Branding", icon: FileText, description: "Custom signage and branding materials", color: "bg-slate-100 text-slate-600" },
  "open-house": { name: "Open House", icon: HouseIcon, description: "Open house supplies and services", color: "bg-orange-100 text-orange-600" },
  "gifting": { name: "Client Gifting", icon: Gift, description: "Thoughtful client appreciation gifts", color: "bg-green-100 text-green-600" },
  "property-access": { name: "Lockboxes", icon: Lock, description: "Secure property access solutions", color: "bg-blue-100 text-blue-600" },
  "presentations": { name: "Presentations", icon: Presentation, description: "Professional listing presentations", color: "bg-purple-100 text-purple-600" },
  "website-seo": { name: "Website & SEO", icon: Globe, description: "Web design and search optimization", color: "bg-cyan-100 text-cyan-600" },
  "social-media": { name: "Social Media", icon: TrendingUp, description: "Social media management and content", color: "bg-green-100 text-green-600" },
  "lead-gen": { name: "Lead Generation", icon: BarChart3, description: "Lead generation and nurturing", color: "bg-emerald-100 text-emerald-600" },
  "video-media": { name: "Video & Media", icon: Video, description: "Video production and media services", color: "bg-yellow-100 text-yellow-600" },
  "automation": { name: "Automation", icon: Zap, description: "Marketing and workflow automation", color: "bg-pink-100 text-pink-600" },
  "crm": { name: "CRM & Database", icon: Users, description: "Contact management systems", color: "bg-blue-100 text-blue-600" },
  "transaction": { name: "Transaction Tools", icon: FileText, description: "Transaction management software", color: "bg-orange-100 text-orange-600" },
  "coaching": { name: "Coaching", icon: Headphones, description: "Real estate coaching and training", color: "bg-purple-100 text-purple-600" },
  "finance": { name: "Finance & Ops", icon: DollarSign, description: "Financial and operational tools", color: "bg-orange-100 text-orange-600" },
  "compliance": { name: "Compliance", icon: Shield, description: "Legal compliance solutions", color: "bg-slate-100 text-slate-600" },
  "insurance": { name: "Insurance", icon: Scale, description: "Professional insurance services", color: "bg-purple-100 text-purple-600" },
};

const Category = () => {
  const { slug } = useParams<{ slug: string }>();
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null);
  
  const category = slug ? categoryData[slug] : null;
  const CategoryIcon = category?.icon;

  if (!category) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="container px-4 py-16 text-center">
          <h1 className="text-3xl font-bold mb-4">Category Not Found</h1>
          <p className="text-muted-foreground mb-8">The category you're looking for doesn't exist.</p>
          <Link to="/marketplace" className="text-primary hover:underline">
            Return to Marketplace
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      
      {/* Breadcrumbs */}
      <div className="border-b bg-muted/30">
        <div className="container px-4 py-4">
          <nav className="flex items-center space-x-2 text-sm">
            <Link to="/" className="text-muted-foreground hover:text-foreground flex items-center">
              <Home className="h-4 w-4" />
            </Link>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
            <Link to="/marketplace" className="text-muted-foreground hover:text-foreground">
              Marketplace
            </Link>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
            <span className="text-foreground font-medium">{category.name}</span>
          </nav>
        </div>
      </div>

      {/* Category Hero */}
      <section className="w-full py-12 bg-gradient-to-b from-primary/5 to-background">
        <div className="container px-4">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <div className={`inline-flex p-4 rounded-2xl ${category.color} mb-4`}>
              {CategoryIcon && <CategoryIcon className="h-12 w-12" />}
            </div>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold">
              {category.name}
            </h1>
            <p className="text-lg text-muted-foreground">
              {category.description}
            </p>
          </div>
        </div>
      </section>

      {/* Vendors in this Category */}
      <div className="container px-4 py-8">
        <div className="mb-8">
          <Link to="/marketplace">
            <button className="text-sm text-muted-foreground hover:text-foreground">
              ← Back to Marketplace
            </button>
          </Link>
        </div>

        <FeaturedVendors onServiceClick={setSelectedServiceId} />
      </div>

      <ServiceDetailModal 
        open={!!selectedServiceId}
        onOpenChange={(open) => !open && setSelectedServiceId(null)}
        serviceId={selectedServiceId || ""}
      />
    </div>
  );
};

export default Category;
