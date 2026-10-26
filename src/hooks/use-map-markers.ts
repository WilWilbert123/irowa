// src/hooks/use-map-markers.ts
"use client";

import { useState } from "react";
import { WaterSourceWithPhotos } from "@/types/water";

export function useMapMarkers(sources: WaterSourceWithPhotos[]) {
  const [selectedSource, setSelectedSource] = useState<WaterSourceWithPhotos | null>(null);

  const selectSource = (source: WaterSourceWithPhotos | null) => {
    setSelectedSource(source);
  };

  const selectSourceById = (id: string) => {
    const found = sources.find((s) => s.id === id);
    if (found) setSelectedSource(found);
  };

  return {
    selectedSource,
    selectSource,
    selectSourceById,
    clearSelectedSource: () => setSelectedSource(null),
  };
}
