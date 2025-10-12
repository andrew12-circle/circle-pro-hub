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
  const response = await fetch('/fixtures/wallet.json');
  const data = await response.json();
  
  const balance = data.balances.find((b: PointsBalance) => b.userId === userId);
  return balance || null;
}

export async function getTransactions(userId: string): Promise<PointsTransaction[]> {
  const response = await fetch('/fixtures/wallet.json');
  const data = await response.json();
  
  const transactions = data.transactions
    .filter((t: any) => t.userId === userId)
    .map((t: any) => ({
      ...t,
      createdAt: new Date(t.createdAt)
    }));
  
  return transactions;
}
