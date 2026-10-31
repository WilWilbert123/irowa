// src/components/water/water-filter-bar.tsx
"use client";

import React, { useState } from "react";
import { Search, RotateCcw, SlidersHorizontal, X } from "lucide-react";
import { WaterFilterState } from "@/types/water";
import { WaterCategory, WaterAvailabilityStatus } from "@/types/database.types";
import { IROSIN_BARANGAYS, CATEGORY_COLORS } from "@/lib/utils/constants";
import { waterAvailabilityStatuses } from "@/lib/validations/water-schema";
import { cn } from "@/lib/utils";

interface WaterFilterBarProps {
  filters: WaterFilterState;
  onSearchChange: (q: string) => void;
  onCategoryChange: (c: WaterCategory | "All") => void;
  onAvailabilityChange: (a: WaterAvailabilityStatus | "All") => void;
  onBarangayChange: (b: string | "All") => void;
  onSortChange: (s: "name" | "updated_at" | "distance") => void;
  onReset: () => void;
  isFiltered: boolean;
}

const CATEGORY_ITEMS: Array<{ label: string; value: WaterCategory | "All" }> = [
  { label: "All", value: "All" },
  { label: "Rivers", value: "River" },
  { label: "Waterfalls", value: "Waterfall" },
  { label: "Springs", value: "Spring" },
  { label: "Resorts", value: "Resort" },
  { label: "Refilling", value: "Water Refilling Station" },
  { label: "Public Points", value: "Public Water Source" },
  { label: "Deep Wells", value: "Deep Well" },
  { label: "Community", value: "Community Water Point" },
  { label: "Other", value: "Other" },
];

export function WaterFilterBar({
  filters,
  onSearchChange,
  onCategoryChange,
  onAvailabilityChange,
  onBarangayChange,
  onSortChange,
  onReset,
  isFiltered,
}: WaterFilterBarProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Count active non-category filters
  const advancedCount =
    (filters.availability !== "All" ? 1 : 0) +
    (filters.barangay !== "All" ? 1 : 0) +
    (filters.sortBy !== "name" ? 1 : 0);

  return (
    <div className="space-y-2.5">
      {/* Search Input Row + Filter Toggle Button */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={filters.searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search by name, barangay..."
            className="w-full h-10 sm:h-11 pl-10 pr-9 rounded-2xl bg-white dark:bg-slate-900 text-xs sm:text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 border border-slate-200/90 dark:border-slate-800 shadow-2xs focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
          />
          {filters.searchQuery && (
            <button
              onClick={() => onSearchChange("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 active:scale-90 transition-transform cursor-pointer"
              aria-label="Clear search query"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Filter Toggle Button */}
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className={cn(
            "h-10 sm:h-11 px-3 sm:px-3.5 rounded-2xl border text-xs font-semibold flex items-center gap-1.5 transition-all duration-150 ease-out active:scale-95 cursor-pointer select-none shrink-0 shadow-2xs",
            showAdvanced || advancedCount > 0
              ? "bg-blue-600 text-white border-blue-600 shadow-sm shadow-blue-500/20"
              : "bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200/90 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800"
          )}
          aria-expanded={showAdvanced}
          aria-label="Toggle filter options"
        >
          <SlidersHorizontal className="h-3.5 w-3.5" />
          <span className="hidden xs:inline">Filter</span>
          {advancedCount > 0 && (
            <span className="w-4 h-4 rounded-full bg-white text-blue-600 text-[10px] font-extrabold flex items-center justify-center">
              {advancedCount}
            </span>
          )}
        </button>
      </div>

      {/* Horizontal Category Pill Chips */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5 -mx-1 px-1 select-none scroll-smooth">
        {CATEGORY_ITEMS.map((item) => {
          const isSelected = filters.category === item.value;
          const markerColor =
            item.value !== "All"
              ? CATEGORY_COLORS[item.value]?.marker || "#0284c7"
              : "#0284c7";

          return (
            <button
              key={item.value}
              onClick={() => onCategoryChange(item.value)}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all duration-150 ease-out active:scale-95 cursor-pointer shrink-0 select-none",
                isSelected
                  ? "bg-blue-600 text-white font-semibold shadow-xs shadow-blue-600/30 ring-1 ring-blue-500"
                  : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200/90 dark:border-slate-800 hover:bg-slate-100/80 dark:hover:bg-slate-800/80"
              )}
            >
              {item.value !== "All" && (
                <span
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ backgroundColor: markerColor }}
                />
              )}
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* Advanced Filters Expandable Drawer */}
      {showAdvanced && (
        <div className="p-3 sm:p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-md space-y-2.5 animate-in fade-in-0 slide-in-from-top-1 duration-200 ease-out">
          <div className="flex items-center justify-between pb-1.5 border-b border-slate-100 dark:border-slate-800/80 text-[10px] sm:text-[11px] font-bold text-slate-400 uppercase tracking-wider px-0.5">
            <span>Filter By</span>
            {isFiltered && (
              <button
                onClick={onReset}
                className="flex items-center gap-1 text-[11px] text-blue-600 dark:text-blue-400 hover:underline active:scale-95 transition-transform cursor-pointer font-semibold"
              >
                <RotateCcw className="h-3 w-3" />
                <span>Reset all</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {/* Status */}
            <div>
              <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                Availability
              </label>
              <select
                value={filters.availability}
                onChange={(e) => onAvailabilityChange(e.target.value as any)}
                className="w-full h-8.5 px-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 text-xs font-medium text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 focus:outline-none"
              >
                <option value="All">All Statuses</option>
                {waterAvailabilityStatuses.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            {/* Barangay */}
            <div>
              <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                Barangay
              </label>
              <select
                value={filters.barangay}
                onChange={(e) => onBarangayChange(e.target.value)}
                className="w-full h-8.5 px-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 text-xs font-medium text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 focus:outline-none"
              >
                <option value="All">All Barangays</option>
                {IROSIN_BARANGAYS.map((b) => (
                  <option key={b} value={b}>
                    Brgy. {b}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort */}
            <div>
              <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                Sort By
              </label>
              <select
                value={filters.sortBy}
                onChange={(e) => onSortChange(e.target.value as any)}
                className="w-full h-8.5 px-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 text-xs font-medium text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 focus:outline-none"
              >
                <option value="name">Name (A-Z)</option>
                <option value="updated_at">Recently Updated</option>
                <option value="distance">Nearest to Me</option>
              </select>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
