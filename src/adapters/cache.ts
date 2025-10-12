/**
 * Cache adapter (env-switchable)
 * Disabled by default, uses in-memory when enabled
 */

const CACHE_ENABLED = import.meta.env.VITE_CACHE_ENABLED === "true";

export interface CacheAdapter {
  get<T>(key: string): Promise<T | null>;
  set<T>(key: string, value: T, ttlSeconds?: number): Promise<void>;
  delete(key: string): Promise<void>;
  getOrSet<T>(
    key: string,
    ttl: number,
    loader: () => Promise<T>
  ): Promise<T>;
}

class InMemoryCacheAdapter implements CacheAdapter {
  private store = new Map<string, { value: unknown; expires: number }>();

  async get<T>(key: string): Promise<T | null> {
    const entry = this.store.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expires) {
      this.store.delete(key);
      return null;
    }
    return entry.value as T;
  }

  async set<T>(key: string, value: T, ttlSeconds = 60): Promise<void> {
    this.store.set(key, {
      value,
      expires: Date.now() + ttlSeconds * 1000,
    });
  }

  async delete(key: string): Promise<void> {
    this.store.delete(key);
  }

  async getOrSet<T>(
    key: string,
    ttl: number,
    loader: () => Promise<T>
  ): Promise<T> {
    const cached = await this.get<T>(key);
    if (cached !== null) return cached;
    const value = await loader();
    await this.set(key, value, ttl);
    return value;
  }
}

class NoOpCacheAdapter implements CacheAdapter {
  async get<T>(): Promise<T | null> {
    return null;
  }
  async set<T>(): Promise<void> {}
  async delete(): Promise<void> {}
  async getOrSet<T>(_key: string, _ttl: number, loader: () => Promise<T>): Promise<T> {
    return loader();
  }
}

export const cache: CacheAdapter = CACHE_ENABLED
  ? new InMemoryCacheAdapter()
  : new NoOpCacheAdapter();
