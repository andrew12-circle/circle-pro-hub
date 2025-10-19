import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Search, ShoppingCart, User as UserIcon, Heart, Crown, Home, Menu, Shield, CreditCard, Settings, LogOut } from "lucide-react";
import { useState, useEffect } from "react";
import circleNetworkLogo from "@/assets/circle-network-logo.png";
import { supabase } from "@/integrations/supabase/client";
import type { User } from "@supabase/supabase-js";
import { LocationSelector } from "./LocationSelector";
import { useCart } from "@/lib/cartStore";
import { useAdminRole } from "@/hooks/use-admin-role";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface UserProfile {
  full_name: string | null;
  avatar_url: string | null;
  location: string | null;
  points: number;
}

interface UserRole {
  role: 'admin' | 'pro' | 'user';
}
export const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState("");
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isPro, setIsPro] = useState(false);
  const { itemCount } = useCart();
  const { isAdmin } = useAdminRole();
  const isMarketplace = location.pathname === "/marketplace";

  // Check authentication state
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Fetch user profile and role
  useEffect(() => {
    if (user) {
      const fetchUserData = async () => {
        // Fetch profile
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (profileData) {
          setProfile(profileData);
        }

        // Check if user has pro role
        const { data: roleData } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id)
          .eq('role', 'pro')
          .maybeSingle();

        setIsPro(!!roleData);
      };

      fetchUserData();
    } else {
      setProfile(null);
      setIsPro(false);
    }
  }, [user]);

  // Initialize search from URL params on marketplace page
  useEffect(() => {
    if (isMarketplace) {
      setSearchQuery(searchParams.get("search") || "");
    }
  }, [isMarketplace, searchParams]);
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (isMarketplace) {
      // Update URL params on marketplace page
      const params = new URLSearchParams(searchParams);
      if (searchQuery.trim()) {
        params.set("search", searchQuery.trim());
      } else {
        params.delete("search");
      }
      navigate(`/marketplace?${params.toString()}`, {
        replace: true
      });
    } else {
      // Navigate to marketplace with search query
      if (searchQuery.trim()) {
        navigate(`/marketplace?search=${encodeURIComponent(searchQuery.trim())}`);
      } else {
        navigate("/marketplace");
      }
    }
  };
  return (
    <>
      <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between px-4">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <img src={circleNetworkLogo} alt="Circle Network" className="h-12 w-auto object-contain" />
            <span className="font-semibold text-xl hidden md:inline">Marketplace</span>
          </Link>

          {/* Search Bar - Full width on mobile */}
          <div className="flex flex-1 max-w-xl mx-4 md:mx-8">
            <form onSubmit={handleSearch} className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input 
                type="search" 
                placeholder={isMarketplace ? "Search services, vendors, categories..." : "What do you need help with?"} 
                value={searchQuery} 
                onChange={e => setSearchQuery(e.target.value)} 
                className="w-full pl-10 pr-4 py-2 rounded-full border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary text-xs md:text-sm placeholder:text-xs md:placeholder:text-sm" 
              />
            </form>
          </div>

          {/* Actions - Hidden on mobile (will be in bottom nav) */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <>
                {/* Admin Link - Only visible to admins */}
                {isAdmin && (
                  <Button variant="ghost" size="icon" asChild>
                    <Link to="/admin">
                      <Shield className="h-5 w-5" />
                    </Link>
                  </Button>
                )}

                {/* Location Selector */}
                <LocationSelector />

                {/* Shopping Cart */}
                <Button variant="ghost" size="icon" asChild className="relative">
                  <Link to="/cart">
                    <ShoppingCart className="h-5 w-5" />
                    {itemCount > 0 && (
                      <Badge 
                        className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
                      >
                        {itemCount}
                      </Badge>
                    )}
                  </Link>
                </Button>

                {/* Points */}
                <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-muted">
                  <Crown className="h-4 w-4 text-yellow-600" />
                  <span className="text-sm font-medium">{profile?.points || 0} Points</span>
                </div>

                {/* User Avatar with Pro Badge */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="relative focus:outline-none">
                      <Avatar className={`h-10 w-10 cursor-pointer ${isPro ? 'ring-2 ring-primary ring-offset-2' : ''}`}>
                        <AvatarImage src={profile?.avatar_url || undefined} alt={profile?.full_name || 'User'} />
                        <AvatarFallback>
                          <UserIcon className="h-5 w-5" />
                        </AvatarFallback>
                      </Avatar>
                      {isPro && (
                        <Badge className="absolute -bottom-1 -right-1 px-1.5 py-0 text-[10px] font-bold bg-primary">
                          PRO
                        </Badge>
                      )}
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium">{profile?.full_name || 'User'}</p>
                        <p className="text-xs text-muted-foreground">{user?.email}</p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link to="/profile" className="cursor-pointer">
                        <Settings className="mr-2 h-4 w-4" />
                        Profile Settings
                      </Link>
                    </DropdownMenuItem>
                    {isAdmin && (
                      <DropdownMenuItem asChild>
                        <Link to="/admin" className="cursor-pointer">
                          <Shield className="mr-2 h-4 w-4" />
                          Admin Dashboard
                        </Link>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem asChild>
                      <Link to="/wallet" className="cursor-pointer">
                        <CreditCard className="mr-2 h-4 w-4" />
                        Billing & Points
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      onClick={async () => {
                        await supabase.auth.signOut();
                        navigate("/");
                      }}
                      className="cursor-pointer text-destructive focus:text-destructive"
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <>
                <Button variant="ghost" size="icon" asChild>
                  <Link to="/marketplace">
                    <Search className="h-5 w-5" />
                  </Link>
                </Button>
                <Button variant="ghost" size="icon" asChild>
                  <Link to="/saved">
                    <Heart className="h-5 w-5" />
                  </Link>
                </Button>
                <Button variant="ghost" size="icon" asChild className="relative">
                  <Link to="/cart">
                    <ShoppingCart className="h-5 w-5" />
                    {itemCount > 0 && (
                      <Badge 
                        className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
                      >
                        {itemCount}
                      </Badge>
                    )}
                  </Link>
                </Button>
                <Button variant="ghost" size="icon" asChild>
                  <Link to="/profile">
                    <UserIcon className="h-5 w-5" />
                  </Link>
                </Button>
                <Button asChild>
                  <Link to="/auth">Sign In</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Bottom Navigation - Mobile Only */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-background border-t">
        <div className="flex items-center justify-around h-14 px-2">
          <Link 
            to="/" 
            className={`flex items-center justify-center p-3 ${location.pathname === '/' ? 'text-primary' : 'text-muted-foreground'}`}
          >
            <Home className="h-6 w-6" />
          </Link>

          {/* Admin Link - Mobile - Only visible to admins */}
          {isAdmin && (
            <Link 
              to="/admin" 
              className={`flex items-center justify-center p-3 ${location.pathname === '/admin' ? 'text-primary' : 'text-muted-foreground'}`}
            >
              <Shield className="h-6 w-6" />
            </Link>
          )}

          <Link 
            to="/profile" 
            className={`flex items-center justify-center p-3 relative ${location.pathname === '/profile' ? 'text-primary' : 'text-muted-foreground'}`}
          >
            {user && profile?.avatar_url ? (
              <Avatar className={`h-6 w-6 ${isPro ? 'ring-1 ring-primary' : ''}`}>
                <AvatarImage src={profile.avatar_url} alt={profile.full_name || 'User'} />
                <AvatarFallback>
                  <UserIcon className="h-4 w-4" />
                </AvatarFallback>
              </Avatar>
            ) : (
              <UserIcon className="h-6 w-6" />
            )}
          </Link>

          <Link 
            to="/cart" 
            className="flex items-center justify-center p-3 text-muted-foreground relative"
          >
            <ShoppingCart className="h-6 w-6" />
            {itemCount > 0 && (
              <Badge 
                className="absolute top-1 right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
              >
                {itemCount}
              </Badge>
            )}
          </Link>

          <button className="flex items-center justify-center p-3 text-muted-foreground">
            <Menu className="h-6 w-6" />
          </button>
        </div>
      </div>
    </>
  );
};