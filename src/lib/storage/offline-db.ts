// src/lib/storage/offline-db.ts
"use client";

import { WaterSourceWithPhotos } from "@/types/water";

const DB_NAME = "irowa_offline_db";
const DB_VERSION = 1;
const STORE_NAME = "water_sources";
const META_STORE = "metadata";

const LOCAL_STORAGE_FALLBACK_KEY = "irowa_offline_sources_cache";
const LOCAL_STORAGE_META_KEY = "irowa_offline_meta";

// Helper to open IndexedDB
function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined" || !window.indexedDB) {
      reject(new Error("IndexedDB not available"));
      return;
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "id" });
      }
      if (!db.objectStoreNames.contains(META_STORE)) {
        db.createObjectStore(META_STORE, { keyPath: "key" });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Save all water sources into offline persistent storage (IndexedDB with LocalStorage fallback)
 */
export async function saveWaterSourcesToOfflineDB(sources: WaterSourceWithPhotos[]): Promise<boolean> {
  if (typeof window === "undefined" || sources.length === 0) return false;

  const timestamp = new Date().toISOString();

  // Always update LocalStorage as instant backup
  try {
    localStorage.setItem(LOCAL_STORAGE_FALLBACK_KEY, JSON.stringify(sources));
    localStorage.setItem(
      LOCAL_STORAGE_META_KEY,
      JSON.stringify({ lastCachedAt: timestamp, count: sources.length })
    );
  } catch {
    // LocalStorage quota may be reached, continue with IndexedDB
  }

  try {
    const db = await openDB();
    return new Promise((resolve) => {
      const tx = db.transaction([STORE_NAME, META_STORE], "readwrite");
      const store = tx.objectStore(STORE_NAME);
      const meta = tx.objectStore(META_STORE);

      // Clear existing records and re-populate
      store.clear();
      for (const item of sources) {
        store.put(item);
      }

      meta.put({ key: "sync_info", lastCachedAt: timestamp, count: sources.length });

      tx.oncomplete = () => resolve(true);
      tx.onerror = () => resolve(false);
    });
  } catch {
    return true; // LocalStorage fallback succeeded
  }
}

/**
 * Get all cached water sources from offline persistent storage
 */
export async function getWaterSourcesFromOfflineDB(): Promise<WaterSourceWithPhotos[]> {
  if (typeof window === "undefined") return [];

  // Try IndexedDB first
  try {
    const db = await openDB();
    const items = await new Promise<WaterSourceWithPhotos[]>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readonly");
      const store = tx.objectStore(STORE_NAME);
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });

    if (items.length > 0) {
      return items;
    }
  } catch {
    // Fall back to LocalStorage
  }

  // Fallback to LocalStorage
  try {
    const cached = localStorage.getItem(LOCAL_STORAGE_FALLBACK_KEY);
    if (cached) {
      return JSON.parse(cached);
    }
  } catch {
    // Ignore parse error
  }

  return [];
}

/**
 * Retrieve offline cache statistics
 */
export async function getOfflineCacheStats(): Promise<{
  cachedCount: number;
  lastCachedAt: string | null;
  isReady: boolean;
}> {
  if (typeof window === "undefined") {
    return { cachedCount: 0, lastCachedAt: null, isReady: false };
  }

  // Check IndexedDB
  try {
    const db = await openDB();
    const meta = await new Promise<any>((resolve) => {
      const tx = db.transaction(META_STORE, "readonly");
      const store = tx.objectStore(META_STORE);
      const request = store.get("sync_info");
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => resolve(null);
    });

    if (meta) {
      return {
        cachedCount: meta.count || 0,
        lastCachedAt: meta.lastCachedAt || null,
        isReady: (meta.count || 0) > 0,
      };
    }
  } catch {
    // Check LocalStorage fallback
  }

  try {
    const metaStr = localStorage.getItem(LOCAL_STORAGE_META_KEY);
    if (metaStr) {
      const parsed = JSON.parse(metaStr);
      return {
        cachedCount: parsed.count || 0,
        lastCachedAt: parsed.lastCachedAt || null,
        isReady: (parsed.count || 0) > 0,
      };
    }
  } catch {
    // Ignore error
  }

  return { cachedCount: 0, lastCachedAt: null, isReady: false };
}

