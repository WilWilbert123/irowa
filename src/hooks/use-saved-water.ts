// src/hooks/use-saved-water.ts
"use client";

import { useVisitor } from "@/contexts/visitor-context";
import { useWaterSources } from "./use-water-sources";

export function useSavedWater() {
  const { preferences, toggleSavedSource, isSaved } = useVisitor();
  const { sources, isLoading } = useWaterSources();

  const savedList = sources.filter((s) => preferences.savedSources.includes(s.id));

  return {
    savedSources: savedList,
    savedIds: preferences.savedSources,
    toggleSavedSource,
    isSaved,
    isLoading,
  };
}
