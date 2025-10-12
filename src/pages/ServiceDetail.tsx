import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Star, Shield, Heart, Share2, ArrowLeft, ShoppingCart, MessageCircle, Phone } from "lucide-react";
import { getServiceById } from "@/data/services";
import { ServiceFunnel } from "../../contracts/marketplace";
import { AddToCartModal } from "@/components/commerce/AddToCartModal";

const ServiceDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [service, setService] = useState<ServiceFunnel | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPackage, setSelectedPackage] = useState<string | null>(null);
  const [cartModalOpen, setCartModalOpen] = useState(false);

  useEffect(() => {
    const loadService = async () => {
      if (!id) return;

      setLoading(true);
      try {
        const result = await getServiceById(id);
        setService(result);
        if (result?.packages && result.packages.length > 0) {
          setSelectedPackage(result.packages[0].id);
        }
      } catch (error) {
        console.error("Failed to load service:", error);
      } finally {
        setLoading(false);
      }
    };

    loadService();
  }, [id]);

  const formatPrice = (amount: number): string => {
    return `$${amount.toLocaleString()}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 container px-4 py-8">
          <Skeleton className="h-8 w-full max-w-2xl mb-4" />
          <Skeleton className="h-64 w-full mb-8" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              <Skeleton className="h-96" />
            </div>
            <div className="space-y-4">
              <Skeleton className="h-48" />
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!service) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 container px-4 py-8">
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold mb-4">Service not found</h2>
            <Link to="/services">
              <Button>Back to Services</Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const currentPackage = service.packages.find((pkg) => pkg.id === selectedPackage);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 container px-4 py-8">
        {/* Back button */}
        <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div className="flex items-center gap-3">
              <img
                src={service.vendor.logo}
                alt={service.vendor.name}
                className="w-16 h-16 rounded-full object-cover"
              />
              <div>
                <h1 className="text-3xl font-bold mb-1">{service.name}</h1>
                <p className="text-muted-foreground flex items-center gap-2">
                  {service.vendor.name}
                  {service.vendor.verified && (
                    <Badge variant="secondary">
                      <Shield className="w-3 h-3 mr-1" />
                      Verified
                    </Badge>
                  )}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="icon">
                <Heart className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon">
                <Share2 className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="flex items-center gap-4 mb-4">
            <div className="flex items-center gap-1">
              <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
              <span className="font-semibold">{service.rating}</span>
              <span className="text-muted-foreground">({service.reviews} reviews)</span>
            </div>
            <div className="flex gap-2">
              {service.badges.map((badge) => (
                <Badge key={badge}>{badge}</Badge>
              ))}
            </div>
          </div>

          <p className="text-lg">{service.tagline}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Media gallery */}
            {service.media.images.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Gallery</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    {service.media.images.map((image, idx) => (
                      <img
                        key={idx}
                        src={image}
                        alt={`${service.name} - Image ${idx + 1}`}
                        className="w-full h-48 object-cover rounded-lg"
                      />
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Packages */}
            <Card>
              <CardHeader>
                <CardTitle>Choose Your Package</CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs value={selectedPackage || undefined} onValueChange={setSelectedPackage}>
                  <TabsList className="grid w-full" style={{ gridTemplateColumns: `repeat(${service.packages.length}, 1fr)` }}>
                    {service.packages.map((pkg) => (
                      <TabsTrigger key={pkg.id} value={pkg.id}>
                        {pkg.name}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                  {service.packages.map((pkg) => (
                    <TabsContent key={pkg.id} value={pkg.id} className="space-y-4">
                      <p className="text-muted-foreground">{pkg.description}</p>
                      <div className="space-y-3 p-4 bg-muted rounded-lg">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">Retail Price</span>
                          <span className="text-xl font-bold">
                            {formatPrice(pkg.pricing.retail.amount)}
                          </span>
                        </div>
                        {pkg.pricing.pro && (
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-muted-foreground">Pro Member Price</span>
                            <div className="text-right">
                              <span className="text-xl font-bold text-primary">
                                {formatPrice(pkg.pricing.pro.amount)}
                              </span>
                              {pkg.pricing.proPctSavings && (
                                <Badge variant="default" className="ml-2">
                                  Save {pkg.pricing.proPctSavings}%
                                </Badge>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </TabsContent>
                  ))}
                </Tabs>
              </CardContent>
            </Card>

            {/* FAQ */}
            {service.faq.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Frequently Asked Questions</CardTitle>
                </CardHeader>
                <CardContent>
                  <Accordion type="single" collapsible>
                    {service.faq.map((item, idx) => (
                      <AccordionItem key={idx} value={`faq-${idx}`}>
                        <AccordionTrigger>{item.question}</AccordionTrigger>
                        <AccordionContent>{item.answer}</AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </CardContent>
              </Card>
            )}

            {/* Compliance */}
            {service.compliance && (
              <Card>
                <CardContent className="pt-6">
                  {service.compliance.respa && (
                    <p className="text-xs text-muted-foreground mb-2">
                      <strong>RESPA Notice:</strong> {service.compliance.respa}
                    </p>
                  )}
                  {service.compliance.disclaimer && (
                    <p className="text-xs text-muted-foreground">
                      <strong>Disclaimer:</strong> {service.compliance.disclaimer}
                    </p>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar - Quick actions */}
          <div className="space-y-4">
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  className="w-full" 
                  size="lg"
                  onClick={() => setCartModalOpen(true)}
                >
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  Add to Cart
                </Button>
                <Button variant="outline" className="w-full">
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Ask a Question
                </Button>
                <Button variant="outline" className="w-full">
                  <Phone className="w-4 h-4 mr-2" />
                  Call Vendor
                </Button>
              </CardContent>
            </Card>

            {currentPackage && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Current Selection</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <p className="font-semibold">{currentPackage.name}</p>
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Retail</span>
                      <span>{formatPrice(currentPackage.pricing.retail.amount)}</span>
                    </div>
                    {currentPackage.pricing.pro && (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Pro Member</span>
                        <span className="text-primary font-semibold">
                          {formatPrice(currentPackage.pricing.pro.amount)}
                        </span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
      <Footer />
      
      {service && currentPackage && (
        <AddToCartModal
          open={cartModalOpen}
          onOpenChange={setCartModalOpen}
          serviceId={service.id}
          serviceName={service.name}
          vendorName={service.vendor.name}
          packageId={currentPackage.id}
          packageName={currentPackage.name}
          pricing={currentPackage.pricing}
        />
      )}
    </div>
  );
};

export default ServiceDetail;
