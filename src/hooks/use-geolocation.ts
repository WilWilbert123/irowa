// src/hooks/use-geolocation.ts
"use client";

import { useState, useCallback } from "react";
import { getCurrentUserLocation, GeolocationPosition } from "@/lib/map/geolocation";

export function useGeolocation() {
  const [location, setLocation] = useState<GeolocationPosition | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const requestLocation = useCallback(async () => {
    setIsLocating(true);
    setError(null);
    try {
      const pos = await getCurrentUserLocation();
      setLocation(pos);
      return pos;
    } catch (err: any) {
      setError(err.message || "Failed to get location");
      return null;
    } finally {
      setIsLocating(false);
    }
  }, []);

  return {
    location,
    isLocating,
    error,
    requestLocation,
    clearLocation: () => setLocation(null),
  };
}
