// src/hooks/use-water-sources.ts
"use client";

import { useState, useEffect, useCallback } from "react";
import { WaterSourceWithPhotos, WaterFilterState } from "@/types/water";
import { getPublishedWaterSources } from "@/lib/services/water-service";
import { calculateDistanceKm } from "@/lib/map/map-utils";
import { useGeolocation } from "./use-geolocation";

import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";

export function useWaterSources(filters?: Partial<WaterFilterState>) {
  const [sources, setSources] = useState<WaterSourceWithPhotos[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { location } = useGeolocation();

  const loadSources = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getPublishedWaterSources(filters);
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
    } catch (err: any) {
      setError(err.message || "Failed to load water sources");
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
