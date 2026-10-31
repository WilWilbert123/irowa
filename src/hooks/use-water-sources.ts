// src/hooks/use-water-sources.ts
"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { WaterSourceWithPhotos, WaterFilterState } from "@/types/water";
import { getPublishedWaterSources } from "@/lib/services/water-service";
import { calculateDistanceKm } from "@/lib/map/map-utils";
import { useGeolocation } from "./use-geolocation";
import {
  saveWaterSourcesToOfflineDB,
  getWaterSourcesFromOfflineDB,
} from "@/lib/storage/offline-db";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";

export function useWaterSources(filters?: Partial<WaterFilterState>) {
  const [sources, setSources] = useState<WaterSourceWithPhotos[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { location } = useGeolocation();
  const hasInitializedFromCache = useRef(false);

  // 1. Instant Cache-First load from Offline DB (Eliminates lag on startup)
  useEffect(() => {
    if (hasInitializedFromCache.current) return;
    hasInitializedFromCache.current = true;

    async function loadOfflineCache() {
      try {
        const cached = await getWaterSourcesFromOfflineDB();
        if (cached && cached.length > 0) {
          setSources(cached);
          setIsLoading(false);
        }
      } catch {
        // Cache miss, will load from network
      }
    }
    loadOfflineCache();
  }, []);

  const loadSources = useCallback(async () => {
    setError(null);
    try {
      const data = await getPublishedWaterSources(filters);

      if (data && data.length > 0) {
        // Automatically save to local offline DB for lag-free offline usage
        saveWaterSourcesToOfflineDB(data);

        // Augment with distance if user location is available
        if (location) {
          const withDistance = data.map((source) => ({
            ...source,
            distance_km: calculateDistanceKm(
              location.lat,
              location.lng,
              source.latitude,
              source.longitude
            ),
          }));
          setSources(withDistance);
        } else {
          setSources(data);
        }
      } else {
        // If network returns empty or offline, check if we have cached sources
        const cached = await getWaterSourcesFromOfflineDB();
        if (cached.length > 0) {
          setSources(cached);
        }
      }
    } catch (err: any) {
      // Offline fallback: load from offline DB
      try {
        const cached = await getWaterSourcesFromOfflineDB();
        if (cached.length > 0) {
          setSources(cached);
          setError(null);
        } else {
          setError(err.message || "Failed to load water sources");
        }
      } catch {
        setError(err.message || "Failed to load water sources");
      }
    } finally {
      setIsLoading(false);
    }
  }, [filters, location]);

  useEffect(() => {
    loadSources();

    if (!isSupabaseConfigured()) return;

    try {
      const supabase = createClient();
      const channel = supabase
        .channel("realtime_water_sources")
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "water_sources",
          },
          () => {
            loadSources();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    } catch {
      // safe fallback if realtime socket is blocked
    }
  }, [loadSources]);

  return { sources, isLoading, error, refetch: loadSources };
}
