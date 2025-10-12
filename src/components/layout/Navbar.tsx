import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Search, ShoppingCart, User, Heart, MapPin, Crown } from "lucide-react";
import { useState, useEffect } from "react";
import circleNetworkLogo from "@/assets/circle-network-logo.png";
import { supabase } from "@/integrations/supabase/client";

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
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isPro, setIsPro] = useState(false);
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
  return <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4 gap-2">
        {/* Logo */}
        <Link to="/" className="flex items-center space-x-2 flex-shrink-0">
          <img src={circleNetworkLogo} alt="Circle Network" className="h-12 w-auto object-contain" />
          <span className="hidden md:inline font-semibold text-xl">Marketplace</span>
        </Link>

        {/* Search Bar - Always visible */}
        <div className="flex flex-1 max-w-xl">
          <form onSubmit={handleSearch} className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input type="search" placeholder={isMarketplace ? "Search services, vendors, categories..." : "What do you need help with?"} value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="w-full pl-10 pr-4 py-2 rounded-full border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary" />
          </form>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 md:gap-3 flex-shrink-0">
          {user ? (
            <>
              {/* Location */}
              {profile?.location && (
                <div className="hidden lg:flex items-center gap-1.5 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  <span>{profile.location}</span>
                </div>
              )}

               {/* Shopping Cart */}
              <Button variant="ghost" size="icon" className="hidden sm:flex">
                <ShoppingCart className="h-5 w-5" />
              </Button>

              {/* Points */}
              <div className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-muted">
                <Crown className="h-4 w-4 text-yellow-600" />
                <span className="text-sm font-medium">{profile?.points || 0} Points</span>
              </div>

              {/* User Avatar with Pro Badge */}
              <Link to="/profile" className="relative">
                <Avatar className={`h-9 w-9 md:h-10 md:w-10 ${isPro ? 'ring-2 ring-primary ring-offset-2' : ''}`}>
                  <AvatarImage src={profile?.avatar_url || undefined} alt={profile?.full_name || 'User'} />
                  <AvatarFallback>
                    <User className="h-5 w-5" />
                  </AvatarFallback>
                </Avatar>
                {isPro && (
                  <Badge className="absolute -bottom-1 -right-1 px-1.5 py-0 text-[10px] font-bold bg-primary">
                    PRO
                  </Badge>
                )}
              </Link>
            </>
          ) : (
            <>
              <Button variant="ghost" size="icon" className="hidden sm:flex">
                <ShoppingCart className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" asChild>
                <Link to="/profile">
                  <User className="h-5 w-5" />
                </Link>
              </Button>
              <Button asChild className="hidden sm:flex">
                <Link to="/auth">Sign In</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </nav>;
};