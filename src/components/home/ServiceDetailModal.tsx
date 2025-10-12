import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { CheckCircle2, Calendar, Globe, DollarSign, X, Share2 } from "lucide-react";

interface ServiceDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  serviceId: string;
}

export const ServiceDetailModal = ({ open, onOpenChange, serviceId }: ServiceDetailModalProps) => {
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
    ]
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto p-0 [&>button]:hidden">
        {/* Header with gradient - More Condensed */}
        <div className="relative bg-gradient-to-br from-blue-800 via-blue-900 to-purple-900 text-white p-6 md:p-8">
          {/* Close button */}
          <div className="absolute top-4 right-4 flex gap-2">
            <Button variant="ghost" size="icon" className="bg-white/10 hover:bg-white/20 text-white">
              <Share2 className="h-5 w-5" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              className="bg-white/10 hover:bg-white/20 text-white"
              onClick={() => onOpenChange(false)}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          <div className="grid md:grid-cols-2 gap-6 items-start mt-8">
            <div className="space-y-3">
              {service.verified && (
                <Badge className="bg-emerald-500/20 text-emerald-100 border-emerald-400/30">
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                  Verified Pro
                </Badge>
              )}
              
              <h1 className="text-2xl md:text-3xl font-bold leading-tight">
                {service.name}
              </h1>
              
              <p className="text-blue-100 text-base leading-relaxed">
                {service.description}
              </p>

              {/* Metrics - More Compact */}
              <div className="grid grid-cols-3 gap-2 pt-2">
                {service.metrics.map((metric, idx) => (
                  <div key={idx} className="bg-white/10 backdrop-blur rounded-lg p-2.5 border border-white/20">
                    <div className="text-xl font-bold">{metric.value}</div>
                    <div className="text-[10px] text-blue-100 mt-0.5 leading-tight">{metric.label}</div>
                    <div className="text-[9px] text-blue-200/70">{metric.description}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Large logo/brand area with media thumbnails */}
            <div className="space-y-3">
              <div className="bg-white rounded-xl p-6 flex items-center justify-center aspect-video">
                <div className="text-center">
                  <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                    <span className="text-3xl font-bold text-primary">PP</span>
                  </div>
                  <div className="text-xl font-bold text-foreground">{service.vendor}</div>
                  <div className="text-xs text-muted-foreground mt-1">{service.tagline}</div>
                </div>
              </div>
              
              {/* Media Thumbnails */}
              <div className="grid grid-cols-4 gap-2">
                {[1, 2, 3, 4].map((idx) => (
                  <div 
                    key={idx} 
                    className="bg-white/20 backdrop-blur rounded-lg aspect-video border border-white/30 hover:bg-white/30 transition-colors cursor-pointer overflow-hidden"
                  >
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-400/30 to-purple-400/30">
                      <div className="text-white/60 text-xs font-medium">Video {idx}</div>
                    </div>
                  </div>
                ))}
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
            <div className="space-y-4">
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

        {/* Package Selection Section */}
        <div className="border-t bg-muted/20 p-8 md:p-12">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-2">Choose Your Package</h2>
            <p className="text-muted-foreground">Select the perfect solution for your business needs</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-8">
            {[
              {
                name: "CORE",
                retail: 749,
                pro: 649.99,
                copay: 324,
                features: ["24 One-on-One Coaching Sessions", "Business Partner Add-on ($250/mo)", "Success Summit Discounted", "Public Events Discounted"],
                moreCount: 3,
                selected: true
              },
              {
                name: "ELITE",
                retail: 1299,
                pro: 1199.88,
                copay: 600,
                features: ["48 One-on-One Coaching Sessions", "Accountability Platform", "Business Partner Add-On ($450/mo)", "Success Summit 1 Ticket"],
                moreCount: 5
              }
            ].map((pkg, idx) => (
              <div key={idx} className={`rounded-2xl p-6 ${pkg.selected ? 'border-2 border-primary bg-primary/5' : 'border bg-card'}`}>
                <h3 className="text-xl font-bold text-center mb-4">{pkg.name}</h3>
                
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Retail:</span>
                    <span className="font-semibold">${pkg.retail.toFixed(2)}/mo</span>
                  </div>
                  
                  <div className="p-2 bg-orange-50 dark:bg-orange-950/20 rounded-lg border border-orange-200 dark:border-orange-800">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-orange-700 dark:text-orange-400 flex items-center gap-1">
                        <CheckCircle2 className="h-3 w-3" />
                        Pro Member:
                      </span>
                      <span className="font-bold text-orange-700 dark:text-orange-400">${pkg.pro}/mo</span>
                    </div>
                    <Button variant="link" size="sm" className="h-auto p-0 text-xs text-orange-600 dark:text-orange-400">
                      Upgrade for Pro Pricing
                    </Button>
                  </div>

                  <div className="p-2 bg-yellow-50 dark:bg-yellow-950/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-yellow-700 dark:text-yellow-400 flex items-center gap-1">
                        <CheckCircle2 className="h-3 w-3" />
                        Co-Pay Feature
                      </span>
                    </div>
                    <p className="text-xs text-yellow-600 dark:text-yellow-500 mt-1">Could pay as low as ${pkg.copay.toFixed(2)}/mo (with Pro)</p>
                    <Button variant="link" size="sm" className="h-auto p-0 text-xs text-yellow-600 dark:text-yellow-400">
                      Upgrade for Co-Pay
                    </Button>
                    <p className="text-[10px] text-muted-foreground mt-1">Pro feature. Requires approved partner. Not guaranteed.</p>
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  {pkg.features.map((feature, fidx) => (
                    <div key={fidx} className="flex items-start gap-2 text-sm">
                      <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                      <span>{feature}</span>
                    </div>
                  ))}
                  <Button variant="link" size="sm" className="h-auto p-0 text-primary">
                    Show {pkg.moreCount} More Features
                  </Button>
                </div>

                <Button 
                  className="w-full" 
                  variant={pkg.selected ? "default" : "outline"}
                >
                  {pkg.selected ? "✓ Selected" : "Select Package"}
                </Button>
              </div>
            ))}
          </div>

          {/* Bottom CTAs */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
              Sign In to Add to Cart
            </Button>
            <Button size="lg" variant="default">
              Book Consultation →
            </Button>
          </div>
        </div>

        {/* Verified Pricing Disclaimer */}
        <div className="border-t bg-blue-50 dark:bg-blue-950/20 p-8 md:p-12">
          <div className="flex gap-4">
            <div className="flex-shrink-0">
              <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center text-white">
                <CheckCircle2 className="h-6 w-6" />
              </div>
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-lg mb-2 text-blue-900 dark:text-blue-100">Verified Pricing Disclaimer</h4>
              <p className="text-sm text-blue-800 dark:text-blue-200 mb-4">
                This service has verified pricing through our verification process. However, pricing is subject to change and vendors may not have updated their information since changes occurred.
              </p>
              <p className="text-sm text-blue-800 dark:text-blue-200 mb-4">
                Circle Marketplace cannot guarantee service quality, satisfaction, or discounts as we are a marketplace platform that represents other companies to make shopping easier. Please verify all details directly with the vendor.
              </p>
              <div className="flex items-center gap-2 text-xs text-blue-700 dark:text-blue-300 mb-4">
                <Calendar className="h-4 w-4" />
                <span>Last updated: Oct 6, 2025</span>
              </div>
              <p className="text-xs text-blue-700 dark:text-blue-300 mb-4">
                We make choosing simple. If prices changed since this date, verify directly. You'll finalize billing with the company - we're just a facilitator.
              </p>
              <div className="flex gap-3">
                <Button variant="outline" size="sm">
                  <Globe className="h-4 w-4 mr-2" />
                  Visit Website
                </Button>
                <Button variant="outline" size="sm">
                  <Calendar className="h-4 w-4 mr-2" />
                  Book Consultation
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
