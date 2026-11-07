// src/lib/cache/admin-cache.ts
/**
 * In-memory client cache with Stale-While-Revalidate (SWR) support.
 * Enables 0ms instantaneous page transitions across all admin dashboard views.
 */

type CacheEntry<T> = {
  data: T;
  timestamp: number;
};

// Global in-memory cache map for admin session data
const memoryCache = new Map<string, CacheEntry<unknown>>();

export const ADMIN_CACHE_KEYS = {
  OVERVIEW_METRICS: "admin_overview_metrics",
  OVERVIEW_REPORTS: "admin_overview_reports",
  WATER_SOURCES: "admin_water_sources",
  SUBMISSIONS: "admin_submissions",
  REPORTS: "admin_reports",
  CHAT_ROOMS: "admin_chat_rooms",
  CHAT_FLAGGED: "admin_chat_flagged",
  ANNOUNCEMENTS: "admin_announcements",
  USERS: "admin_users",
  ANALYTICS: "admin_analytics",
  AUDIT_LOGS: "admin_audit_logs",
  SETTINGS: "admin_settings",
} as const;

/**
 * Retrieve cached data for instant initial rendering.
 * Uses in-memory cache to guarantee 0ms instantaneous client transitions
 * without causing SSR/hydration mismatches on page reloads.
 * @param key Unique cache key
 * @param maxAgeMs Maximum age in ms (default 5 minutes). Even if older, returned for SWR.
 */
export function getAdminCache<T>(key: string, maxAgeMs = 300_000): T | null {
  if (typeof window === "undefined") return null;

  const entry = memoryCache.get(key) as CacheEntry<T> | undefined;
  if (!entry) return null;

  return entry.data;
}

/**
 * Cache fresh data in memory for instant sidebar switching.
 */
export function setAdminCache<T>(key: string, data: T): void {
  if (typeof window === "undefined" || data === undefined || data === null) return;

  const entry: CacheEntry<T> = {
    data,
    timestamp: Date.now(),
  };

  memoryCache.set(key, entry);
}

/**
 * Invalidate cached items by key or prefix when mutations occur.
 */
export function invalidateAdminCache(prefix?: string): void {
  if (!prefix) {
    memoryCache.clear();
    return;
  }

  for (const key of memoryCache.keys()) {
    if (key.startsWith(prefix)) {
      memoryCache.delete(key);
    }
  }
}

