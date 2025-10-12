export interface PointsBalance {
  userId: string;
  points: number;
  currency: string;
}

export interface PointsTransaction {
  id: string;
  userId: string;
  amount: number;
  type: "earn" | "spend" | "refund";
  description: string;
  createdAt: Date;
}

export async function getBalance(userId: string): Promise<PointsBalance | null> {
  // TODO: Implement
  throw new Error("Not implemented");
}

export async function getTransactions(userId: string): Promise<PointsTransaction[]> {
  // TODO: Implement
  throw new Error("Not implemented");
}
