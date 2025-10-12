import { cache } from "@/adapters/cache";
import { queue } from "@/adapters/queue";
import type { Booking, CreateBooking } from "../../contracts/bookings";

/**
 * Data layer for bookings
 * Reading from fixtures (stub), will be replaced with DB
 */

// In-memory stub storage
const bookingsStore = new Map<string, Booking>();

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
    const allBookings = Array.from(bookingsStore.values());
    
    if (userId) {
      return allBookings.filter((b) => b.userId === userId);
    }
    
    return allBookings;
  });
}

/**
 * Create a new booking
 */
export async function createBooking(data: CreateBooking): Promise<Booking> {
  const booking: Booking = {
    id: crypto.randomUUID(),
    ...data,
    status: data.vendorCalendarLink ? "confirmed" : "pending_vendor",
    ghlNotified: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  bookingsStore.set(booking.id, booking);

  // If no vendor calendar link, notify GHL
  if (!data.vendorCalendarLink) {
    await queue.enqueue({
      type: "ghl_booking_notification",
      payload: {
        bookingId: booking.id,
        serviceId: booking.serviceId,
        serviceName: booking.serviceName,
        vendorName: booking.vendorName,
        scheduledAt: booking.scheduledAt.toISOString(),
      },
    });

    // Mark as notified
    booking.ghlNotified = true;
    bookingsStore.set(booking.id, booking);
  }

  // Bust cache
  cache.delete(`bookings:${data.userId}`);
  cache.delete("bookings:all");

  console.info("[Bookings] Created booking:", booking.id, booking.status);

  return booking;
}

/**
 * Get booking by ID
 */
export async function getBookingById(id: string): Promise<Booking | null> {
  return bookingsStore.get(id) || null;
}

/**
 * Update booking status (for admin actions)
 */
export async function updateBookingStatus(
  id: string,
  status: Booking["status"]
): Promise<Booking | null> {
  const booking = bookingsStore.get(id);
  if (!booking) return null;

  booking.status = status;
  booking.updatedAt = new Date();
  bookingsStore.set(id, booking);

  // Bust cache
  cache.delete(`bookings:${booking.userId}`);
  cache.delete("bookings:all");

  console.info("[Bookings] Updated booking status:", id, status);

  return booking;
}
