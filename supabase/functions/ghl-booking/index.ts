import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface BookingPayload {
  bookingId: string;
  serviceId: string;
  serviceName: string;
  vendorName: string;
  scheduledAt: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("[GHL Booking] Webhook received");

    const payload: BookingPayload = await req.json();

    console.log("[GHL Booking] Processing notification:", {
      bookingId: payload.bookingId,
      service: payload.serviceName,
      vendor: payload.vendorName,
      scheduledAt: payload.scheduledAt,
    });

    // In production, this would:
    // 1. Authenticate with GHL API
    // 2. Create a task/opportunity in GHL
    // 3. Notify appropriate team members
    // 4. Update booking record with GHL reference ID

    // Mock response for now
    const mockResponse = {
      success: true,
      ghlTaskId: `GHL-${Date.now()}`,
      message: "Booking notification processed successfully",
      timestamp: new Date().toISOString(),
    };

    console.log("[GHL Booking] Mock notification sent:", mockResponse);

    return new Response(JSON.stringify(mockResponse), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("[GHL Booking] Error:", error);

    return new Response(
      JSON.stringify({
        error: "Failed to process booking notification",
        details: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
