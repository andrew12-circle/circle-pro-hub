import { z } from "zod";

export const BookingStatusSchema = z.enum([
  "pending_vendor",
  "confirmed",
  "completed",
  "cancelled",
]);

export const BookingSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  serviceId: z.string().uuid(),
  serviceName: z.string(),
  vendorId: z.string().uuid(),
  vendorName: z.string(),
  packageId: z.string(),
  packageName: z.string(),
  scheduledAt: z.date(),
  status: BookingStatusSchema,
  vendorCalendarLink: z.string().url().optional(),
  ghlNotified: z.boolean().default(false),
  notes: z.string().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const CreateBookingSchema = BookingSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  ghlNotified: true,
}).partial({ notes: true });

export type BookingStatus = z.infer<typeof BookingStatusSchema>;
export type Booking = z.infer<typeof BookingSchema>;
export type CreateBooking = z.infer<typeof CreateBookingSchema>;
