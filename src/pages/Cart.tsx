import { Link, useNavigate } from "react-router-dom";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ShoppingCart, Trash2, ArrowLeft, Crown, Users, Coins } from "lucide-react";
import { useCart } from "@/state/cart/CartProvider";
import { PricingMode } from "../../contracts/cart/pricing-selection";
import { ProUpsellBanner } from "@/components/commerce/ProUpsellBanner";
import { useProMember } from "@/hooks/use-pro-member";

const Cart = () => {
  const navigate = useNavigate();
  const { items, remove, clear, itemCount } = useCart();
  const { isPro, loading: proLoading } = useProMember();

  const formatPrice = (amount: number, currency: string = "USD"): string => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
    }).format(amount);
  };

  const getModeIcon = (mode: PricingMode) => {
    switch (mode) {
      case "pro":
        return <Crown className="h-4 w-4 text-warning" />;
      case "copay":
        return <Users className="h-4 w-4 text-info" />;
      case "points":
        return <Coins className="h-4 w-4 text-warning" />;
      default:
        return null;
    }
  };

  const getModeLabel = (mode: PricingMode): string => {
    switch (mode) {
      case "pro":
        return "Pro Member";
      case "copay":
        return "Co-Pay";
      case "points":
        return "Points";
      case "retail":
      default:
        return "Retail";
    }
  };

  const calculateTotal = () => {
    return items.reduce((sum, item) => sum + item.price.amount, 0);
  };

  if (itemCount === 0) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 container px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <Button variant="ghost" onClick={() => navigate(-1)} className="mb-6">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>

            <Card>
              <CardContent className="flex flex-col items-center justify-center py-16">
                <ShoppingCart className="h-16 w-16 text-muted-foreground mb-4" />
                <h2 className="text-2xl font-bold mb-2">Your cart is empty</h2>
                <p className="text-muted-foreground mb-6 text-center">
                  Browse our services and add items to your cart to get started
                </p>
                <Button asChild size="lg">
                  <Link to="/services">Browse Services</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 container px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <Button variant="ghost" onClick={() => navigate(-1)} className="mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>

          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold">Shopping Cart</h1>
            <Badge variant="secondary" className="text-lg px-3 py-1">
              {itemCount} {itemCount === 1 ? "item" : "items"}
            </Badge>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              {items.map((item) => (
                <Card key={item.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg mb-1">
                          {item.serviceName}
                        </CardTitle>
                        <p className="text-sm text-muted-foreground mb-2">
                          by {item.vendorName}
                        </p>
                        {item.packageName && (
                          <Badge variant="outline">{item.packageName}</Badge>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => remove(item.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {getModeIcon(item.mode)}
                        <span className="text-sm font-medium">
                          {getModeLabel(item.mode)} Price
                        </span>
                      </div>
                      <span className="text-xl font-bold">
                        {formatPrice(item.price.amount, item.price.currency)}
                      </span>
                    </div>

                    {item.mode === "copay" && item.copayPartnerShare && (
                      <div className="mt-3 p-3 bg-info/10 rounded-lg border border-info/30 space-y-1">
                        <div className="flex justify-between text-sm">
                          <span className="text-info">
                            Your share:
                          </span>
                          <span className="font-semibold text-info">
                            {formatPrice(item.userShare?.amount || 0, item.userShare?.currency)}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-info/80">
                            Partner covers:
                          </span>
                          <span className="font-semibold text-info/80">
                            {formatPrice(
                              item.copayPartnerShare.amount,
                              item.copayPartnerShare.currency
                            )}
                          </span>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}

              <Button
                variant="outline"
                onClick={clear}
                className="w-full text-destructive hover:text-destructive"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Clear Cart
              </Button>
            </div>

            {/* Order Summary Sidebar */}
            <div className="lg:col-span-1 space-y-4">
              {/* Pro Upsell Banner */}
              {!proLoading && !isPro && (
                <ProUpsellBanner variant="compact" dismissible />
              )}
              
              <Card className="sticky top-4">
                <CardHeader>
                  <CardTitle>Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span>{formatPrice(calculateTotal())}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Tax</span>
                      <span className="text-muted-foreground">Calculated at checkout</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between text-lg font-bold">
                      <span>Total</span>
                      <span>{formatPrice(calculateTotal())}</span>
                    </div>
                  </div>

                  <Alert>
                    <AlertDescription className="text-xs">
                      Final pricing and availability will be confirmed during checkout
                    </AlertDescription>
                  </Alert>
                </CardContent>
                <CardFooter className="flex-col gap-3">
                  <Button size="lg" className="w-full" disabled>
                    Proceed to Checkout
                    <Badge variant="secondary" className="ml-2">Coming Soon</Badge>
                  </Button>
                  <Button variant="outline" asChild className="w-full">
                    <Link to="/services">Continue Shopping</Link>
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Cart;
