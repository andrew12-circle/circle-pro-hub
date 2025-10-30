import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Check } from "lucide-react";
import { PricingPageConfig } from "../../contracts/ui/pricing-page";
import { useProMember } from "@/hooks/use-pro-member";
import { createCheckoutSession } from "@/data/stripe";
import { getCurrentSession } from "@/data/auth";
import { useToast } from "@/hooks/use-toast";

const Pricing = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const { isPro, loading: proLoading } = useProMember();
  const [config, setConfig] = useState<PricingPageConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  useEffect(() => {
    const loadPricingConfig = async () => {
      try {
        const response = await fetch('/fixtures/pricing.json');
        const data = await response.json();
        setConfig(data);
      } catch (error) {
        console.error("Failed to load pricing config:", error);
      } finally {
        setLoading(false);
      }
    };

    loadPricingConfig();

    // Show toast if user canceled checkout
    if (searchParams.get('canceled') === 'true') {
      toast({
        title: "Checkout Canceled",
        description: "You can try again whenever you're ready.",
      });
    }
  }, [searchParams, toast]);

  const formatPrice = (amount: number | null, currency: string = "USD"): string => {
    if (amount === null) return "Custom";
    if (amount === 0) return "Free";
    
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getIntervalText = (interval: string): string => {
    switch (interval) {
      case "month":
        return "/month";
      case "year":
        return "/year";
      case "one-time":
        return "";
      case "custom":
        return "";
      default:
        return "";
    }
  };

  const handleUpgradeClick = async (tier: any) => {
    // Check if user is authenticated
    const session = await getCurrentSession();
    if (!session) {
      navigate('/auth?upgrade=pro');
      return;
    }

    // If Pro tier, trigger Stripe checkout
    if (tier.id === "pro") {
      try {
        setCheckoutLoading(true);
        const proPriceId = import.meta.env.VITE_STRIPE_PRICE_PRO || "price_1234"; // Fallback
        const { url } = await createCheckoutSession(proPriceId);
        window.location.href = url;
      } catch (error) {
        toast({
          title: "Checkout Error",
          description: "Failed to start checkout. Please try again.",
          variant: "destructive",
        });
      } finally {
        setCheckoutLoading(false);
      }
    } else {
      // Other tiers - navigate as before
      if (tier.cta.href.startsWith("mailto:")) {
        window.location.href = tier.cta.href;
      } else {
        navigate(tier.cta.href);
      }
    }
  };

  if (loading || proLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-muted-foreground">Loading pricing...</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (!config) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-muted-foreground">Failed to load pricing information</p>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="container px-4 py-16 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            {config.hero.headline}
          </h1>
          <p className="text-xl text-muted-foreground mb-6 max-w-3xl mx-auto">
            {config.hero.subheadline}
          </p>
          {config.hero.highlightText && (
            <Badge variant="default" className="text-base px-4 py-2">
              {config.hero.highlightText}
            </Badge>
          )}
        </section>

        {/* Pricing Tiers */}
        <section className="container px-4 pb-16">
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {config.tiers.map((tier) => (
              <Card
                key={tier.id}
                className={`relative flex flex-col ${
                  tier.highlighted
                    ? "border-primary shadow-lg scale-105"
                    : ""
                } ${isPro && tier.id === "pro" ? "border-primary bg-primary/5" : ""}`}
              >
                {tier.badge && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <Badge variant="default" className="text-sm px-4 py-1">
                      {tier.badge}
                    </Badge>
                  </div>
                )}
                
                {isPro && tier.id === "pro" && (
                  <div className="absolute -top-4 right-4">
                    <Badge variant="default" className="text-sm px-3 py-1">
                      Current Plan
                    </Badge>
                  </div>
                )}

                <CardHeader className="text-center pb-8">
                  <CardTitle className="text-2xl mb-2">{tier.name}</CardTitle>
                  <CardDescription className="text-base">
                    {tier.description}
                  </CardDescription>
                  <div className="mt-4">
                    <div className="flex items-baseline justify-center gap-1">
                      <span className="text-4xl font-bold">
                        {formatPrice(tier.price.amount, tier.price.currency)}
                      </span>
                      {tier.price.amount !== null && tier.price.amount > 0 && (
                        <span className="text-muted-foreground">
                          {getIntervalText(tier.price.interval)}
                        </span>
                      )}
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="flex-1">
                  <ul className="space-y-3">
                    {tier.features.map((feature, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>

                <CardFooter>
                  <Button
                    className="w-full"
                    variant={tier.highlighted ? "default" : "outline"}
                    size="lg"
                    onClick={() => handleUpgradeClick(tier)}
                    disabled={(isPro && tier.id === "pro") || checkoutLoading}
                  >
                    {checkoutLoading && tier.id === "pro" 
                      ? "Starting checkout..." 
                      : tier.cta.text}
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </section>

        {/* FAQ Section */}
        <section className="container px-4 py-16 bg-muted/30">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-2">
              Frequently Asked Questions
            </h2>
            <p className="text-center text-muted-foreground mb-8">
              Everything you need to know about our pricing
            </p>

            <Accordion type="single" collapsible className="space-y-4">
              {config.faq.map((item, index) => (
                <AccordionItem
                  key={index}
                  value={`item-${index}`}
                  className="bg-background border rounded-lg px-6"
                >
                  <AccordionTrigger className="text-left hover:no-underline">
                    <span className="font-semibold">{item.question}</span>
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    {item.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </section>

        {/* Final CTA */}
        {!isPro && (
          <section className="container px-4 py-16 text-center">
            <div className="max-w-2xl mx-auto">
              <h2 className="text-3xl font-bold mb-4">
                Ready to save with Pro?
              </h2>
              <p className="text-xl text-muted-foreground mb-8">
                Join thousands of satisfied Pro members and start saving today
              </p>
              <Button
                size="lg"
                onClick={() => navigate("/auth?upgrade=pro")}
                className="text-lg px-8"
              >
                Get Started with Pro
              </Button>
            </div>
          </section>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default Pricing;
