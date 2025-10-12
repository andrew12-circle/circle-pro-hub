export interface Booking {
  id: string;
  userId: string;
  serviceId: string;
  vendorId: string;
  status: "pending" | "confirmed" | "completed" | "cancelled";
  scheduledAt: Date;
  createdAt: Date;
}

export async function createBooking(data: Omit<Booking, "id" | "createdAt">): Promise<Booking> {
  // TODO: Implement - enqueue job, return immediately
  throw new Error("Not implemented");
}

export async function getBookings(userId: string): Promise<Booking[]> {
  // TODO: Implement
  throw new Error("Not implemented");
}
