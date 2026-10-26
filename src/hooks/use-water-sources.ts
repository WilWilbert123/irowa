// src/hooks/use-water-sources.ts
"use client";

import { useState, useEffect, useCallback } from "react";
import { WaterSourceWithPhotos, WaterFilterState } from "@/types/water";
import { getPublishedWaterSources } from "@/lib/services/water-service";
import { calculateDistanceKm } from "@/lib/map/map-utils";
import { useGeolocation } from "./use-geolocation";

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
  }, [loadSources]);

  return { sources, isLoading, error, refetch: loadSources };
}
