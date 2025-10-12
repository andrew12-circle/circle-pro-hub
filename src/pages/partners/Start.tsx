import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Store, Handshake } from "lucide-react";

const Start = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold">Partner With Circle Pro Hub</h1>
            <p className="text-xl text-muted-foreground">
              Join our network and grow your business
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <Store className="h-8 w-8 text-primary" />
                  <CardTitle>List a Service</CardTitle>
                </div>
                <CardDescription>
                  Join as a service provider and reach thousands of real estate professionals
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Expand your customer base</li>
                  <li>• Get verified status</li>
                  <li>• Flexible pricing options</li>
                  <li>• Marketing support</li>
                </ul>
                <Button asChild className="w-full">
                  <Link to="/partners/apply/service">Apply as Service Provider</Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <Handshake className="h-8 w-8 text-primary" />
                  <CardTitle>Join Co-Pay Program</CardTitle>
                </div>
                <CardDescription>
                  Partner with us to offer co-pay benefits to your agents
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Enhance agent benefits</li>
                  <li>• Increase agent retention</li>
                  <li>• Custom contribution options</li>
                  <li>• Dedicated support</li>
                </ul>
                <Button asChild className="w-full">
                  <Link to="/partners/apply/copartner">Apply for Co-Pay Program</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Start;
