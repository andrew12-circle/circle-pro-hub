import { Navbar } from "@/components/layout/Navbar";

const Profile = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="container px-4 py-8">
        <h1 className="text-3xl font-bold">Profile</h1>
        <p className="text-muted-foreground mt-2">Manage your account and Pro membership</p>
      </div>
    </div>
  );
};

export default Profile;
