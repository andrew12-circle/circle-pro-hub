import { useParams } from "react-router-dom";
import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { CheckCircle2, Calendar, Globe, DollarSign, X, Share2 } from "lucide-react";

const ServiceDetail = () => {
  const { id } = useParams();

  // Mock service data
  const service = {
    id: 1,
    name: "Premium Real Estate Photos",
    vendor: "Pro Photography Studio",
    tagline: "Professional HDR photography that sells homes faster",
    description: "This isn't theory. Thousands of agents just like you have transformed their listings with our professional HDR photography. Our proven system delivers magazine-quality photos that make buyers stop scrolling and start calling.",
    verified: true,
    metrics: [
      { label: "Avg ROI", value: "600%", description: "Higher sale prices" },
      { label: "Time to Results", value: "24-48hrs", description: "Fast turnaround" },
      { label: "Time to Setup", value: "Same Day", description: "Instant booking" }
    ],
    packages: [
      {
        name: "Retail",
        price: 149,
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
        features: [
          "Up to 30 HDR photos",
          "Advanced editing",
          "1-day delivery",
          "2 revisions",
          "Commercial license",
          "Priority support"
        ]
      },
      {
        name: "Co-pay",
        price: 75,
        features: [
          "Up to 30 HDR photos",
          "Split cost with matched agent",
          "Advanced editing",
          "Commercial license"
        ]
      }
    ],
    faqs: [
      {
        question: "Why Should I Care?",
        answer: "Professional photography is the #1 factor in getting buyers to click on your listing. Our HDR photos make spaces look bright, inviting, and magazine-ready - resulting in 3x more showings and faster sales.",
        color: "border-l-blue-500"
      },
      {
        question: "What's My ROI Potential?",
        answer: "Agents using our photography service report an average of 600% ROI through faster sales (average 14 days less on market) and higher sale prices (average 3-7% above comparable listings). Your photos pay for themselves in just one transaction.",
        color: "border-l-purple-500"
      },
      {
        question: "How Soon Will I See Results?",
        answer: "Most agents see results immediately. We deliver photos within 24-48 hours, and listings typically receive 3x more online views within the first week. Book today, shoot tomorrow, list by the weekend.",
        color: "border-l-orange-500"
      },
      {
        question: "What's Included?",
        answer: "Every package includes: Professional HDR photography, color correction, perspective correction, sky replacement (when needed), virtual twilight option, commercial licensing, and high-resolution digital delivery. Pro packages add priority scheduling and extra revisions.",
        color: "border-l-red-500"
      },
      {
        question: "Proof It Works",
        answer: "Over 10,000 agents nationwide trust us for their photography. Our photos have been featured in listings that sold 40% faster than market average. Check our reviews to see real results from agents just like you.",
        color: "border-l-green-500"
      }
    ],
    websiteUrl: "https://example.com",
    consultationUrl: "https://example.com/book"
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container px-4 py-8">
        {/* Modal-style container */}
        <div className="max-w-6xl mx-auto bg-card rounded-3xl border shadow-2xl overflow-hidden">
          {/* Header with gradient */}
          <div className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-blue-900 text-white p-8 md:p-12">
            {/* Close button */}
            <div className="absolute top-4 right-4 flex gap-2">
              <Button variant="ghost" size="icon" className="bg-white/10 hover:bg-white/20 text-white">
                <Share2 className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" className="bg-white/10 hover:bg-white/20 text-white" asChild>
                <a href="/">
                  <X className="h-5 w-5" />
                </a>
              </Button>
            </div>

            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div className="space-y-4">
                {service.verified && (
                  <Badge className="bg-emerald-500/20 text-emerald-100 border-emerald-400/30">
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    Verified Pro
                  </Badge>
                )}
                
                <h1 className="text-3xl md:text-4xl font-bold leading-tight">
                  {service.name}
                </h1>
                
                <p className="text-blue-100 text-lg leading-relaxed">
                  {service.description}
                </p>

                {/* Metrics */}
                <div className="grid grid-cols-3 gap-3 pt-4">
                  {service.metrics.map((metric, idx) => (
                    <div key={idx} className="bg-white/10 backdrop-blur rounded-xl p-3 border border-white/20">
                      <div className="text-2xl font-bold">{metric.value}</div>
                      <div className="text-xs text-blue-100 mt-1">{metric.label}</div>
                      <div className="text-[10px] text-blue-200/70 mt-0.5">{metric.description}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Large logo/brand area */}
              <div className="bg-white rounded-2xl p-8 flex items-center justify-center aspect-square">
                <div className="text-center">
                  <div className="h-24 w-24 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <span className="text-4xl font-bold text-primary">PP</span>
                  </div>
                  <div className="text-2xl font-bold text-foreground">{service.vendor}</div>
                  <div className="text-sm text-muted-foreground mt-2">{service.tagline}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Content area */}
          <div className="grid md:grid-cols-3 gap-8 p-8 md:p-12">
            {/* FAQ Accordion - 2/3 width */}
            <div className="md:col-span-2 space-y-4">
              <Accordion type="single" collapsible className="space-y-3">
                {service.faqs.map((faq, idx) => (
                  <AccordionItem 
                    key={idx} 
                    value={`item-${idx}`}
                    className={`border-l-4 ${faq.color} bg-muted/30 rounded-lg border-y border-r px-6`}
                  >
                    <AccordionTrigger className="text-left font-semibold hover:no-underline py-4">
                      <span className="flex items-center gap-3">
                        <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">
                          {idx + 1}
                        </span>
                        {faq.question}
                      </span>
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground pb-4 pl-9">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>

            {/* Quick Actions Sidebar - 1/3 width */}
            <div className="space-y-4">
              <div className="sticky top-8 space-y-4">
                <h3 className="font-semibold text-lg">Quick Actions</h3>
                
                <Button className="w-full" size="lg">
                  <Calendar className="h-5 w-5 mr-2" />
                  Book Consultation
                </Button>

                <Button variant="outline" className="w-full" size="lg">
                  <Globe className="h-5 w-5 mr-2" />
                  View Our Website
                </Button>

                <Button variant="outline" className="w-full" size="lg">
                  <DollarSign className="h-5 w-5 mr-2" />
                  Pricing
                </Button>

                {/* Pricing Summary */}
                <div className="mt-8 p-6 bg-muted/50 rounded-xl space-y-3">
                  <h4 className="font-semibold mb-4">Pricing Options</h4>
                  {service.packages.map((pkg, idx) => (
                    <div key={idx} className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground">{pkg.name}:</span>
                      <div className="flex items-center gap-2">
                        <span className="font-bold">${pkg.price}</span>
                        {pkg.discount && (
                          <Badge variant="outline" className="text-xs text-green-600 border-green-200">
                            Save {pkg.discount}%
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServiceDetail;
