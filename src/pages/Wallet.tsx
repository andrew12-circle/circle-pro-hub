import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Coins, ArrowLeft, TrendingUp, TrendingDown, Info } from "lucide-react";
import { getBalance, getTransactions, PointsBalance, PointsTransaction } from "@/data/wallet";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const Wallet = () => {
  const { toast } = useToast();
  const [balance, setBalance] = useState<PointsBalance | null>(null);
  const [transactions, setTransactions] = useState<PointsTransaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadWalletData = async () => {
      setLoading(true);
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session?.user) {
          toast({
            title: "Authentication required",
            description: "Please sign in to view your wallet",
            variant: "destructive",
          });
          setLoading(false);
          return;
        }

        const [balanceData, transactionsData] = await Promise.all([
          getBalance(session.user.id),
          getTransactions(session.user.id),
        ]);

        setBalance(balanceData);
        setTransactions(transactionsData);
      } catch (error) {
        if (import.meta.env.DEV) {
          console.error("Error loading wallet:", error);
        }
        toast({
          title: "Error",
          description: "Failed to load wallet data",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    loadWalletData();
  }, [toast]);

  const getTransactionIcon = (type: PointsTransaction["type"]) => {
    switch (type) {
      case "earn":
        return <TrendingUp className="h-4 w-4 text-green-600" />;
      case "spend":
        return <TrendingDown className="h-4 w-4 text-red-600" />;
      case "refund":
        return <TrendingUp className="h-4 w-4 text-blue-600" />;
    }
  };

  const getTransactionColor = (type: PointsTransaction["type"]) => {
    switch (type) {
      case "earn":
        return "text-green-600";
      case "spend":
        return "text-red-600";
      case "refund":
        return "text-blue-600";
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(date);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 container px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <Button variant="ghost" asChild className="mb-6">
            <Link to="/profile">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Profile
            </Link>
          </Button>

          <div className="flex items-center gap-3 mb-6">
            <Coins className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold">Circle Points Wallet</h1>
          </div>

          {loading ? (
            <Card>
              <CardContent className="py-16 text-center">
                <p className="text-muted-foreground">Loading wallet...</p>
              </CardContent>
            </Card>
          ) : !balance ? (
            <Card>
              <CardContent className="py-16 text-center">
                <Coins className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h2 className="text-2xl font-bold mb-2">No Wallet Found</h2>
                <p className="text-muted-foreground mb-6">
                  Your wallet will be created automatically when you earn your first points
                </p>
                <Button asChild>
                  <Link to="/services">Browse Services</Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {/* Balance Card */}
              <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
                <CardHeader>
                  <CardTitle className="text-2xl">Your Balance</CardTitle>
                  <CardDescription>Circle Points available for redemption</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-baseline gap-2">
                    <span className="text-5xl font-bold text-primary">
                      {balance.points.toLocaleString()}
                    </span>
                    <span className="text-2xl text-muted-foreground">points</span>
                  </div>
                  
                  <Alert className="mt-6 border-primary/30 bg-primary/5">
                    <Info className="h-4 w-4" />
                    <AlertDescription className="text-sm">
                      Redeem your points during checkout for eligible services. Point values vary by service.
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>

              {/* Transaction History */}
              <Card>
                <CardHeader>
                  <CardTitle>Transaction History</CardTitle>
                  <CardDescription>
                    {transactions.length === 0
                      ? "No transactions yet"
                      : `${transactions.length} transaction${transactions.length !== 1 ? "s" : ""}`}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {transactions.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <p>Your transaction history will appear here</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {transactions.map((transaction, index) => (
                        <div key={transaction.id}>
                          <div className="flex items-center justify-between py-3">
                            <div className="flex items-center gap-3">
                              {getTransactionIcon(transaction.type)}
                              <div>
                                <p className="font-medium">{transaction.description}</p>
                                <p className="text-sm text-muted-foreground">
                                  {formatDate(transaction.createdAt)}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className={`text-lg font-bold ${getTransactionColor(transaction.type)}`}>
                                {transaction.type === "spend" ? "-" : "+"}
                                {Math.abs(transaction.amount).toLocaleString()}
                              </p>
                              <Badge variant="outline" className="text-xs capitalize">
                                {transaction.type}
                              </Badge>
                            </div>
                          </div>
                          {index < transactions.length - 1 && <Separator />}
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Wallet;
