interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

/**
 * Simple in-memory TTL cache.
 * Used for dashboard summary (5-min TTL) and company/branch lookups.
 */
export class TTLCache<T = unknown> {
  private store = new Map<string, CacheEntry<T>>();
  private defaultTtlMs: number;

  constructor(defaultTtlSeconds = 300) {
    this.defaultTtlMs = defaultTtlSeconds * 1000;
  }

  get(key: string): T | undefined {
    const entry = this.store.get(key);
    if (!entry) return undefined;
    if (Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return undefined;
    }
    return entry.value;
  }

  set(key: string, value: T, ttlSeconds?: number): void {
    const ttlMs = (ttlSeconds ?? this.defaultTtlMs / 1000) * 1000;
    this.store.set(key, {
      value,
      expiresAt: Date.now() + ttlMs,
    });
  }

  delete(key: string): boolean {
    return this.store.delete(key);
  }

  invalidate(): void {
    this.store.clear();
  }

  get size(): number {
    return this.store.size;
  }
}

/** Shared dashboard summary cache instance */
export const dashboardCache = new TTLCache(
  parseInt(process.env.CACHE_TTL ?? "300", 10),
);

/** Cache for company/branch existence lookups — 24h TTL (static reference data) */
export const companyBranchCache = new TTLCache(86400);
