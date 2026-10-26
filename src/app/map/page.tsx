// src/app/map/page.tsx
"use client";

import React from "react";
import { Navbar } from "@/components/layout/navbar";
import { BottomNav } from "@/components/layout/bottom-nav";
import { MapContainer } from "@/components/map/map-container";
import { useWaterSources } from "@/hooks/use-water-sources";
import { useMapMarkers } from "@/hooks/use-map-markers";
import { useMapFilters } from "@/hooks/use-map-filters";

export default function DedicatedMapPage() {
  const { filters, setCategory } = useMapFilters();
  const { sources } = useWaterSources(filters);
  const { selectedSource, selectSource } = useMapMarkers(sources);

  return (
    <div className="flex flex-col h-full w-full overflow-hidden bg-slate-900">
      <Navbar />
      <main className="flex-1 min-h-0 relative overflow-hidden">
        <MapContainer
          sources={sources}
          selectedSource={selectedSource}
          onSelectSource={selectSource}
          selectedCategory={filters.category}
          onSelectCategory={setCategory}
        />
      </main>
      <BottomNav />
    </div>
  );
}
