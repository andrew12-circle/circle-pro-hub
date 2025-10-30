import { cache } from "@/adapters/cache";
import { supabase } from "@/integrations/supabase/client";
import type { Booking, CreateBooking } from "../../contracts/bookings";

/**
 * Data layer for bookings
 * Persisted to Supabase with caching
 */

/**
 * Get minimum bookable date (now + 48 hours)
 */
export function getMinimumBookableDate(): Date {
  const minDate = new Date();
  minDate.setHours(minDate.getHours() + 48);
  return minDate;
}

/**
 * Get all bookings (optionally filtered by userId)
 */
export async function getBookings(userId?: string): Promise<Booking[]> {
  return cache.getOrSet(`bookings:${userId || "all"}`, 60, async () => {
    console.info("[Bookings] Loading bookings for:", userId || "all");
    
    let query = supabase
      .from("bookings")
      .select("*")
      .order("scheduled_at", { ascending: false });
    
    if (userId) {
      query = query.eq("user_id", userId);
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error("[Bookings] Error loading bookings:", error);
      throw new Error("Failed to load bookings");
    }
    
    return (data || []).map(dbToBooking);
  });
}

/**
 * Create a new booking
 */
export async function createBooking(data: CreateBooking): Promise<Booking> {
  const status = data.vendorCalendarLink ? "confirmed" : "pending_vendor";
  
  const { data: booking, error } = await supabase
    .from("bookings")
    .insert({
      user_id: data.userId,
      service_id: data.serviceId,
      service_name: data.serviceName,
      vendor_id: data.vendorId,
      vendor_name: data.vendorName,
      package_id: data.packageId,
      package_name: data.packageName,
      scheduled_at: data.scheduledAt.toISOString(),
      status,
      vendor_calendar_link: data.vendorCalendarLink,
      ghl_notified: false,
      notes: data.notes,
    })
    .select()
    .single();
  
  if (error) {
    console.error("[Bookings] Error creating booking:", error);
    throw new Error("Failed to create booking");
  }

  const bookingResult = dbToBooking(booking);

  // If no vendor calendar link, notify GHL synchronously
  if (!data.vendorCalendarLink) {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ghl-booking`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({
            bookingId: bookingResult.id,
            serviceId: bookingResult.serviceId,
            serviceName: bookingResult.serviceName,
            vendorName: bookingResult.vendorName,
            scheduledAt: bookingResult.scheduledAt.toISOString(),
          }),
        }
      );

      if (response.ok) {
        // Mark as notified
        await supabase
          .from("bookings")
          .update({ ghl_notified: true })
          .eq("id", bookingResult.id);
        bookingResult.ghlNotified = true;
      }
    } catch (error) {
      console.error("[Bookings] Failed to notify GHL:", error);
      // Don't fail the booking creation if GHL notification fails
    }
  }

  // Bust cache
  await cache.delete(`bookings:${data.userId}`);
  await cache.delete("bookings:all");

  console.info("[Bookings] Created booking:", bookingResult.id, bookingResult.status);

  return bookingResult;
}

/**
 * Get booking by ID
 */
export async function getBookingById(id: string): Promise<Booking | null> {
  const { data, error } = await supabase
    .from("bookings")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  
  if (error) {
    console.error("[Bookings] Error loading booking:", error);
    return null;
  }
  
  return data ? dbToBooking(data) : null;
}

/**
 * Update booking status (for admin actions)
 */
export async function updateBookingStatus(
  id: string,
  status: Booking["status"]
): Promise<Booking | null> {
  const { data, error } = await supabase
    .from("bookings")
    .update({ status })
    .eq("id", id)
    .select()
    .maybeSingle();
  
  if (error) {
    console.error("[Bookings] Error updating booking status:", error);
    return null;
  }
  
  if (!data) return null;

  const booking = dbToBooking(data);

  // Bust cache
  await cache.delete(`bookings:${booking.userId}`);
  await cache.delete("bookings:all");

  console.info("[Bookings] Updated booking status:", id, status);

  return booking;
}

/**
 * Helper to convert DB row to Booking type
 */
function dbToBooking(row: any): Booking {
  return {
    id: row.id,
    userId: row.user_id,
    serviceId: row.service_id,
    serviceName: row.service_name,
    vendorId: row.vendor_id,
    vendorName: row.vendor_name,
    packageId: row.package_id,
    packageName: row.package_name,
    scheduledAt: new Date(row.scheduled_at),
    status: row.status,
    vendorCalendarLink: row.vendor_calendar_link,
    ghlNotified: row.ghl_notified,
    notes: row.notes,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  };
}
