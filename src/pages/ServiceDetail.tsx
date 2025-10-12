import { useParams } from "react-router-dom";
import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Star, CheckCircle2, Heart, Share2, MapPin, Clock, RefreshCw } from "lucide-react";

const ServiceDetail = () => {
  const { id } = useParams();

  // Mock service data
  const service = {
    id: 1,
    name: "Premium Real Estate Photos",
    vendor: "Pro Photography Studio",
    tagline: "Professional HDR photography that sells homes faster",
    location: "Los Angeles, CA",
    rating: 4.9,
    reviews: 847,
    verified: true,
    pro: true,
    deliveryTime: "2-3 days",
    revisions: "2 revisions included",
    packages: [
      {
        name: "Retail",
        price: 149,
        description: "Perfect for single listings",
        features: [
          "Up to 25 HDR photos",
          "Basic editing",
          "2-day delivery",
          "1 revision",
          "Commercial license"
        ]
      },
      {
        name: "Circle Pro",
        price: 119,
        discount: 20,
        description: "Exclusive discount for Pro members",
        features: [
          "Up to 30 HDR photos",
          "Advanced editing",
          "1-day delivery",
          "2 revisions",
          "Commercial license",
          "Priority support"
        ],
        popular: true
      },
      {
        name: "Co-pay",
        price: 75,
        copay: 74,
        description: "Split cost with matched vendor",
        features: [
          "Up to 30 HDR photos",
          "Advanced editing",
          "1-day delivery",
          "2 revisions",
          "Commercial license",
          "Vendor matches you with co-payer"
        ]
      }
    ],
    description: "Transform your listings with stunning professional photography. Our HDR techniques capture every detail, making spaces look bright, inviting, and magazine-ready. Trusted by top agents nationwide.",
    deliverables: [
      "Professional HDR photography",
      "Color correction and enhancement",
      "Virtual twilight option available",
      "Drone shots (add-on)",
      "Floor plan creation (add-on)"
    ],
    faqs: [
      {
        question: "What's included in the shoot?",
        answer: "Each package includes professional HDR photography with full editing, commercial licensing, and digital delivery of high-resolution images."
      },
      {
        question: "How does Co-pay work?",
        answer: "We match you with another agent who needs similar services. You split the cost 50/50, and we coordinate scheduling to benefit both parties."
      },
      {
        question: "What's your cancellation policy?",
        answer: "Free cancellation up to 24 hours before the scheduled shoot. Late cancellations incur a 50% fee."
      }
    ]
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Gallery */}
            <div className="rounded-2xl overflow-hidden border bg-card">
              <div className="aspect-video bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                <span className="text-6xl font-bold text-primary/30">📷</span>
              </div>
            </div>

            {/* Service Info */}
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <div className="flex gap-2">
                    {service.verified && (
                      <Badge className="badge-verified">
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        Verified
                      </Badge>
                    )}
                    {service.pro && <Badge className="badge-pro">Pro Available</Badge>}
                  </div>
                  <h1 className="text-3xl md:text-4xl font-bold">{service.name}</h1>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      {service.location}
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="font-semibold text-foreground">{service.rating}</span>
                      <span>({service.reviews} reviews)</span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="icon">
                    <Heart className="h-5 w-5" />
                  </Button>
                  <Button variant="outline" size="icon">
                    <Share2 className="h-5 w-5" />
                  </Button>
                </div>
              </div>

              <p className="text-lg">{service.tagline}</p>

              <div className="flex gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span>{service.deliveryTime}</span>
                </div>
                <div className="flex items-center gap-2">
                  <RefreshCw className="h-4 w-4 text-muted-foreground" />
                  <span>{service.revisions}</span>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="w-full justify-start">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="deliverables">What's Included</TabsTrigger>
                <TabsTrigger value="reviews">Reviews</TabsTrigger>
                <TabsTrigger value="faq">FAQ</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-4 mt-6">
                <div>
                  <h3 className="text-xl font-semibold mb-3">About This Service</h3>
                  <p className="text-muted-foreground leading-relaxed">{service.description}</p>
                </div>
              </TabsContent>

              <TabsContent value="deliverables" className="space-y-4 mt-6">
                <div>
                  <h3 className="text-xl font-semibold mb-3">You'll Get</h3>
                  <ul className="space-y-3">
                    {service.deliverables.map((item, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </TabsContent>

              <TabsContent value="reviews" className="space-y-4 mt-6">
                <div className="text-center py-12 text-muted-foreground">
                  <Star className="h-12 w-12 mx-auto mb-3 text-muted-foreground/50" />
                  <p>Reviews will be displayed here</p>
                </div>
              </TabsContent>

              <TabsContent value="faq" className="space-y-4 mt-6">
                <div className="space-y-6">
                  {service.faqs.map((faq, index) => (
                    <div key={index}>
                      <h4 className="font-semibold mb-2">{faq.question}</h4>
                      <p className="text-muted-foreground">{faq.answer}</p>
                    </div>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* Pricing Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-4">
              {service.packages.map((pkg, index) => (
                <div
                  key={index}
                  className={`rounded-2xl border p-6 bg-card ${
                    pkg.popular ? "ring-2 ring-primary shadow-lg" : ""
                  }`}
                >
                  {pkg.popular && (
                    <Badge className="mb-3 bg-primary text-primary-foreground">Most Popular</Badge>
                  )}
                  
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-semibold text-lg">{pkg.name}</h3>
                      <p className="text-sm text-muted-foreground mt-1">{pkg.description}</p>
                    </div>

                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-bold">${pkg.price}</span>
                      {pkg.discount && (
                        <Badge variant="outline" className="text-green-600 border-green-200">
                          Save {pkg.discount}%
                        </Badge>
                      )}
                    </div>

                    {pkg.copay && (
                      <div className="text-sm text-muted-foreground">
                        Your share: ${pkg.copay} • Vendor share: ${pkg.copay}
                      </div>
                    )}

                    <ul className="space-y-2 text-sm">
                      {pkg.features.map((feature, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>

                    <Button className="w-full" size="lg">
                      {pkg.name === "Co-pay" ? "Request Co-pay" : "Continue"}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServiceDetail;
