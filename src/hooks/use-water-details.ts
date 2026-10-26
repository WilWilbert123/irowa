// src/hooks/use-water-details.ts
"use client";

import { useState, useEffect } from "react";
import { WaterSourceWithPhotos } from "@/types/water";
import { getWaterSourceById, getWaterSourceBySlug } from "@/lib/services/water-service";

export function useWaterDetails(identifier: string) {
  const [source, setSource] = useState<WaterSourceWithPhotos | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    async function fetchDetails() {
      setIsLoading(true);
      setError(null);
      try {
        const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(identifier);
        const data = isUuid
          ? await getWaterSourceById(identifier)
          : await getWaterSourceBySlug(identifier);

        if (mounted) {
          if (!data) {
            setError("Water resource not found");
          } else {
            setSource(data);
          }
        }
      } catch (err: any) {
        if (mounted) setError(err.message || "Failed to load water details");
      } finally {
        if (mounted) setIsLoading(false);
      }
    }

    if (identifier) {
      fetchDetails();
    }

    return () => {
      mounted = false;
    };
  }, [identifier]);

  return { source, isLoading, error };
}
