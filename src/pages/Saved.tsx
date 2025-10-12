import { Navbar } from "@/components/layout/Navbar";

const Saved = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="container px-4 py-8">
        <h1 className="text-3xl font-bold">Saved Items</h1>
        <p className="text-muted-foreground mt-2">Compare and manage your saved services</p>
      </div>
    </div>
  );
};

export default Saved;
