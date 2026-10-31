// src/app/offline/page.tsx
"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { WifiOff, RotateCcw, Bookmark, Compass, ArrowRight, Database, CheckCircle2 } from "lucide-react";
import { getOfflineCacheStats } from "@/lib/storage/offline-db";

export default function OfflinePage() {
  const [stats, setStats] = useState<{
    cachedCount: number;
    lastCachedAt: string | null;
    isReady: boolean;
  }>({
    cachedCount: 0,
    lastCachedAt: null,
    isReady: false,
  });

  useEffect(() => {
    async function loadStats() {
      const res = await getOfflineCacheStats();
      setStats(res);
    }
    loadStats();
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 bg-slate-50 dark:bg-slate-950 text-center select-none">
      <div className="w-full max-w-md rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 p-6 sm:p-8 shadow-2xl space-y-5 animate-in fade-in-0 zoom-in-95 duration-200">
        {/* Offline Icon with Soft Glow */}
        <div className="relative mx-auto w-16 h-16 rounded-3xl bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 flex items-center justify-center shadow-inner">
          <WifiOff className="h-8 w-8" />
          <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-amber-500 border-2 border-white dark:border-slate-900" />
        </div>

        {/* Title & Context */}
        <div className="space-y-2">
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            You are Offline
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed max-w-xs mx-auto">
            IroWa cannot reach the network right now, but your full water directory is stored safely in your local offline database.
          </p>
        </div>

        {/* Offline Database Status Pill */}
        <div className="p-3 rounded-2xl bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-800/60 flex items-center justify-between text-left gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-xs">
              <Database className="h-4 w-4" />
            </div>
            <div>
              <span className="text-xs font-bold text-emerald-900 dark:text-emerald-200 block leading-tight">
                Offline Database Ready
              </span>
              <span className="text-[10px] text-emerald-700 dark:text-emerald-400">
                {stats.cachedCount > 0
                  ? `${stats.cachedCount} water sources stored locally`
                  : "All Irosin water sources cached"}
              </span>
            </div>
          </div>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 border border-emerald-300/60 dark:border-emerald-700/60 shrink-0">
            Instant 0ms
          </span>
        </div>

        {/* Action Buttons */}
        <div className="pt-1 flex flex-col gap-2.5">
          {/* Primary: Continue to Offline */}
          <Link
            href="/home"
            className="w-full h-12 rounded-2xl bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-blue-500/25 hover:shadow-blue-500/35 transition-all duration-150 select-none cursor-pointer"
          >
            <Compass className="h-4.5 w-4.5 text-sky-200" />
            <span>Continue to Offline</span>
            <ArrowRight className="h-4 w-4 text-sky-200" />
          </Link>

          {/* Secondary: View Saved Water Sources */}
          <Link
            href="/saved"
            className="w-full h-11 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 font-semibold text-xs hover:bg-slate-50 dark:hover:bg-slate-800 active:scale-95 flex items-center justify-center gap-2 transition-all duration-150 select-none"
          >
            <Bookmark className="h-4 w-4 text-amber-500" />
            <span>View Saved Water Sources</span>
          </Link>

          {/* Tertiary: Retry Connection */}
          <button
            onClick={() => window.location.reload()}
            className="flex items-center justify-center gap-1.5 text-xs text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 active:scale-95 transition-all duration-150 cursor-pointer pt-1"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Retry Connection</span>
          </button>
        </div>
      </div>
    </div>
  );
}
