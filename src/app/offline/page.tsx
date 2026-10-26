// src/app/offline/page.tsx
"use client";

import React from "react";
import Link from "next/link";
import { WifiOff, RotateCcw, Bookmark, Compass } from "lucide-react";

export default function OfflinePage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-slate-50 dark:bg-slate-950 text-center">
      <div className="w-full max-w-md rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 shadow-xl space-y-5">
        <div className="mx-auto w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 flex items-center justify-center">
          <WifiOff className="h-8 w-8" />
        </div>

        <div className="space-y-1.5">
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
            You are Offline
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
            IroWa cannot connect to the network right now. Cached pages and locally saved water sources remain accessible.
          </p>
        </div>

        <div className="pt-2 flex flex-col gap-2.5">
          <button
            onClick={() => window.location.reload()}
            className="w-full h-11 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <RotateCcw className="h-4 w-4" />
            <span>Retry Connection</span>
          </button>

          <Link
            href="/saved"
            className="w-full h-11 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 font-semibold text-xs hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center justify-center gap-2 transition-colors"
          >
            <Bookmark className="h-4 w-4" />
            <span>View Saved Water Sources</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
