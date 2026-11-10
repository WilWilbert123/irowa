// src/hooks/use-geolocation.ts
"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { getCurrentUserLocation, GeolocationPosition } from "@/lib/map/geolocation";

export function useGeolocation() {
  const [location, setLocation] = useState<GeolocationPosition | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [isWatching, setIsWatching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const watchIdRef = useRef<number | null>(null);

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

  const stopWatching = useCallback(() => {
    if (watchIdRef.current !== null && typeof navigator !== "undefined" && navigator.geolocation) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    setIsWatching(false);
  }, []);

  const startWatching = useCallback((onUpdate?: (pos: GeolocationPosition) => void) => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setError("Geolocation is not supported by your browser");
      return;
    }

    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }

    setIsWatching(true);
    setError(null);

    const id = navigator.geolocation.watchPosition(
      (position) => {
        const pos: GeolocationPosition = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy,
        };
        setLocation(pos);
        if (onUpdate) onUpdate(pos);
      },
      (err) => {
        console.warn("watchPosition error:", err);
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 1000,
      }
    );

    watchIdRef.current = id;
  }, []);

  useEffect(() => {
    return () => {
      if (watchIdRef.current !== null && typeof navigator !== "undefined" && navigator.geolocation) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
    };
  }, []);

  return {
    location,
    isLocating,
    isWatching,
    error,
    requestLocation,
    startWatching,
    stopWatching,
    clearLocation: () => setLocation(null),
  };
}
