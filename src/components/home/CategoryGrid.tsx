import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { 
  Camera, Mail, Home, FileText, Gift, Lock, 
  TrendingUp, Globe, BarChart3, Video, 
  Zap, DollarSign, Users, Headphones, Shield, Scale
} from "lucide-react";

const categoryGroups = [
  {
    title: "Traditional (Relationship Builders)",
    description: "Classic marketing and relationship-building essentials",
    categories: [
      { name: "Photography", icon: Camera, slug: "photography", color: "bg-purple-500", count: 42 },
      { name: "Print & Mail", icon: Mail, slug: "print-mail", color: "bg-cyan-500", count: 18 },
      { name: "Signage & Branding", icon: FileText, slug: "signage", color: "bg-slate-600", count: 15 },
      { name: "Open House Kits", icon: Home, slug: "open-house", color: "bg-orange-500", count: 12 },
      { name: "Client Gifting", icon: Gift, slug: "gifting", color: "bg-green-500", count: 24 },
      { name: "Property Access", icon: Lock, slug: "property-access", color: "bg-blue-600", count: 8 },
    ]
  },
  {
    title: "Digital-First (Fast Growth)",
    description: "Technology and automation tools for scaling your business",
    categories: [
      { name: "Website & SEO", icon: Globe, slug: "website-seo", color: "bg-cyan-500", count: 67 },
      { name: "Social Media", icon: TrendingUp, slug: "social-media", color: "bg-green-500", count: 89 },
      { name: "Lead Generation", icon: BarChart3, slug: "lead-gen", color: "bg-emerald-500", count: 45 },
      { name: "Video & Media", icon: Video, slug: "video-media", color: "bg-yellow-500", count: 34 },
      { name: "Marketing Automation", icon: Zap, slug: "automation", color: "bg-pink-500", count: 52 },
      { name: "CRM & Database", icon: Users, slug: "crm", color: "bg-blue-500", count: 28 },
      { name: "Transaction Tools", icon: FileText, slug: "transaction", color: "bg-orange-500", count: 19 },
      { name: "Coaching & Training", icon: Headphones, slug: "coaching", color: "bg-purple-500", count: 31 },
      { name: "Finance & Operations", icon: DollarSign, slug: "finance", color: "bg-orange-600", count: 22 },
      { name: "Compliance & Legal", icon: Shield, slug: "compliance", color: "bg-slate-500", count: 14 },
      { name: "Insurance", icon: Scale, slug: "insurance", color: "bg-purple-600", count: 11 },
    ]
  }
];

export const CategoryGrid = () => {
  return (
    <section className="w-full py-16 bg-background">
      <div className="container px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Shop by Category</h2>
          <p className="text-lg text-muted-foreground">Find exactly what you need for your business</p>
        </div>

        <div className="space-y-12">
          {categoryGroups.map((group, groupIndex) => (
            <div key={groupIndex} className="space-y-6">
              <div>
                <h3 className="text-2xl font-bold mb-2">{group.title}</h3>
                <p className="text-muted-foreground">{group.description}</p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                {group.categories.map((category) => (
                  <Link
                    key={category.slug}
                    to={`/category/${category.slug}`}
                    className="group"
                  >
                    <div className="relative rounded-xl border bg-card p-5 hover-lift hover-scale cursor-pointer transition-all">
                      {/* Badge Count */}
                      {category.count && (
                        <Badge 
                          className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0 flex items-center justify-center bg-primary text-primary-foreground text-xs font-semibold"
                        >
                          {category.count}
                        </Badge>
                      )}
                      
                      {/* Icon */}
                      <div className={`inline-flex p-3 rounded-full ${category.color} text-white mb-3`}>
                        <category.icon className="h-5 w-5" />
                      </div>
                      
                      {/* Category Name */}
                      <h4 className="font-semibold text-sm mb-1 group-hover:text-primary transition-colors">
                        {category.name}
                      </h4>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
