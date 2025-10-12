import { Navbar } from "@/components/layout/Navbar";

const Admin = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="container px-4 py-8">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground mt-2">Manage users, vendors, and marketplace analytics</p>
      </div>
    </div>
  );
};

export default Admin;
