// src/app/offline/page.tsx
"use client";

import React from "react";
import Link from "next/link";
import { WifiOff, RotateCcw, Bookmark, ArrowRight, Droplets, Map } from "lucide-react";
import { BottomNav } from "@/components/layout/bottom-nav";

export default function OfflinePage() {
  return (
    <div className="min-h-screen flex flex-col justify-between p-4 sm:p-6 bg-slate-50 dark:bg-slate-950 text-center select-none pb-28 md:pb-12">
      <div className="flex-1 flex flex-col items-center justify-center w-full">
        <div className="w-full max-w-sm rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 p-6 sm:p-8 shadow-xl space-y-5 animate-in fade-in-0 zoom-in-95 duration-200">
          {/* Simple Clean Offline Icon */}
          <div className="mx-auto w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 flex items-center justify-center shadow-xs">
            <WifiOff className="h-7 w-7" />
          </div>

          {/* Clean, Minimal Title & Subtext */}
          <div className="space-y-1.5">
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Offline Storage Active
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed max-w-xs mx-auto">
              All water points, hotlines, and saved locations are stored locally on your device.
            </p>
          </div>

          {/* Actions */}
          <div className="pt-2 flex flex-col gap-2.5">
            {/* Primary: Explore Water Directory */}
            <Link
              href="/water"
              className="w-full h-11 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md shadow-blue-500/20 transition-all duration-150 select-none cursor-pointer"
            >
              <Droplets className="h-4 w-4" />
              <span>Browse Stored Water Sources</span>
            </Link>

            {/* Secondary: Open Map */}
            <Link
              href="/home"
              className="w-full h-10 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 font-semibold text-xs hover:bg-slate-50 dark:hover:bg-slate-800 active:scale-95 flex items-center justify-center gap-2 transition-all duration-150 select-none"
            >
              <Map className="h-3.5 w-3.5 text-blue-500" />
              <span>View Map Pins</span>
            </Link>

            {/* Tertiary: Saved Sources */}
            <Link
              href="/saved"
              className="w-full h-10 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 font-semibold text-xs hover:bg-slate-50 dark:hover:bg-slate-800 active:scale-95 flex items-center justify-center gap-2 transition-all duration-150 select-none"
            >
              <Bookmark className="h-3.5 w-3.5 text-amber-500" />
              <span>Saved Locations</span>
            </Link>

            {/* Quaternary: Retry Connection */}
            <button
              onClick={() => window.location.reload()}
              className="flex items-center justify-center gap-1.5 text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 active:scale-95 transition-all duration-150 cursor-pointer pt-1"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Retry Connection</span>
            </button>
          </div>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
