// src/components/admin/recent-reports-table.tsx
"use client";

import React from "react";
import Link from "next/link";
import { AlertCircle, CheckCircle, Clock, Droplet } from "lucide-react";
import { cn } from "@/lib/utils";

interface ReportItem {
  id: string;
  title: string;
  date: string;
  category: string;
  badge: "Urgent" | "Verified" | "Pending";
}

const DEFAULT_RECENT_REPORTS: ReportItem[] = [
  {
    id: "r1",
    title: "Low water level at Irosin River",
    date: "May 21, 2025",
    category: "River",
    badge: "Urgent",
  },
  {
    id: "r2",
    title: "New water refilling station in San Pedro",
    date: "May 20, 2025",
    category: "Water Refilling Station",
    badge: "Verified",
  },
  {
    id: "r3",
    title: "Clean-up at Bitang Waterfall",
    date: "May 19, 2025",
    category: "Waterfall",
    badge: "Verified",
  },
  {
    id: "r4",
    title: "Broken pipe at Barangay Zone 3",
    date: "May 18, 2025",
    category: "Public Water Point",
    badge: "Pending",
  },
];

export function RecentReportsTable({ reports }: { reports?: ReportItem[] }) {
  const items = reports && reports.length > 0 ? reports : DEFAULT_RECENT_REPORTS;

  const getBadgeStyle = (badge: string) => {
    switch (badge) {
      case "Urgent":
        return "bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 border-rose-200 dark:border-rose-900";
      case "Verified":
        return "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border-emerald-200 dark:border-emerald-900";
      default:
        return "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border-amber-200 dark:border-amber-900";
    }
  };

  const getIcon = (badge: string) => {
    switch (badge) {
      case "Urgent":
        return <AlertCircle className="h-4 w-4 text-rose-500" />;
      case "Verified":
        return <CheckCircle className="h-4 w-4 text-emerald-500" />;
      default:
        return <Clock className="h-4 w-4 text-amber-500" />;
    }
  };

  return (
    <div className="space-y-3">
      {items.map((report) => (
        <div
          key={report.id}
          className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center shrink-0 shadow-xs">
              {getIcon(report.badge)}
            </div>
            <div className="min-w-0">
              <h4 className="font-semibold text-xs sm:text-sm text-slate-900 dark:text-white truncate">
                {report.title}
              </h4>
              <span className="text-[11px] text-slate-400">
                {report.date} • {report.category}
              </span>
            </div>
          </div>

          <span
            className={cn(
              "px-2.5 py-0.5 rounded-full text-xs font-semibold border shrink-0",
              getBadgeStyle(report.badge)
            )}
          >
            {report.badge}
          </span>
        </div>
      ))}
    </div>
  );
}
