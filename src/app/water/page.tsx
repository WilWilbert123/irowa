// src/app/water/page.tsx
"use client";

import React from "react";
import { Navbar } from "@/components/layout/navbar";
import { Sidebar } from "@/components/layout/sidebar";
import { BottomNav } from "@/components/layout/bottom-nav";
import { WaterFilterBar } from "@/components/water/water-filter-bar";
import { WaterGrid } from "@/components/water/water-grid";
import { useWaterSources } from "@/hooks/use-water-sources";
import { useMapFilters } from "@/hooks/use-map-filters";
import { MapPin, Plus } from "lucide-react";
import Link from "next/link";

export default function WaterSourcesPage() {
  const {
    filters,
    setSearchQuery,
    setCategory,
    setAvailability,
    setBarangay,
    setSortBy,
    resetFilters,
    isFiltered,
  } = useMapFilters();

  const { sources, isLoading } = useWaterSources(filters);

  return (
    <div className="flex flex-col h-full w-full overflow-hidden bg-slate-50 dark:bg-slate-950">
      <Navbar onSearchChange={setSearchQuery} searchValue={filters.searchQuery} />
      <div className="flex flex-1 min-h-0 w-full overflow-hidden">
        <Sidebar />
        <main className="flex-1 min-w-0 h-full overflow-y-auto p-3 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-3.5 sm:space-y-5 pb-28 md:pb-12">
          {/* Header - Clean, modern and compact */}
          <div className="flex items-center justify-between gap-3 pt-0.5 sm:pt-0">
            <div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                <span>Water Sources</span>
                <span className="text-[11px] sm:text-xs font-bold px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950/70 text-blue-600 dark:text-blue-400 border border-blue-200/60 dark:border-blue-900/40">
                  {sources.length}
                </span>
              </h1>
            </div>

            <Link
              href="/submit-water"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-semibold text-xs shadow-xs shadow-blue-600/20 transition-all duration-150 cursor-pointer select-none shrink-0"
            >
              <Plus className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span>Add Source</span>
            </Link>
          </div>

          {/* Filter Bar with Horizontal Category Chips & Sleek Search */}
          <WaterFilterBar
            filters={filters}
            onSearchChange={setSearchQuery}
            onCategoryChange={setCategory}
            onAvailabilityChange={setAvailability}
            onBarangayChange={setBarangay}
            onSortChange={setSortBy}
            onReset={resetFilters}
            isFiltered={isFiltered}
          />

          {/* Results Summary */}
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 px-0.5">
            <span className="text-[11px] sm:text-xs font-medium">
              Showing <strong className="text-slate-800 dark:text-slate-200">{sources.length}</strong> {sources.length === 1 ? "point" : "points"}
            </span>
            <Link
              href="/home"
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 text-[11px] sm:text-xs font-semibold hover:bg-blue-100 dark:hover:bg-blue-900/60 active:scale-95 transition-all duration-150 border border-blue-200/60 dark:border-blue-900/40 select-none shadow-2xs"
            >
              <MapPin className="h-3 w-3" />
              <span>Map View</span>
            </Link>
          </div>

          {/* Grid */}
          <WaterGrid sources={sources} isLoading={isLoading} />
        </main>
      </div>
      <BottomNav />
    </div>
  );
}
