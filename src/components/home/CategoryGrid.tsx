import { Link } from "react-router-dom";
import { Camera, TrendingUp, Users, Code, FileText, Palette, Video, Briefcase } from "lucide-react";

const categories = [
  { name: "Photography", icon: Camera, slug: "photography", color: "bg-blue-100 text-blue-600" },
  { name: "Marketing", icon: TrendingUp, slug: "marketing", color: "bg-purple-100 text-purple-600" },
  { name: "Coaching", icon: Users, slug: "coaching", color: "bg-green-100 text-green-600" },
  { name: "Tech & Automation", icon: Code, slug: "tech", color: "bg-orange-100 text-orange-600" },
  { name: "Compliance", icon: FileText, slug: "compliance", color: "bg-red-100 text-red-600" },
  { name: "Design", icon: Palette, slug: "design", color: "bg-pink-100 text-pink-600" },
  { name: "Video", icon: Video, slug: "video", color: "bg-indigo-100 text-indigo-600" },
  { name: "Business Services", icon: Briefcase, slug: "business", color: "bg-teal-100 text-teal-600" },
];

export const CategoryGrid = () => {
  return (
    <section className="w-full py-16">
      <div className="container px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Browse by Category</h2>
          <p className="text-lg text-muted-foreground">Find exactly what you need for your business</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {categories.map((category) => (
            <Link
              key={category.slug}
              to={`/category/${category.slug}`}
              className="group"
            >
              <div className="relative overflow-hidden rounded-2xl border bg-card p-6 md:p-8 hover-lift hover-scale cursor-pointer">
                <div className={`inline-flex p-3 rounded-xl ${category.color} mb-4`}>
                  <category.icon className="h-6 w-6" />
                </div>
                <h3 className="font-semibold text-lg">{category.name}</h3>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};
