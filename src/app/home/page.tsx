// src/app/home/page.tsx
"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { MapContainer } from "@/components/map/map-container";
import { useWaterSources } from "@/hooks/use-water-sources";
import { useMapMarkers } from "@/hooks/use-map-markers";
import { useMapFilters } from "@/hooks/use-map-filters";
import { WaterCategory } from "@/types/database.types";

function HomePageContent() {
  const searchParams = useSearchParams();
  const selectedParam = searchParams.get("selected");
  const { filters, setCategory, setSearchQuery } = useMapFilters();
  const { sources, isLoading } = useWaterSources(filters);
  const { selectedSource, selectSource, selectSourceById } = useMapMarkers(sources);

  useEffect(() => {
    if (selectedParam && sources.length > 0) {
      selectSourceById(selectedParam);
    }
  }, [selectedParam, sources]);

  return (
    <div className="relative w-full h-full flex-1 overflow-hidden">
      <MapContainer
        sources={sources}
        selectedSource={selectedSource}
        onSelectSource={selectSource}
        selectedCategory={filters.category}
        onSelectCategory={setCategory}
        className="w-full h-full"
      />
    </div>
  );
}

export default function HomePage() {
  return (
    <Suspense
      fallback={
        <div className="w-full h-full flex items-center justify-center bg-slate-900 text-slate-400">
          <div className="w-8 h-8 border-3 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <HomePageContent />
    </Suspense>
  );
}
