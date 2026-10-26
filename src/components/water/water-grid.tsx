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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="rounded-3xl border border-slate-200 dark:border-slate-800 p-4 space-y-3">
            <Skeleton className="w-full h-44 rounded-2xl" />
            <Skeleton className="w-2/3 h-5 rounded-lg" />
            <Skeleton className="w-1/2 h-4 rounded-md" />
            <Skeleton className="w-full h-10 rounded-xl" />
          </div>
        ))}
      </div>
    );
  }

  if (sources.length === 0) {
    return (
      <div className="rounded-3xl border border-dashed border-slate-300 dark:border-slate-800 p-12 text-center flex flex-col items-center justify-center">
        <div className="w-14 h-14 rounded-2xl bg-blue-50 dark:bg-blue-950/40 text-blue-500 flex items-center justify-center mb-4">
          <Droplet className="h-7 w-7" />
        </div>
        <h3 className="font-bold text-lg text-slate-800 dark:text-slate-200 mb-1">
          No water resources match your search
        </h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm">
          Try adjusting your search terms or filters to view other springs, waterfalls, or refilling stations in Irosin.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
      {sources.map((source) => (
        <WaterCard key={source.id} source={source} />
      ))}
    </div>
  );
}
