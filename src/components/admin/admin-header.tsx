// src/components/admin/admin-header.tsx
"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { PlusCircle, RefreshCw, Radio, CheckCircle2 } from "lucide-react";
import { ThemeToggle } from "../layout/theme-toggle";
import { cn } from "@/lib/utils";

interface AdminHeaderProps {
  title: string;
  subtitle?: string;
  actionButton?: {
    href: string;
    label: string;
  };
  isLive?: boolean;
  lastSync?: Date;
  isRefreshing?: boolean;
  onRefresh?: () => void;
  badgeCount?: number;
  className?: string;
  compact?: boolean;
}

export function AdminHeader({
  title,
  subtitle,
  actionButton,
  isLive = true,
  lastSync,
  isRefreshing = false,
  onRefresh,
  badgeCount,
  className,
  compact = false,
}: AdminHeaderProps) {
  const [timeAgo, setTimeAgo] = useState<string>("just now");

  useEffect(() => {
    if (!lastSync) return;
    const update = () => {
      const diffSec = Math.floor((Date.now() - lastSync.getTime()) / 1000);
      if (diffSec < 5) setTimeAgo("just now");
      else if (diffSec < 60) setTimeAgo(`${diffSec}s ago`);
      else setTimeAgo(`${Math.floor(diffSec / 60)}m ago`);
    };
    update();
    const interval = setInterval(update, 5000);
    return () => clearInterval(interval);
  }, [lastSync]);

  return (
    <div
      className={cn(
        "flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 dark:border-slate-800",
        compact ? "gap-2.5 pb-3 mb-3 sm:mb-4" : "gap-4 pb-6 mb-6",
        className
      )}
    >
      <div className="min-w-0">
        <div className="flex items-center gap-2.5 sm:gap-3">
          <h1
            className={cn(
              "font-black text-slate-900 dark:text-white tracking-tight truncate",
              compact ? "text-xl sm:text-2xl" : "text-2xl sm:text-3xl"
            )}
          >
            {title}
          </h1>
          {badgeCount !== undefined && badgeCount > 0 && (
            <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
              {badgeCount}
            </span>
          )}
        </div>
        {subtitle && (
          <p
            className={cn(
              "text-slate-500 dark:text-slate-400",
              compact ? "text-xs mt-0.5" : "text-xs sm:text-sm mt-1"
            )}
          >
            {subtitle}
          </p>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2 sm:gap-2.5 shrink-0">
        {/* Real-time Status Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 text-[11px] font-semibold text-slate-700 dark:text-slate-300 shadow-2xs">
          <span className="relative flex h-2 w-2">
            <span
              className={cn(
                "animate-ping absolute inline-flex h-full w-full rounded-full opacity-75",
                isLive ? "bg-emerald-400" : "bg-amber-400"
              )}
            />
            <span
              className={cn(
                "relative inline-flex rounded-full h-2 w-2",
                isLive ? "bg-emerald-500" : "bg-amber-500"
              )}
            />
          </span>
          <span className="font-bold">{isLive ? "Live Realtime" : "Reconnecting"}</span>
          <span className="text-slate-400 dark:text-slate-500 font-normal">({timeAgo})</span>
        </div>

        {/* Manual Refresh Trigger */}
        {onRefresh && (
          <button
            type="button"
            onClick={onRefresh}
            disabled={isRefreshing}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold transition-colors disabled:opacity-60 cursor-pointer"
            title="Sync data now"
          >
            <RefreshCw className={cn("w-3.5 h-3.5", isRefreshing && "animate-spin text-blue-500")} />
            <span className="hidden sm:inline">Sync</span>
          </button>
        )}

        <ThemeToggle />

        {actionButton && (
          <Link
            href={actionButton.href}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-xs transition-colors"
          >
            <PlusCircle className="h-4 w-4" />
            <span>{actionButton.label}</span>
          </Link>
        )}
      </div>
    </div>
  );
}
