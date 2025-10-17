import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { format } from "date-fns";
import { CalendarIcon, Clock } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { getServiceById } from "@/data/services";
import { createBooking, getMinimumBookableDate } from "@/data/bookings";
import { getCurrentUser } from "@/data/auth";
import { ServiceFunnel } from "../../../contracts/marketplace";

const Book = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  
  const serviceIdParam = searchParams.get("serviceId");
  const packageIdParam = searchParams.get("packageId");

  const [service, setService] = useState<ServiceFunnel | null>(null);
  const [selectedPackageId, setSelectedPackageId] = useState<string>(packageIdParam || "");
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  const minDate = getMinimumBookableDate();

  useEffect(() => {
    const loadUser = async () => {
      const user = await getCurrentUser();
      if (!user) {
        toast({
          title: "Authentication Required",
          description: "Please log in to book a service",
          variant: "destructive",
        });
        navigate("/auth");
        return;
      }
      setUserId(user.id);
    };

    loadUser();
  }, [navigate, toast]);

  useEffect(() => {
    const loadService = async () => {
      if (!serviceIdParam) {
        navigate("/services");
        return;
      }

      const result = await getServiceById(serviceIdParam);
      setService(result);

      if (result && packageIdParam) {
        setSelectedPackageId(packageIdParam);
      } else if (result?.packages.length) {
        setSelectedPackageId(result.packages[0].id);
      }
    };

    loadService();
  }, [serviceIdParam, packageIdParam, navigate]);

  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 8; hour <= 20; hour++) {
      for (let min = 0; min < 60; min += 30) {
        const timeStr = `${hour.toString().padStart(2, "0")}:${min.toString().padStart(2, "0")}`;
        slots.push(timeStr);
      }
    }
    return slots;
  };

  const handleSubmit = async () => {
    if (!userId || !service || !selectedPackageId || !selectedDate || !selectedTime) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    // Combine date and time
    const [hours, minutes] = selectedTime.split(":").map(Number);
    const scheduledDateTime = new Date(selectedDate);
    scheduledDateTime.setHours(hours, minutes, 0, 0);

    // Validate 48h minimum
    if (scheduledDateTime < minDate) {
      toast({
        title: "Invalid Date",
        description: "Bookings must be at least 48 hours in advance",
        variant: "destructive",
      });
      return;
    }

    const selectedPackage = service.packages.find((p) => p.id === selectedPackageId);
    if (!selectedPackage) return;

    setLoading(true);

    try {
      const booking = await createBooking({
        userId,
        serviceId: service.id,
        serviceName: service.name,
        vendorId: service.vendor.id,
        vendorName: service.vendor.name,
        packageId: selectedPackage.id,
        packageName: selectedPackage.name,
        scheduledAt: scheduledDateTime,
        status: "pending_vendor",
        vendorCalendarLink: service.vendor.calendarLink,
        notes: notes.trim() || undefined,
      });

      // If vendor has calendar link, redirect there
      if (service.vendor.calendarLink) {
        toast({
          title: "Redirecting to Calendar",
          description: "Opening vendor's booking calendar...",
        });
        window.open(service.vendor.calendarLink, "_blank");
      }

      toast({
        title: "Booking Created",
        description: booking.status === "confirmed" 
          ? "Your booking has been confirmed!"
          : "Your booking request has been submitted. We'll confirm with the vendor shortly.",
      });

      navigate("/profile");
    } catch (error) {
      console.error("Booking failed:", error);
      toast({
        title: "Booking Failed",
        description: "Failed to create booking. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!service) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <p>Loading...</p>
        </main>
        <Footer />
      </div>
    );
  }

  const selectedPackage = service.packages.find((p) => p.id === selectedPackageId);
  const timeSlots = generateTimeSlots();

  // Safety check for invalid package selection
  if (!selectedPackage) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 container mx-auto px-4 py-12">
          <Card>
            <CardHeader>
              <CardTitle>Package Not Found</CardTitle>
              <CardDescription>The selected package is not available.</CardDescription>
            </CardHeader>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Schedule Your Service</CardTitle>
              <CardDescription>
                Book {service.name} with {service.vendor.name}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Package Selection */}
              {service.packages.length > 1 && (
                <div className="space-y-2">
                  <Label>Select Package</Label>
                  <Select value={selectedPackageId} onValueChange={setSelectedPackageId}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {service.packages.map((pkg) => (
                        <SelectItem key={pkg.id} value={pkg.id}>
                          {pkg.name} - ${pkg.pricing.retail.amount.toLocaleString()}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Date Selection */}
              <div className="space-y-2">
                <Label>Select Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !selectedDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {selectedDate ? format(selectedDate, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={setSelectedDate}
                      disabled={(date) => date < minDate}
                      initialFocus
                      className="pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
                <p className="text-xs text-muted-foreground">
                  Minimum 48 hours advance booking required
                </p>
              </div>

              {/* Time Selection */}
              <div className="space-y-2">
                <Label>Select Time</Label>
                <Select value={selectedTime} onValueChange={setSelectedTime}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a time slot">
                      <div className="flex items-center">
                        <Clock className="mr-2 h-4 w-4" />
                        {selectedTime || "Select time"}
                      </div>
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {timeSlots.map((slot) => (
                      <SelectItem key={slot} value={slot}>
                        {slot}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Notes */}
              <div className="space-y-2">
                <Label htmlFor="notes">Additional Notes (Optional)</Label>
                <Textarea
                  id="notes"
                  placeholder="Any special requests or information..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={4}
                />
              </div>

              {/* Summary */}
              {selectedPackage && selectedDate && selectedTime && (
                <Card className="bg-muted">
                  <CardContent className="pt-6 space-y-2">
                    <h4 className="font-semibold">Booking Summary</h4>
                    <div className="space-y-1 text-sm">
                      <p>
                        <span className="text-muted-foreground">Service:</span>{" "}
                        {service.name}
                      </p>
                      <p>
                        <span className="text-muted-foreground">Package:</span>{" "}
                        {selectedPackage.name}
                      </p>
                      <p>
                        <span className="text-muted-foreground">When:</span>{" "}
                        {format(selectedDate, "PPP")} at {selectedTime}
                      </p>
                      <p>
                        <span className="text-muted-foreground">Price:</span> $
                        {selectedPackage.pricing.retail.amount.toLocaleString()}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Actions */}
              <div className="flex gap-4">
                <Button onClick={handleSubmit} disabled={loading} className="flex-1">
                  {loading ? "Creating Booking..." : "Confirm Booking"}
                </Button>
                <Button variant="outline" onClick={() => navigate(-1)}>
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Book;
