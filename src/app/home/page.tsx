// src/app/home/page.tsx
"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ArrowLeft, Shield, WifiOff } from "lucide-react";
import { MapContainer } from "@/components/map/map-container";
import { useWaterSources } from "@/hooks/use-water-sources";
import { useMapMarkers } from "@/hooks/use-map-markers";
import { useMapFilters } from "@/hooks/use-map-filters";
import { useIsAdminSession } from "@/hooks/use-admin-session";
import { useOnlineStatus } from "@/hooks/use-online-status";
import { WaterCategory } from "@/types/database.types";

function HomePageContent() {
  const searchParams = useSearchParams();
  const selectedParam = searchParams.get("selected");
  const isAdmin = useIsAdminSession();
  const isOnline = useOnlineStatus();
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
      {/* Floating 'Back to Admin' button - Only visible when accessed from admin side */}
      {isAdmin && (
        <div className="absolute top-3 left-3 sm:top-4 sm:left-4 z-30 animate-in fade-in slide-in-from-top-2 duration-200">
          <Link
            href="/admin"
            prefetch={true}
            className="inline-flex items-center gap-2 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl bg-slate-900/90 dark:bg-slate-900/95 hover:bg-blue-600 dark:hover:bg-blue-600 text-white font-bold text-xs shadow-lg backdrop-blur-md border border-slate-700/80 active:scale-95 transition-all select-none cursor-pointer group"
          >
            <ArrowLeft className="h-3.5 w-3.5 text-blue-400 group-hover:text-white transition-colors" />
            <Shield className="h-3.5 w-3.5 text-amber-400 group-hover:text-white transition-colors" />
            <span>Back to Admin</span>
          </Link>
        </div>
      )}

      {/* Floating Offline Indicator Pill */}
      {!isOnline && (
        <div className="absolute top-3 right-3 sm:top-4 sm:right-4 z-30 animate-in fade-in slide-in-from-top-2 duration-200">
          <Link
            href="/offline"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl bg-slate-900/90 dark:bg-slate-900/95 hover:bg-slate-800 text-amber-400 font-bold text-xs shadow-lg backdrop-blur-md border border-slate-700/80 active:scale-95 transition-all select-none"
          >
            <WifiOff className="h-3.5 w-3.5 text-amber-400" />
            <span>Offline Map Mode</span>
          </Link>
        </div>
      )}

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
