import { Navbar } from "@/components/layout/Navbar";

const Category = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="container px-4 py-8">
        <h1 className="text-3xl font-bold">Category Page</h1>
        <p className="text-muted-foreground mt-2">Browse services in this category</p>
      </div>
    </div>
  );
};

export default Category;
