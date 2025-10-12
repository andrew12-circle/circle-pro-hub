/**
 * Database adapter (env-switchable)
 * Primary source controlled by DB_PRIMARY env var
 */

type DbSource = "fixtures" | "supabase";

const DB_PRIMARY: DbSource = 
  (import.meta.env.VITE_DB_PRIMARY as DbSource) || "fixtures";

export interface DbAdapter {
  query<T>(sql: string, params?: unknown[]): Promise<T[]>;
  execute(sql: string, params?: unknown[]): Promise<void>;
}

class FixturesDbAdapter implements DbAdapter {
  async query<T>(): Promise<T[]> {
    throw new Error("Fixtures DB: query not implemented");
  }
  async execute(): Promise<void> {
    throw new Error("Fixtures DB: execute not implemented");
  }
}

class SupabaseDbAdapter implements DbAdapter {
  async query<T>(): Promise<T[]> {
    throw new Error("Supabase DB: query not implemented");
  }
  async execute(): Promise<void> {
    throw new Error("Supabase DB: execute not implemented");
  }
}

export const db: DbAdapter = 
  DB_PRIMARY === "supabase" ? new SupabaseDbAdapter() : new FixturesDbAdapter();
