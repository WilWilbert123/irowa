// src/components/admin/recent-reports-table.tsx
"use client";

import React from "react";
import Link from "next/link";
import { AlertCircle, CheckCircle, Clock, ShieldCheck, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

export interface RecentReportItem {
  id: string;
  title: string;
  date: string;
  category: string;
  badge: "Urgent" | "Verified" | "Pending" | "Investigating" | "Resolved";
  waterSourceId?: string;
}

export function RecentReportsTable({ reports }: { reports?: RecentReportItem[] }) {
  const items = reports || [];

  const getBadgeStyle = (badge: string) => {
    switch (badge.toLowerCase()) {
      case "urgent":
        return "bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 border-rose-200 dark:border-rose-900";
      case "resolved":
      case "verified":
        return "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border-emerald-200 dark:border-emerald-900";
      case "investigating":
        return "bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 border-blue-200 dark:border-blue-900";
      default:
        return "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border-amber-200 dark:border-amber-900";
    }
  };

  const getIcon = (badge: string) => {
    switch (badge.toLowerCase()) {
      case "urgent":
        return <AlertCircle className="h-4 w-4 text-rose-500" />;
      case "resolved":
      case "verified":
        return <CheckCircle className="h-4 w-4 text-emerald-500" />;
      default:
        return <Clock className="h-4 w-4 text-amber-500" />;
    }
  };

  if (items.length === 0) {
    return (
      <div className="py-8 px-4 text-center rounded-2xl bg-slate-50/50 dark:bg-slate-800/20 border border-dashed border-slate-200 dark:border-slate-800 space-y-2">
        <div className="w-10 h-10 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-500 flex items-center justify-center mx-auto">
          <ShieldCheck className="h-5 w-5" />
        </div>
        <h4 className="font-bold text-xs text-slate-800 dark:text-slate-200">
          No Pending Community Reports
        </h4>
        <p className="text-[11px] text-slate-400 max-w-xs mx-auto">
          All water sources in Irosin are currently operating with no active citizen defect flags.
        </p>
        <Link
          href="/admin/reports"
          className="inline-flex items-center gap-1.5 text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline pt-1"
        >
          <span>Open reports archive</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-2.5">
      {items.map((report) => (
        <Link
          key={report.id}
          href={`/admin/reports/${report.id}`}
          className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors group"
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center shrink-0 shadow-xs">
              {getIcon(report.badge)}
            </div>
            <div className="min-w-0">
              <h4 className="font-semibold text-xs sm:text-sm text-slate-900 dark:text-white truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                {report.title}
              </h4>
              <span className="text-[11px] text-slate-400">
                {report.date} • {report.category}
              </span>
            </div>
          </div>

          <span
            className={cn(
              "px-2.5 py-0.5 rounded-full text-[11px] font-semibold border shrink-0 capitalize ml-2",
              getBadgeStyle(report.badge)
            )}
          >
            {report.badge}
          </span>
        </Link>
      ))}
    </div>
  );
}
