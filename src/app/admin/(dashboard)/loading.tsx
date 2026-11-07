// src/app/admin/(dashboard)/loading.tsx
import React from "react";

export default function AdminDashboardLoading() {
  return (
    <div className="flex flex-col min-w-0 space-y-4 animate-pulse">
      {/* Header Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 mb-2 border-b border-slate-200/80 dark:border-slate-800">
        <div className="space-y-2">
          <div className="h-7 w-48 rounded-xl bg-slate-200 dark:bg-slate-800" />
          <div className="h-4 w-72 rounded-lg bg-slate-100 dark:bg-slate-800/60" />
        </div>
        <div className="flex items-center gap-2">
          <div className="h-8 w-24 rounded-xl bg-slate-200 dark:bg-slate-800" />
          <div className="h-8 w-8 rounded-xl bg-slate-200 dark:bg-slate-800" />
        </div>
      </div>

      {/* Cards Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-3"
          >
            <div className="flex items-center justify-between">
              <div className="h-3.5 w-24 rounded-md bg-slate-200 dark:bg-slate-800" />
              <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800/60" />
            </div>
            <div className="h-7 w-16 rounded-lg bg-slate-200 dark:bg-slate-800" />
            <div className="h-3 w-32 rounded-md bg-slate-100 dark:bg-slate-800/60" />
          </div>
        ))}
      </div>

      {/* Main Body Skeleton */}
      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-5 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800/80">
          <div className="h-4 w-36 rounded-md bg-slate-200 dark:bg-slate-800" />
          <div className="h-4 w-20 rounded-md bg-slate-100 dark:bg-slate-800/60" />
        </div>
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((row) => (
            <div
              key={row}
              className="flex items-center justify-between py-2 border-b border-slate-100/60 dark:border-slate-800/40 last:border-0"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-slate-200 dark:bg-slate-800" />
                <div className="space-y-1.5">
                  <div className="h-3.5 w-40 rounded-md bg-slate-200 dark:bg-slate-800" />
                  <div className="h-2.5 w-24 rounded-md bg-slate-100 dark:bg-slate-800/60" />
                </div>
              </div>
              <div className="h-6 w-16 rounded-full bg-slate-200 dark:bg-slate-800" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

