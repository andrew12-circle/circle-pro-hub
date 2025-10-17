import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { getBookings } from "@/data/bookings";
import { supabase } from "@/integrations/supabase/client";
import type { Booking } from "../../../contracts/bookings";
import { Calendar, User, Package } from "lucide-react";

const Bookings = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAdmin = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/auth");
        return;
      }

      // Check if user has admin role
      const { data: roles } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .eq("role", "admin");

      if (!roles || roles.length === 0) {
        toast({
          title: "Access Denied",
          description: "You don't have permission to access this page",
          variant: "destructive",
        });
        navigate("/");
        return;
      }

      loadBookings();
    };

    checkAdmin();
  }, [navigate, toast]);

  const loadBookings = async () => {
    setLoading(true);
    try {
      const data = await getBookings();
      setBookings(data);
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error("Failed to load bookings:", error);
      }
      toast({
        title: "Error",
        description: "Failed to load bookings",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleReassign = (bookingId: string) => {
    // No-op for now
    toast({
      title: "Reassign (Coming Soon)",
      description: "Booking reassignment will be available soon",
    });
    if (import.meta.env.DEV) {
      console.info("[Admin] Reassign booking:", bookingId);
    }
  };

  const handleCancel = (bookingId: string) => {
    // No-op for now
    toast({
      title: "Cancel (Coming Soon)",
      description: "Booking cancellation will be available soon",
    });
    if (import.meta.env.DEV) {
      console.info("[Admin] Cancel booking:", bookingId);
    }
  };

  const getStatusBadge = (status: Booking["status"]) => {
    const variants: Record<Booking["status"], "default" | "secondary" | "outline" | "destructive"> = {
      pending_vendor: "secondary",
      confirmed: "default",
      completed: "outline",
      cancelled: "destructive",
    };

    return <Badge variant={variants[status]}>{status.replace("_", " ")}</Badge>;
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-12">
        <Card>
          <CardHeader>
            <CardTitle>Bookings Management</CardTitle>
            <CardDescription>
              View and manage all service bookings
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">Loading bookings...</p>
              </div>
            ) : bookings.length === 0 ? (
              <div className="text-center py-8">
                <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No bookings found</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Service</TableHead>
                      <TableHead>Vendor</TableHead>
                      <TableHead>Package</TableHead>
                      <TableHead>Scheduled</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>GHL Notified</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {bookings.map((booking) => (
                      <TableRow key={booking.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Package className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">{booking.serviceName}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-muted-foreground" />
                            <span>{booking.vendorName}</span>
                          </div>
                        </TableCell>
                        <TableCell>{booking.packageName}</TableCell>
                        <TableCell>
                          {format(new Date(booking.scheduledAt), "PPP p")}
                        </TableCell>
                        <TableCell>{getStatusBadge(booking.status)}</TableCell>
                        <TableCell>
                          {booking.ghlNotified ? (
                            <Badge variant="outline">Yes</Badge>
                          ) : (
                            <Badge variant="secondary">No</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleReassign(booking.id)}
                            >
                              Reassign
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleCancel(booking.id)}
                              disabled={booking.status === "cancelled"}
                            >
                              Cancel
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
};

export default Bookings;
