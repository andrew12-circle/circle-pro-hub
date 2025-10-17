import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import type { User } from "@supabase/supabase-js";
import { useToast } from "@/hooks/use-toast";
import { MapPin, Crown, User as UserIcon, Mail, LogOut, Camera, CreditCard } from "lucide-react";
import { createCustomerPortalSession } from "@/data/stripe";

const Profile = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [isPro, setIsPro] = useState(false);
  const [profile, setProfile] = useState({
    full_name: "",
    location: "",
    avatar_url: "",
    points: 0,
  });
  const [detectingLocation, setDetectingLocation] = useState(false);
  const [loadingPortal, setLoadingPortal] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate("/auth");
        return;
      }

      setUser(session.user);

      // Fetch profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();

      if (profileData) {
        setProfile({
          full_name: profileData.full_name || "",
          location: profileData.location || "",
          avatar_url: profileData.avatar_url || "",
          points: profileData.points || 0,
        });
        
        // Auto-detect location if not set
        if (!profileData.location) {
          autoDetectLocation(session.user.id);
        }
      }

      // Check pro status
      const { data: roleData } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', session.user.id)
        .eq('role', 'pro')
        .maybeSingle();

      setIsPro(!!roleData);
      setLoading(false);
    };

    checkUser();

    // Show upgrade success toast
    if (searchParams.get('upgrade') === 'success') {
      setTimeout(() => {
        toast({
          title: "Welcome to Pro!",
          description: "Your Pro benefits are now active. Enjoy exclusive features!",
        });
      }, 500);
    }
  }, [navigate, searchParams, toast]);

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    setUploading(true);

    try {
      // Use storage adapter (handles validation + presigned upload)
      const { storage } = await import('@/adapters/storage');
      const { generateSafeFilename } = await import('@/lib/fileValidation');
      
      // Delete old avatar if exists
      if (profile.avatar_url) {
        try {
          const oldPath = profile.avatar_url.split('/avatars/').pop();
          if (oldPath) {
            await storage.delete(oldPath, 'avatars');
          }
        } catch (err) {
          // Ignore delete errors (file might not exist)
          if (import.meta.env.DEV) {
            console.warn('Failed to delete old avatar:', err);
          }
        }
      }

      // Upload new avatar via storage adapter
      const filePath = generateSafeFilename(file.name, user.id);
      const uploaded = await storage.upload(file, filePath, 'avatars');

      // Update profile with new URL
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: uploaded.url })
        .eq('id', user.id);

      if (updateError) throw updateError;

      setProfile({ ...profile, avatar_url: uploaded.url });
      
      toast({
        title: "Success",
        description: "Profile picture updated successfully!",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to upload profile picture",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    if (!user) return;

    setSaving(true);
    const { error } = await supabase
      .from('profiles')
      .update({
        full_name: profile.full_name,
        location: profile.location,
      })
      .eq('id', user.id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Profile updated successfully!",
      });
    }
    setSaving(false);
  };

  const autoDetectLocation = async (userId: string) => {
    if (!navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${position.coords.latitude}&lon=${position.coords.longitude}&format=json`
          );
          const data = await response.json();
          
          const city = data.address?.city || data.address?.town || data.address?.village || '';
          const state = data.address?.state || '';
          const location = city && state ? `${city}, ${state}` : data.display_name;
          
          // Auto-save the detected location
          await supabase
            .from('profiles')
            .update({ location })
            .eq('id', userId);
          
          setProfile(prev => ({ ...prev, location }));
        } catch (error) {
          // Silently fail for auto-detection
        }
      },
      () => {
        // Silently fail if location access denied
      }
    );
  };

  const handleDetectLocation = async () => {
    if (!user) return;
    
    if (!navigator.geolocation) {
      toast({
        title: "Error",
        description: "Geolocation is not supported by your browser",
        variant: "destructive",
      });
      return;
    }

    setDetectingLocation(true);
    
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          // Use reverse geocoding to get city, state from coordinates
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${position.coords.latitude}&lon=${position.coords.longitude}&format=json`
          );
          const data = await response.json();
          
          const city = data.address?.city || data.address?.town || data.address?.village || '';
          const state = data.address?.state || '';
          const location = city && state ? `${city}, ${state}` : data.display_name;
          
          setProfile({ ...profile, location });
          
          toast({
            title: "Location detected",
            description: `Set to ${location}`,
          });
        } catch (error) {
          toast({
            title: "Error",
            description: "Failed to detect location. Please enter manually.",
            variant: "destructive",
          });
        } finally {
          setDetectingLocation(false);
        }
      },
      (error) => {
        toast({
          title: "Error",
          description: "Unable to access your location. Please enable location services.",
          variant: "destructive",
        });
        setDetectingLocation(false);
      }
    );
  };

  const handleManageSubscription = async () => {
    setLoadingPortal(true);
    try {
      const { url } = await createCustomerPortalSession();
      window.location.href = url;
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to open subscription management",
        variant: "destructive",
      });
      setLoadingPortal(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <p>Loading...</p>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 container px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Profile Settings</h1>
          <p className="text-muted-foreground">Manage your account and preferences</p>
        </div>

        <div className="grid gap-6">
          {/* Profile Overview Card */}
          <Card>
            <CardHeader>
              <CardTitle>Profile Overview</CardTitle>
              <CardDescription>Your public profile information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-6">
                <div className="relative group cursor-pointer" onClick={handleAvatarClick}>
                  <Avatar className={`h-24 w-24 ${isPro ? 'ring-4 ring-primary ring-offset-4' : ''}`}>
                    <AvatarImage src={profile.avatar_url} alt={profile.full_name} />
                    <AvatarFallback className="text-2xl">
                      <UserIcon className="h-12 w-12" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                    {uploading ? (
                      <span className="text-white text-xs">Uploading...</span>
                    ) : (
                      <Camera className="h-8 w-8 text-white" />
                    )}
                  </div>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  className="hidden"
                  disabled={uploading}
                />
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl font-semibold">{profile.full_name || "No name set"}</h3>
                    {isPro && (
                      <Badge className="bg-primary">
                        <Crown className="h-3 w-3 mr-1" />
                        PRO Member
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Mail className="h-4 w-4" />
                      {user?.email}
                    </div>
                    {profile.location && (
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {profile.location}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Crown className="h-4 w-4 text-yellow-600" />
                    <span className="font-medium">{profile.points} Points</span>
                    <Button
                      variant="link"
                      size="sm"
                      className="h-auto p-0 text-xs"
                      onClick={() => navigate("/account/wallet")}
                    >
                      View Wallet →
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Edit Profile Card */}
          <Card>
            <CardHeader>
              <CardTitle>Edit Profile</CardTitle>
              <CardDescription>Update your profile information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="full_name">Full Name</Label>
                <Input
                  id="full_name"
                  value={profile.full_name}
                  onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                  placeholder="Your full name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">
                  Location <span className="text-xs text-muted-foreground">(Important for local service recommendations)</span>
                </Label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="location"
                      value={profile.location}
                      onChange={(e) => setProfile({ ...profile, location: e.target.value })}
                      placeholder="e.g., Franklin, Tennessee"
                      className="pl-10"
                    />
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleDetectLocation}
                    disabled={detectingLocation}
                  >
                    {detectingLocation ? "Detecting..." : "Auto-detect"}
                  </Button>
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <Button onClick={handleSave} disabled={saving}>
                  {saving ? "Saving..." : "Save Changes"}
                </Button>
                <Button variant="outline" onClick={handleSignOut}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Subscription Management Card */}
          {isPro && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Subscription Management
                </CardTitle>
                <CardDescription>Manage your PRO subscription and billing</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-accent rounded-lg">
                  <div>
                    <p className="font-medium">PRO Membership</p>
                    <p className="text-sm text-muted-foreground">Active subscription</p>
                  </div>
                  <Badge className="bg-green-600">
                    Active
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  Access the Stripe Customer Portal to update your payment method, view billing history, or cancel your subscription.
                </p>
                <Button 
                  onClick={handleManageSubscription}
                  disabled={loadingPortal}
                  className="w-full"
                >
                  {loadingPortal ? "Loading..." : "Manage Subscription"}
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Pro Membership Card */}
          {!isPro && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Crown className="h-5 w-5 text-yellow-600" />
                  Upgrade to PRO
                </CardTitle>
                <CardDescription>Get exclusive benefits and priority support</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 mb-4">
                  <li className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-primary" />
                    <span>Exclusive PRO badge on your profile</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-primary" />
                    <span>Priority customer support</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-primary" />
                    <span>Access to PRO-only deals and vendors</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-primary" />
                    <span>Early access to new features</span>
                  </li>
                </ul>
                <Button onClick={() => navigate('/pricing')}>Upgrade to PRO</Button>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Profile;
