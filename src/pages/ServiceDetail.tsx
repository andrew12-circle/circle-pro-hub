import { Navbar } from "@/components/layout/Navbar";

const ServiceDetail = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="container px-4 py-8">
        <h1 className="text-3xl font-bold">Service Detail</h1>
        <p className="text-muted-foreground mt-2">View service details and pricing</p>
      </div>
    </div>
  );
};

export default ServiceDetail;
