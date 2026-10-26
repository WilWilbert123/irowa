// src/components/notifications/announcement-banner.tsx
"use client";

import React, { useState } from "react";
import { AlertTriangle, X, ChevronRight, Bell } from "lucide-react";
import { useNotifications } from "@/contexts/notification-context";
import Link from "next/link";
import { cn } from "@/lib/utils";

export function AnnouncementBanner() {
  const { announcements } = useNotifications();
  const [dismissed, setDismissed] = useState(false);

  const active = announcements.find((a) => a.priority === "high" || a.priority === "urgent") || announcements[0];

  if (!active || dismissed) return null;

  return (
    <div
      className={cn(
        "relative z-30 px-4 py-2 shrink-0 transition-colors border-b",
        active.priority === "urgent" || active.priority === "high"
          ? "bg-amber-500/10 border-amber-500/20 text-amber-900 dark:text-amber-200"
          : "bg-blue-500/10 border-blue-500/20 text-blue-900 dark:text-blue-200"
      )}
    >
      <div className="max-w-6xl mx-auto flex items-center justify-between gap-3 text-xs sm:text-sm">
        <div className="flex items-center gap-2.5 min-w-0">
          <span className="p-1 rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-400 shrink-0">
            <AlertTriangle className="h-4 w-4" />
          </span>
          <span className="font-bold truncate">{active.title}:</span>
          <span className="truncate hidden sm:inline text-slate-700 dark:text-slate-300">
            {active.body}
          </span>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Link
            href="/notifications"
            className="text-xs font-semibold underline underline-offset-2 hover:opacity-80"
          >
            Details
          </Link>
          <button
            onClick={() => setDismissed(true)}
            className="p-1 rounded-full hover:bg-black/5 dark:hover:bg-white/10"
            aria-label="Dismiss banner"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
