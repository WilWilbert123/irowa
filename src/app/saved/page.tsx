// src/app/saved/page.tsx
"use client";

import React from "react";
import { Navbar } from "@/components/layout/navbar";
import { Sidebar } from "@/components/layout/sidebar";
import { BottomNav } from "@/components/layout/bottom-nav";
import { WaterGrid } from "@/components/water/water-grid";
import { useSavedWater } from "@/hooks/use-saved-water";
import { Bookmark, Compass } from "lucide-react";
import Link from "next/link";

export default function SavedWaterPage() {
  const { savedSources, isLoading } = useSavedWater();

  return (
    <div className="flex flex-col h-full w-full overflow-hidden bg-slate-50 dark:bg-slate-950">
      <Navbar showSearch={false} />
      <div className="flex flex-1 min-h-0 w-full overflow-hidden">
        <Sidebar />
        <main className="flex-1 min-w-0 h-full overflow-y-auto p-3 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-4 sm:space-y-6 pb-28 md:pb-12">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-blue-600 dark:text-blue-400 mb-1">
              <Bookmark className="h-4 w-4" />
              <span>Bookmarks</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              Saved Locations
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              Quick access to your preferred springs, waterfalls, and emergency water supply points.
            </p>
          </div>

          {savedSources.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-slate-300 dark:border-slate-800 p-12 text-center flex flex-col items-center justify-center space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-amber-50 dark:bg-amber-950/40 text-amber-500 flex items-center justify-center">
                <Bookmark className="h-7 w-7" />
              </div>
              <h3 className="font-bold text-lg text-slate-800 dark:text-slate-200">
                No saved water locations yet
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-sm">
                Tap the bookmark icon on any water source popup card or details page to save it for quick offline or daily access.
              </p>
              <Link
                href="/home"
                className="mt-2 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition-colors"
              >
                <Compass className="h-4 w-4" />
                <span>Explore Map</span>
              </Link>
            </div>
          ) : (
            <WaterGrid sources={savedSources} isLoading={isLoading} />
          )}
        </main>
      </div>
      <BottomNav />
    </div>
  );
}
