import { useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { X, CheckCircle2, Star, TrendingUp } from "lucide-react";

const Saved = () => {
  const [compareMode, setCompareMode] = useState(false);
  
  // Mock saved services
  const savedServices = [
    {
      id: 1,
      name: "Premium Real Estate Photos",
      vendor: "Pro Photography Studio",
      category: "Photography",
      rating: 4.9,
      reviews: 847,
      retailPrice: 149,
      proPrice: 119,
      copayPrice: 75,
      deliveryTime: "2-3 days",
      revisions: 2,
      verified: true,
      features: ["HDR photos", "Advanced editing", "Commercial license", "Priority support"]
    },
    {
      id: 2,
      name: "Social Media Mastery",
      vendor: "Digital Marketing Pro",
      category: "Marketing",
      rating: 4.8,
      reviews: 623,
      retailPrice: 299,
      proPrice: 239,
      copayPrice: 150,
      deliveryTime: "7 days setup",
      revisions: "Unlimited",
      verified: true,
      features: ["Daily posts", "Content calendar", "Analytics", "Strategy consulting"]
    },
    {
      id: 3,
      name: "Virtual Staging Pro",
      vendor: "Staging Experts",
      category: "Staging",
      rating: 5.0,
      reviews: 412,
      retailPrice: 39,
      proPrice: 35,
      copayPrice: 20,
      deliveryTime: "24 hours",
      revisions: 1,
      verified: true,
      features: ["Multiple styles", "HD renders", "Fast turnaround", "Furniture library"]
    },
    {
      id: 4,
      name: "SEO & Lead Generation",
      vendor: "Growth Hackers Inc",
      category: "Marketing",
      rating: 4.7,
      reviews: 534,
      retailPrice: 499,
      proPrice: 399,
      copayPrice: 250,
      deliveryTime: "14 days",
      revisions: "Ongoing",
      verified: true,
      features: ["Local SEO", "Google Ads", "Lead tracking", "Monthly reports"]
    }
  ];

  const [selectedServices, setSelectedServices] = useState<number[]>([1, 2, 3]);

  const toggleService = (id: number) => {
    if (selectedServices.includes(id)) {
      setSelectedServices(selectedServices.filter(sid => sid !== id));
    } else if (selectedServices.length < 4) {
      setSelectedServices([...selectedServices, id]);
    }
  };

  const servicesInComparison = savedServices.filter(s => selectedServices.includes(s.id));

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold mb-2">Saved Services</h1>
            <p className="text-lg text-muted-foreground">
              {savedServices.length} services saved • Compare up to 4
            </p>
          </div>
          <Button
            onClick={() => setCompareMode(!compareMode)}
            variant={compareMode ? "default" : "outline"}
            size="lg"
          >
            {compareMode ? "Exit Comparison" : "Compare Services"}
          </Button>
        </div>

        {!compareMode ? (
          /* Grid View */
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {savedServices.map((service) => (
              <Card key={service.id} className="p-6 hover-lift relative">
                <button
                  className="absolute top-4 right-4 p-1 hover:bg-muted rounded-full transition-colors"
                  onClick={() => {}}
                >
                  <X className="h-4 w-4" />
                </button>

                <div className="space-y-4">
                  <div className="aspect-video bg-gradient-to-br from-primary/20 to-primary/5 rounded-lg flex items-center justify-center">
                    <span className="text-4xl">📦</span>
                  </div>

                  <div className="space-y-2">
                    <div className="flex gap-2">
                      {service.verified && (
                        <Badge className="badge-verified text-xs">
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          Verified
                        </Badge>
                      )}
                      <Badge variant="outline" className="text-xs">{service.category}</Badge>
                    </div>

                    <h3 className="font-semibold text-lg">{service.name}</h3>
                    <p className="text-sm text-muted-foreground">{service.vendor}</p>

                    <div className="flex items-center gap-2 text-sm">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="font-semibold">{service.rating}</span>
                      <span className="text-muted-foreground">({service.reviews})</span>
                    </div>

                    <div className="pt-3 border-t space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Retail:</span>
                        <span className="font-semibold">${service.retailPrice}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Pro:</span>
                        <span className="font-semibold text-primary">${service.proPrice}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Co-pay:</span>
                        <span className="font-semibold text-green-600">${service.copayPrice}</span>
                      </div>
                    </div>
                  </div>

                  <Button
                    className="w-full"
                    variant="outline"
                    onClick={() => toggleService(service.id)}
                  >
                    {selectedServices.includes(service.id) ? "Remove from Compare" : "Add to Compare"}
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          /* Comparison View - G2 Style */
          <div className="space-y-6">
            {/* Service Selection */}
            <div className="flex gap-4 p-4 bg-muted/50 rounded-xl">
              <span className="text-sm font-medium flex items-center">Comparing:</span>
              <div className="flex gap-2 flex-wrap">
                {savedServices.map((service) => (
                  <Button
                    key={service.id}
                    variant={selectedServices.includes(service.id) ? "default" : "outline"}
                    size="sm"
                    onClick={() => toggleService(service.id)}
                    disabled={!selectedServices.includes(service.id) && selectedServices.length >= 4}
                  >
                    {service.name}
                    {selectedServices.includes(service.id) && (
                      <X className="h-3 w-3 ml-2" />
                    )}
                  </Button>
                ))}
              </div>
            </div>

            {/* Comparison Table */}
            <div className="overflow-x-auto">
              <div className="inline-block min-w-full align-middle">
                <div className="overflow-hidden border rounded-2xl">
                  <table className="min-w-full divide-y divide-border">
                    <thead className="bg-muted/50">
                      <tr>
                        <th className="px-6 py-4 text-left text-sm font-semibold sticky left-0 bg-muted/50 z-10">
                          Feature
                        </th>
                        {servicesInComparison.map((service) => (
                          <th key={service.id} className="px-6 py-4 text-center min-w-[200px]">
                            <div className="space-y-2">
                              <div className="font-semibold">{service.name}</div>
                              <div className="text-xs text-muted-foreground font-normal">
                                {service.vendor}
                              </div>
                              <div className="flex items-center justify-center gap-1">
                                <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                                <span className="text-xs font-semibold">{service.rating}</span>
                              </div>
                            </div>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="bg-background divide-y divide-border">
                      {/* Pricing Rows */}
                      <tr className="bg-muted/20">
                        <td className="px-6 py-4 text-sm font-semibold sticky left-0 bg-muted/20">
                          Retail Price
                        </td>
                        {servicesInComparison.map((service) => (
                          <td key={service.id} className="px-6 py-4 text-center">
                            <span className="font-semibold text-lg">${service.retailPrice}</span>
                          </td>
                        ))}
                      </tr>
                      
                      <tr>
                        <td className="px-6 py-4 text-sm font-semibold sticky left-0 bg-background">
                          Pro Price
                        </td>
                        {servicesInComparison.map((service) => (
                          <td key={service.id} className="px-6 py-4 text-center">
                            <div className="flex flex-col items-center">
                              <span className="font-semibold text-lg text-primary">${service.proPrice}</span>
                              <Badge variant="outline" className="mt-1 text-xs text-green-600 border-green-200">
                                <TrendingUp className="h-3 w-3 mr-1" />
                                Save ${service.retailPrice - service.proPrice}
                              </Badge>
                            </div>
                          </td>
                        ))}
                      </tr>

                      <tr className="bg-muted/20">
                        <td className="px-6 py-4 text-sm font-semibold sticky left-0 bg-muted/20">
                          Co-pay Price
                        </td>
                        {servicesInComparison.map((service) => (
                          <td key={service.id} className="px-6 py-4 text-center">
                            <span className="font-semibold text-lg text-green-600">${service.copayPrice}</span>
                          </td>
                        ))}
                      </tr>

                      {/* Feature Rows */}
                      <tr>
                        <td className="px-6 py-4 text-sm font-semibold sticky left-0 bg-background">
                          Delivery Time
                        </td>
                        {servicesInComparison.map((service) => (
                          <td key={service.id} className="px-6 py-4 text-center text-sm">
                            {service.deliveryTime}
                          </td>
                        ))}
                      </tr>

                      <tr className="bg-muted/20">
                        <td className="px-6 py-4 text-sm font-semibold sticky left-0 bg-muted/20">
                          Revisions
                        </td>
                        {servicesInComparison.map((service) => (
                          <td key={service.id} className="px-6 py-4 text-center text-sm">
                            {service.revisions}
                          </td>
                        ))}
                      </tr>

                      <tr>
                        <td className="px-6 py-4 text-sm font-semibold sticky left-0 bg-background">
                          Verified Vendor
                        </td>
                        {servicesInComparison.map((service) => (
                          <td key={service.id} className="px-6 py-4 text-center">
                            {service.verified ? (
                              <CheckCircle2 className="h-5 w-5 text-primary mx-auto" />
                            ) : (
                              <span className="text-muted-foreground">—</span>
                            )}
                          </td>
                        ))}
                      </tr>

                      {/* Features */}
                      <tr className="bg-muted/20">
                        <td className="px-6 py-4 text-sm font-semibold sticky left-0 bg-muted/20">
                          Key Features
                        </td>
                        {servicesInComparison.map((service) => (
                          <td key={service.id} className="px-6 py-4">
                            <ul className="space-y-1 text-sm text-left">
                              {service.features.map((feature, idx) => (
                                <li key={idx} className="flex items-start gap-2">
                                  <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                                  <span>{feature}</span>
                                </li>
                              ))}
                            </ul>
                          </td>
                        ))}
                      </tr>

                      {/* CTA Row */}
                      <tr>
                        <td className="px-6 py-4 sticky left-0 bg-background"></td>
                        {servicesInComparison.map((service) => (
                          <td key={service.id} className="px-6 py-4">
                            <Button className="w-full" size="lg">
                              Select Service
                            </Button>
                          </td>
                        ))}
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Saved;
