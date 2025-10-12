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

const API = import.meta.env.VITE_API_BASE?.replace(/\/$/, '') || '';

export async function getWallet(userId: string): Promise<PointsBalance | null> {
  if (!API) {
    const response = await fetch('/fixtures/wallet.json');
    const fixtureData = await response.json();
    const balance = fixtureData.balances.find((b: PointsBalance) => b.userId === userId);
    return balance || null;
  }
  const r = await fetch(`${API}/api/wallet?userId=${encodeURIComponent(userId)}`, {
    credentials: 'include'
  });
  if (!r.ok) return null;
  return (await r.json()) as PointsBalance;
}

export async function getBalance(userId: string): Promise<PointsBalance | null> {
  return getWallet(userId);
}

export async function getTransactions(userId: string): Promise<PointsTransaction[]> {
  if (!API) {
    const response = await fetch('/fixtures/wallet.json');
    const fixtureData = await response.json();
    const transactions = fixtureData.transactions
      .filter((t: { userId: string }) => t.userId === userId)
      .map((t: { id: string; userId: string; amount: number; type: string; description: string; createdAt: string }) => ({
        id: t.id,
        userId: t.userId,
        amount: t.amount,
        type: t.type as "earn" | "spend" | "refund",
        description: t.description,
        createdAt: new Date(t.createdAt)
      }));
    return transactions;
  }

  const r = await fetch(`${API}/api/wallet/transactions?userId=${encodeURIComponent(userId)}`, {
    credentials: 'include'
  });
  if (!r.ok) return [];
  const data = await r.json();
  return data.map((t: { id: string; userId: string; amount: number; type: string; description: string; createdAt: string }) => ({
    id: t.id,
    userId: t.userId,
    amount: t.amount,
    type: t.type as "earn" | "spend" | "refund",
    description: t.description,
    createdAt: new Date(t.createdAt)
  }));
}
