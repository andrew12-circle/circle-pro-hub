import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CartProvider } from "@/lib/cartStore";
import { RequireAuth, RequireAuthAndRole } from "@/lib/guard";
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
            
            {/* Auth-Protected Routes */}
            <Route path="/cart" element={<RequireAuth><Cart /></RequireAuth>} />
            <Route path="/account/wallet" element={<RequireAuth><Wallet /></RequireAuth>} />
            <Route path="/saved" element={<RequireAuth><Saved /></RequireAuth>} />
            <Route path="/profile" element={<RequireAuth><Profile /></RequireAuth>} />
            <Route path="/concierge/book" element={<RequireAuth><Book /></RequireAuth>} />
            
            {/* Partner Routes (Auth Required) */}
            <Route path="/partners/start" element={<RequireAuth><Start /></RequireAuth>} />
            <Route path="/partners/apply/service" element={<RequireAuth><ApplyService /></RequireAuth>} />
            <Route path="/partners/apply/copartner" element={<RequireAuth><ApplyCoPartner /></RequireAuth>} />
            
            {/* Admin Routes (Auth + Admin Role Required) */}
            <Route path="/admin" element={<RequireAuthAndRole role="admin"><Admin /></RequireAuthAndRole>} />
            <Route path="/admin/bookings" element={<RequireAuthAndRole role="admin"><AdminBookings /></RequireAuthAndRole>} />
            
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </CartProvider>
    </QueryClientProvider>
  );
};

export default App;
