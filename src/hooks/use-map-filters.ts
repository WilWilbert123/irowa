// src/hooks/use-map-filters.ts
"use client";

import { useState } from "react";
import { WaterFilterState } from "@/types/water";
import { WaterCategory, WaterAvailabilityStatus } from "@/types/database.types";

const INITIAL_FILTER_STATE: WaterFilterState = {
  searchQuery: "",
  category: "All",
  availability: "All",
  barangay: "All",
  sortBy: "name",
};

export function useMapFilters() {
  const [filters, setFilters] = useState<WaterFilterState>(INITIAL_FILTER_STATE);

  const setSearchQuery = (searchQuery: string) =>
    setFilters((prev) => ({ ...prev, searchQuery }));

  const setCategory = (category: WaterCategory | "All") =>
    setFilters((prev) => ({ ...prev, category }));

  const setAvailability = (availability: WaterAvailabilityStatus | "All") =>
    setFilters((prev) => ({ ...prev, availability }));

  const setBarangay = (barangay: string | "All") =>
    setFilters((prev) => ({ ...prev, barangay }));

  const setSortBy = (sortBy: "name" | "updated_at" | "distance") =>
    setFilters((prev) => ({ ...prev, sortBy }));

  const resetFilters = () => setFilters(INITIAL_FILTER_STATE);

  const isFiltered =
    filters.searchQuery !== "" ||
    filters.category !== "All" ||
    filters.availability !== "All" ||
    filters.barangay !== "All";

  return {
    filters,
    setSearchQuery,
    setCategory,
    setAvailability,
    setBarangay,
    setSortBy,
    resetFilters,
    isFiltered,
  };
}
