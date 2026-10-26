// src/app/error.tsx
"use client";

import React from "react";
import { AlertCircle, RotateCcw } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-slate-50 dark:bg-slate-950 text-center">
      <div className="w-full max-w-md rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 shadow-xl space-y-4">
        <div className="mx-auto w-16 h-16 rounded-full bg-rose-50 dark:bg-rose-950/40 text-rose-500 flex items-center justify-center">
          <AlertCircle className="h-8 w-8" />
        </div>
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">Something Went Wrong</h1>
        <p className="text-xs sm:text-sm text-slate-500 max-w-sm mx-auto">
          {error.message || "An unexpected error occurred while loading this page."}
        </p>
        <button
          onClick={() => reset()}
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition-colors shadow-sm cursor-pointer"
        >
          <RotateCcw className="h-4 w-4" />
          <span>Try Again</span>
        </button>
      </div>
    </div>
  );
}
