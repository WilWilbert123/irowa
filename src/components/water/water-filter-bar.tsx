// src/components/water/water-filter-bar.tsx
"use client";

import React from "react";
import { Search, RotateCcw, Filter } from "lucide-react";
import { WaterFilterState } from "@/types/water";
import { WaterCategory, WaterAvailabilityStatus } from "@/types/database.types";
import { IROSIN_BARANGAYS } from "@/lib/utils/constants";
import { waterCategories, waterAvailabilityStatuses } from "@/lib/validations/water-schema";

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
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-4 shadow-xs space-y-3">
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <input
          type="text"
          value={filters.searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search water points, barangays, or descriptions..."
          className="w-full h-11 pl-10 pr-4 rounded-2xl bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-blue-500"
        />
      </div>

      {/* Filter Select Dropdowns */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        {/* Category */}
        <select
          value={filters.category}
          onChange={(e) => onCategoryChange(e.target.value as any)}
          className="h-9 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 text-xs font-medium text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 focus:outline-none"
        >
          <option value="All">All Categories</option>
          {waterCategories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>

        {/* Availability */}
        <select
          value={filters.availability}
          onChange={(e) => onAvailabilityChange(e.target.value as any)}
          className="h-9 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 text-xs font-medium text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 focus:outline-none"
        >
          <option value="All">All Statuses</option>
          {waterAvailabilityStatuses.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>

        {/* Barangay */}
        <select
          value={filters.barangay}
          onChange={(e) => onBarangayChange(e.target.value)}
          className="h-9 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 text-xs font-medium text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 focus:outline-none"
        >
          <option value="All">All Barangays</option>
          {IROSIN_BARANGAYS.map((b) => (
            <option key={b} value={b}>
              Brgy. {b}
            </option>
          ))}
        </select>

        {/* Sort By */}
        <select
          value={filters.sortBy}
          onChange={(e) => onSortChange(e.target.value as any)}
          className="h-9 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 text-xs font-medium text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 focus:outline-none"
        >
          <option value="name">Sort by Name</option>
          <option value="updated_at">Recently Updated</option>
          <option value="distance">Nearest to Me</option>
        </select>
      </div>

      {isFiltered && (
        <div className="flex justify-end pt-1">
          <button
            onClick={onReset}
            className="flex items-center gap-1.5 text-xs text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
          >
            <RotateCcw className="h-3 w-3" />
            <span>Reset filters</span>
          </button>
        </div>
      )}
    </div>
  );
}
