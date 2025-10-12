import { useParams } from "react-router-dom";
import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { CheckCircle2, Calendar, Globe, DollarSign, X, Share2, Users } from "lucide-react";

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
    ]
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

          {/* Package Selection Section */}
          <div className="border-t bg-muted/20 p-8 md:p-12">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold mb-2">Choose Your Package</h2>
              <p className="text-muted-foreground">Select the perfect solution for your business needs</p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
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
                },
                {
                  name: "TEAM GROWTH",
                  retail: 2999,
                  pro: 2899.88,
                  copay: 1450,
                  features: ["72 One-on-One Coaching Sessions", "Accountability Platform 10 Team Invitations", "Business Partner Included", "Specialty Coaching 4 Credits/year"],
                  moreCount: 11
                },
                {
                  name: "TEAM MASTERY",
                  retail: 4999,
                  pro: 4899.88,
                  copay: 2450,
                  features: ["72 One-on-One Coaching Sessions", "Accountability Platform 20 Team Invitations", "Business Partner Included", "Specialty Coaching 4 credits/year"],
                  moreCount: 15
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

          {/* Customers Also Viewed Section */}
          <div className="border-t p-8 md:p-12 bg-background">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold flex items-center gap-2">
                <Users className="h-5 w-5" />
                Customers also viewed
              </h3>
              <div className="flex gap-2">
                <Button variant="outline" size="icon">←</Button>
                <Button variant="outline" size="icon">→</Button>
              </div>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { name: "Krista Mashore", tagline: "Unlock your potential with Krista Mashore's coaching—proven...", retail: 997, copay: 499, eligible: true, discount: "50% OFF" },
                { name: "Kinder Reese C", tagline: "Most agents start with big dreams—but too many end up stuck in...", retail: 499, copay: 250, eligible: true, discount: "50% OFF" },
                { name: "Buffini & Co", tagline: "Transform your business with personalized coaching from...", retail: 399, wholesale: 200, copay: 100, eligible: true, discount: "50% OFF" },
                { name: "Jared James Co", tagline: "🚀 Real Estate Coaching That Actually Moves the Needle...", retail: 99, wholesale: 89, eligible: false, discount: "50% OFF" }
              ].map((related, idx) => (
                <div key={idx} className="border rounded-xl p-4 bg-card hover-lift">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold">
                        {related.name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-semibold text-sm">{related.name}</div>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" className="h-6 w-6">
                        <Share2 className="h-3 w-3" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-6 w-6">
                        <CheckCircle2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>

                  <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{related.tagline}</p>
                  <Button variant="link" size="sm" className="h-auto p-0 text-xs mb-3">See more</Button>

                  <div className="aspect-video bg-gradient-to-br from-muted to-muted/50 rounded-lg mb-4 flex items-center justify-center">
                    <span className="text-2xl font-bold text-muted-foreground/30">{related.name.split(' ').map(w => w[0]).join('')}</span>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Retail Price:</span>
                      <span className="font-bold">${related.retail}/mo</span>
                    </div>

                    {related.copay && (
                      <div className="p-2 bg-green-50 dark:bg-green-950/20 rounded border border-green-200 dark:border-green-800">
                        <div className="text-xs text-green-700 dark:text-green-400 font-medium mb-1">🤝 Unlock Co-Pay</div>
                        <div className="space-y-1 text-[10px]">
                          <div className="flex justify-between">
                            <span>With Vendor Help:</span>
                            <span className="font-bold text-green-700 dark:text-green-400">${related.copay}/mo</span>
                          </div>
                          {!related.eligible && (
                            <div className="flex justify-between">
                              <span>With Vendor Help:</span>
                              <span className="font-bold text-red-600">Not eligible</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {related.wholesale && (
                      <div className="p-2 bg-blue-50 dark:bg-blue-950/20 rounded border border-blue-200 dark:border-blue-800">
                        <div className="text-xs text-blue-700 dark:text-blue-400 flex justify-between">
                          <span>🔓 Unlock Wholesale Price</span>
                          <span className="line-through text-[10px]">${related.wholesale}/mo</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {related.discount && (
                    <div className="flex justify-center mb-3">
                      <Badge className="bg-red-500 text-white">{related.discount}</Badge>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1">Add</Button>
                    <Button size="sm" className="flex-1">Learn more</Button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Verified Pricing Disclaimer */}
          <div className="border-t bg-blue-50 dark:bg-blue-950/20 p-8 md:p-12">
            <div className="max-w-4xl mx-auto">
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
                  <div className="flex items-center gap-4 text-xs text-blue-700 dark:text-blue-300 mb-4">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      <span>Last updated: Oct 6, 2025</span>
                    </div>
                    <p>We make choosing simple. If prices changed since this date, verify directly. You'll finalize billing with the company - we're just a facilitator.</p>
                  </div>
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
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServiceDetail;
