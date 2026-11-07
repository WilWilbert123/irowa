// src/components/notifications/announcement-banner.tsx
"use client";

import React, { useState } from "react";
import { AlertTriangle, X } from "lucide-react";
import Link from "next/link";
import { useSystemSettings } from "@/hooks/use-system-settings";

export function AnnouncementBanner() {
  const { settings } = useSystemSettings();
  const [dismissedText, setDismissedText] = useState<string | null>(null);

  const enabled = Boolean(settings.alertBannerEnabled);
  const advisoryText =
    settings.alertBannerText ||
    "Water Advisory: Regular conservation guidelines in effect for low-elevation barangays.";

  // If broadcast is disabled by admin in settings, or currently dismissed for this exact message
  if (!enabled || (dismissedText && dismissedText === advisoryText)) return null;

  return (
    <div className="relative z-30 px-3 sm:px-4 py-2 shrink-0 transition-colors border-b bg-amber-500/10 border-amber-500/20 text-amber-900 dark:text-amber-200 animate-in fade-in duration-200">
      <div className="max-w-6xl mx-auto flex items-center justify-between gap-3 text-xs sm:text-sm">
        <div className="flex items-center gap-2.5 min-w-0">
          <span className="p-1 rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-400 shrink-0">
            <AlertTriangle className="h-4 w-4" />
          </span>
          <span className="font-bold shrink-0">Emergency Advisory:</span>
          <span className="truncate text-slate-800 dark:text-slate-200 font-medium">
            {advisoryText}
          </span>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <Link
            href="/notifications"
            className="text-xs font-semibold underline underline-offset-2 hover:opacity-80"
          >
            Details
          </Link>
          <button
            onClick={() => setDismissedText(advisoryText)}
            className="p-1 rounded-full hover:bg-black/5 dark:hover:bg-white/10 cursor-pointer"
            aria-label="Dismiss banner"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
