// src/app/water/page.tsx
"use client";

import React, { useState } from "react";
import { Navbar } from "@/components/layout/navbar";
import { Sidebar } from "@/components/layout/sidebar";
import { BottomNav } from "@/components/layout/bottom-nav";
import { WaterFilterBar } from "@/components/water/water-filter-bar";
import { WaterGrid } from "@/components/water/water-grid";
import { useWaterSources } from "@/hooks/use-water-sources";
import { useMapFilters } from "@/hooks/use-map-filters";
import { Droplet, MapPin, PlusCircle } from "lucide-react";
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
        <main className="flex-1 min-w-0 h-full overflow-y-auto p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-6 pb-28 md:pb-12">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold text-blue-600 dark:text-blue-400 mb-1">
                <Droplet className="h-4 w-4" />
                <span>Verified Public Directory</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
                Water Resources in Irosin
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                Explore approved waterfalls, cold springs, rivers, deep wells, and refilling stations across all barangays.
              </p>
            </div>

            <Link
              href="/submit-water"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-sm transition-colors self-start sm:self-auto"
            >
              <PlusCircle className="h-4 w-4" />
              <span>Submit a Water Point</span>
            </Link>
          </div>

          {/* Filter Bar */}
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
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 px-1">
            <span>
              Showing <strong className="text-slate-800 dark:text-slate-200">{sources.length}</strong> water points
            </span>
            <Link href="/home" className="text-blue-600 dark:text-blue-400 font-semibold hover:underline flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5" />
              <span>View on Interactive Map</span>
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
