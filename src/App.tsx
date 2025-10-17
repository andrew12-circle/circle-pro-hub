import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CartProvider } from "@/lib/cartStore";
import { RequireAuth, RequireAuthAndRole } from "@/lib/guard";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import DegradedBanner from "@/components/system/DegradedBanner";
import { WalletErrorFallback } from "@/components/system/WalletErrorFallback";
import { BookingErrorFallback } from "@/components/system/BookingErrorFallback";
import { FeatureErrorFallback } from "@/components/system/FeatureErrorFallback";
import Home from "./pages/Home";
import Auth from "./pages/Auth";
import Marketplace from "./pages/Marketplace";
import Services from "./pages/Services";
import ServiceDetail from "./pages/ServiceDetail";
import Cart from "./pages/Cart";
import Wallet from "./pages/Wallet";
import Pricing from "./pages/Pricing";
import Saved from "./pages/Saved";
import Profile from "./pages/Profile";
import Admin from "./pages/Admin";
import NotFound from "./pages/NotFound";
import Legal from "./pages/Legal";
import Support from "./pages/Support";
import Start from "./pages/partners/Start";
import ApplyService from "./pages/partners/ApplyService";
import ApplyCoPartner from "./pages/partners/ApplyCoPartner";
import Share from "./pages/Share";
import Book from "./pages/concierge/Book";
import AdminBookings from "./pages/admin/Bookings";

const queryClient = new QueryClient();

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <CartProvider>
        <BrowserRouter>
          <Toaster />
          <Sonner />
          <DegradedBanner />
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/marketplace" element={<Marketplace />} />
            <Route path="/services" element={<Services />} />
            <Route path="/services/:id" element={<ServiceDetail />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/legal" element={<Legal />} />
            <Route path="/support" element={<Support />} />
            <Route path="/s/:id" element={<Share />} />
            
            {/* Auth-Protected Routes with Error Boundaries */}
            <Route 
              path="/cart" 
              element={
                <ErrorBoundary fallback={<FeatureErrorFallback featureName="Shopping Cart" />}>
                  <RequireAuth><Cart /></RequireAuth>
                </ErrorBoundary>
              } 
            />
            
            {/* Wallet - Optional feature with dedicated fallback */}
            <Route 
              path="/account/wallet" 
              element={
                <ErrorBoundary fallback={<WalletErrorFallback />}>
                  <RequireAuth><Wallet /></RequireAuth>
                </ErrorBoundary>
              } 
            />
            
            <Route 
              path="/saved" 
              element={
                <ErrorBoundary fallback={<FeatureErrorFallback featureName="Saved Services" />}>
                  <RequireAuth><Saved /></RequireAuth>
                </ErrorBoundary>
              } 
            />
            
            <Route 
              path="/profile" 
              element={
                <ErrorBoundary fallback={<FeatureErrorFallback featureName="Profile" />}>
                  <RequireAuth><Profile /></RequireAuth>
                </ErrorBoundary>
              } 
            />
            
            {/* Booking - Critical feature with dedicated fallback */}
            <Route 
              path="/concierge/book" 
              element={
                <ErrorBoundary fallback={<BookingErrorFallback />}>
                  <RequireAuth><Book /></RequireAuth>
                </ErrorBoundary>
              } 
            />
            
            {/* Partner Routes with Error Boundaries */}
            <Route 
              path="/partners/start" 
              element={
                <ErrorBoundary fallback={<FeatureErrorFallback featureName="Partner Program" />}>
                  <RequireAuth><Start /></RequireAuth>
                </ErrorBoundary>
              } 
            />
            
            <Route 
              path="/partners/apply/service" 
              element={
                <ErrorBoundary fallback={<FeatureErrorFallback featureName="Service Application" />}>
                  <RequireAuth><ApplyService /></RequireAuth>
                </ErrorBoundary>
              } 
            />
            
            <Route 
              path="/partners/apply/copartner" 
              element={
                <ErrorBoundary fallback={<FeatureErrorFallback featureName="Co-Partner Application" />}>
                  <RequireAuth><ApplyCoPartner /></RequireAuth>
                </ErrorBoundary>
              } 
            />
            
            {/* Admin Routes with Error Boundaries */}
            <Route 
              path="/admin" 
              element={
                <ErrorBoundary fallback={<FeatureErrorFallback featureName="Admin Panel" />}>
                  <RequireAuthAndRole role="admin"><Admin /></RequireAuthAndRole>
                </ErrorBoundary>
              } 
            />
            
            <Route 
              path="/admin/bookings" 
              element={
                <ErrorBoundary fallback={<FeatureErrorFallback featureName="Admin Bookings" />}>
                  <RequireAuthAndRole role="admin"><AdminBookings /></RequireAuthAndRole>
                </ErrorBoundary>
              } 
            />
            
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </CartProvider>
    </QueryClientProvider>
  );
};

export default App;
