// src/components/water/water-grid.tsx
"use client";

import React from "react";
import { WaterCard } from "./water-card";
import { WaterSourceWithPhotos } from "@/types/water";
import { Droplet, Frown } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface WaterGridProps {
  sources: WaterSourceWithPhotos[];
  isLoading?: boolean;
}

export function WaterGrid({ sources, isLoading }: WaterGridProps) {
  if (isLoading) {
    return (
      <div className="w-full grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-4 md:gap-5">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            className="w-full rounded-2xl sm:rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs overflow-hidden flex flex-col"
          >
            <Skeleton className="w-full aspect-[4/3] sm:aspect-auto sm:h-48 rounded-none" />
            <div className="p-2.5 sm:p-4 space-y-2.5 sm:space-y-3 flex-1 flex flex-col justify-between w-full">
              <div className="space-y-2 w-full">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1.5 w-full">
                  <Skeleton className="w-11/12 sm:w-3/4 h-4 sm:h-5 rounded-md" />
                  <Skeleton className="w-16 sm:w-20 h-4 rounded-full shrink-0" />
                </div>
                <Skeleton className="w-5/6 h-3 sm:h-4 rounded-md" />
                <Skeleton className="hidden sm:block w-full h-8 rounded-md" />
              </div>
              <div className="pt-2 sm:pt-2.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-1.5 sm:gap-2 w-full">
                <Skeleton className="flex-1 h-7 sm:h-9 rounded-lg sm:rounded-xl" />
                <Skeleton className="w-7 h-7 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl shrink-0" />
                <Skeleton className="w-7 h-7 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl shrink-0" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (sources.length === 0) {
    return (
      <div className="rounded-2xl sm:rounded-3xl border border-dashed border-slate-300 dark:border-slate-800 p-8 sm:p-12 text-center flex flex-col items-center justify-center">
        <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-blue-50 dark:bg-blue-950/40 text-blue-500 flex items-center justify-center mb-3 sm:mb-4">
          <Droplet className="h-6 w-6 sm:h-7 sm:w-7" />
        </div>
        <h3 className="font-bold text-base sm:text-lg text-slate-800 dark:text-slate-200 mb-1">
          No water resources match your search
        </h3>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-sm">
          Try adjusting your search terms or filters to view other springs, waterfalls, or refilling stations in Irosin.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-4 md:gap-5">
      {sources.map((source) => (
        <WaterCard key={source.id} source={source} />
      ))}
    </div>
  );
}
