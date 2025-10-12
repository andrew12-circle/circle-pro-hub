import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { 
  Camera, Mail, Home, FileText, Gift, Lock, 
  TrendingUp, Globe, BarChart3, Video, 
  Zap, DollarSign, Users, Headphones, Shield, Scale,
  Presentation
} from "lucide-react";

const categories = [
  // Traditional Categories
  { name: "Photography", icon: Camera, slug: "photography", color: "bg-purple-100 text-purple-600", count: 42 },
  { name: "Print & Mail", icon: Mail, slug: "print-mail", color: "bg-cyan-100 text-cyan-600", count: 18 },
  { name: "Signage & Branding", icon: FileText, slug: "signage", color: "bg-slate-100 text-slate-600", count: 15 },
  { name: "Open House", icon: Home, slug: "open-house", color: "bg-orange-100 text-orange-600", count: 12 },
  { name: "Client Gifting", icon: Gift, slug: "gifting", color: "bg-green-100 text-green-600", count: 24 },
  { name: "Lockboxes", icon: Lock, slug: "property-access", color: "bg-blue-100 text-blue-600", count: 8 },
  { name: "Presentations", icon: Presentation, slug: "presentations", color: "bg-purple-100 text-purple-600", count: 0 },
  
  // Digital-First Categories
  { name: "Website & SEO", icon: Globe, slug: "website-seo", color: "bg-cyan-100 text-cyan-600", count: 67 },
  { name: "Social Media", icon: TrendingUp, slug: "social-media", color: "bg-green-100 text-green-600", count: 89 },
  { name: "Lead Generation", icon: BarChart3, slug: "lead-gen", color: "bg-emerald-100 text-emerald-600", count: 45 },
  { name: "Video & Media", icon: Video, slug: "video-media", color: "bg-yellow-100 text-yellow-600", count: 34 },
  { name: "Automation", icon: Zap, slug: "automation", color: "bg-pink-100 text-pink-600", count: 52 },
  { name: "CRM & Database", icon: Users, slug: "crm", color: "bg-blue-100 text-blue-600", count: 28 },
  { name: "Transaction Tools", icon: FileText, slug: "transaction", color: "bg-orange-100 text-orange-600", count: 19 },
  { name: "Coaching", icon: Headphones, slug: "coaching", color: "bg-purple-100 text-purple-600", count: 31 },
  { name: "Finance & Ops", icon: DollarSign, slug: "finance", color: "bg-orange-100 text-orange-600", count: 22 },
  { name: "Compliance", icon: Shield, slug: "compliance", color: "bg-slate-100 text-slate-600", count: 14 },
  { name: "Insurance", icon: Scale, slug: "insurance", color: "bg-purple-100 text-purple-600", count: 11 },
];

interface CategoryGridProps {
  featured?: boolean;
  noContainer?: boolean;
}

export const CategoryGrid = ({ featured = false, noContainer = false }: CategoryGridProps) => {
  const displayCategories = featured 
    ? categories.slice(0, 8) // Top 8 categories for homepage
    : categories;

  const content = (
    <>
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">Browse by Category</h2>
        <p className="text-lg text-muted-foreground">Find exactly what you need for your business</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4 md:gap-6">
        {displayCategories.map((category) => (
          <Link
            key={category.slug}
            to={`/category/${category.slug}`}
            className="group"
          >
            <div className="relative overflow-hidden rounded-2xl border bg-card p-6 hover-lift hover-scale cursor-pointer">
              <div className={`inline-flex p-3 rounded-xl ${category.color} mb-4`}>
                <category.icon className="h-6 w-6" />
              </div>
              <h3 className="font-semibold text-sm">{category.name}</h3>
            </div>
          </Link>
        ))}
      </div>

      {featured && (
        <div className="text-center mt-8">
          <Link to="/marketplace">
            <button className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2">
              View All Categories
            </button>
          </Link>
        </div>
      )}
    </>
  );

  return (
    <section className="w-full py-16">
      {noContainer ? content : <div className="container px-4">{content}</div>}
    </section>
  );
};
