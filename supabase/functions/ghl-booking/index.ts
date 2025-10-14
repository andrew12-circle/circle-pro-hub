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
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("[GHL Booking] Webhook received");

    const payload: BookingPayload = await req.json();
    
    const ghlApiKey = Deno.env.get("GHL_API_KEY");
    const ghlLocationId = Deno.env.get("GHL_LOCATION_ID");
    const ghlPipelineId = Deno.env.get("GHL_PIPELINE_ID");

    if (!ghlApiKey || !ghlLocationId || !ghlPipelineId) {
      console.error("[GHL Booking] Missing GHL configuration");
      throw new Error("GHL integration not properly configured");
    }

    console.log("[GHL Booking] Processing notification:", {
      bookingId: payload.bookingId,
      service: payload.serviceName,
      vendor: payload.vendorName,
      scheduledAt: payload.scheduledAt,
    });

    // Create opportunity in GHL
    const opportunityData = {
      pipelineId: ghlPipelineId,
      locationId: ghlLocationId,
      name: `${payload.serviceName} - ${payload.vendorName}`,
      monetaryValue: 0,
      status: "open",
      customFields: [
        {
          key: "booking_id",
          value: payload.bookingId,
        },
        {
          key: "service_name",
          value: payload.serviceName,
        },
        {
          key: "vendor_name",
          value: payload.vendorName,
        },
        {
          key: "scheduled_at",
          value: payload.scheduledAt,
        },
      ],
    };

    console.log("[GHL Booking] Creating opportunity in GHL");

    const ghlResponse = await fetch(
      "https://services.leadconnectorhq.com/opportunities/",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${ghlApiKey}`,
          "Content-Type": "application/json",
          Version: "2021-07-28",
        },
        body: JSON.stringify(opportunityData),
      }
    );

    if (!ghlResponse.ok) {
      const errorText = await ghlResponse.text();
      console.error("[GHL Booking] GHL API error:", errorText);
      throw new Error(`GHL API error: ${ghlResponse.status} - ${errorText}`);
    }

    const ghlResult = await ghlResponse.json();
    console.log("[GHL Booking] Opportunity created:", ghlResult);

    return new Response(
      JSON.stringify({
        success: true,
        opportunityId: ghlResult.id,
        message: "Booking notification processed successfully",
        timestamp: new Date().toISOString(),
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
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
