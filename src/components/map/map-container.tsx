// src/components/map/map-container.tsx
"use client";

import dynamic from "next/dynamic";
import React from "react";
import { WaterSourceWithPhotos } from "@/types/water";
import { WaterCategory } from "@/types/database.types";
import { Skeleton } from "@/components/ui/skeleton";

const DynamicMapView = dynamic(
  () => import("./map-view").then((mod) => mod.MapView),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full flex flex-col items-center justify-center bg-slate-900 text-slate-400 gap-3">
        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
        <span className="text-xs font-medium tracking-wide">Loading Irosin Water Map...</span>
      </div>
    ),
  }
);

interface MapContainerProps {
  sources: WaterSourceWithPhotos[];
  selectedSource: WaterSourceWithPhotos | null;
  onSelectSource: (source: WaterSourceWithPhotos | null) => void;
  selectedCategory: WaterCategory | "All";
  onSelectCategory: (category: WaterCategory | "All") => void;
  className?: string;
  isEditorMode?: boolean;
  onMapClickCoordinates?: (lat: number, lng: number) => void;
  editorMarker?: { lat: number; lng: number } | null;
}

export function MapContainer(props: MapContainerProps) {
  return <DynamicMapView {...props} />;
}
