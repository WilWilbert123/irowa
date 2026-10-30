// src/app/admin/(dashboard)/analytics/page.tsx
"use client";

import React, { useEffect, useState, useCallback } from "react";
import {
  BarChart3,
  Droplets,
  MessageSquare,
  AlertTriangle,
  TrendingUp,
  ShieldCheck,
  Loader2,
  Activity,
  CheckCircle2,
} from "lucide-react";
import { getAdminDashboardMetricsAction } from "@/actions/analytics-actions";
import { AdminDashboardMetrics } from "@/types/admin";
import { CategoryChart } from "@/components/admin/category-chart";
import { AdminHeader } from "@/components/admin/admin-header";
import { useAdminRealtime } from "@/hooks/use-admin-realtime";
import { cn } from "@/lib/utils";

export default function AdminAnalyticsPage() {
  const [metrics, setMetrics] = useState<AdminDashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    try {
      const data = await getAdminDashboardMetricsAction();
      setMetrics(data);
    } catch (err) {
      console.error("Failed to load metrics", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const { isLive, lastSync, isRefreshing, triggerRefresh } = useAdminRealtime({
    onSync: loadData,
  });

  useEffect(() => {
    loadData();
  }, [loadData]);

  if (loading && !metrics) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-12 text-slate-400 space-y-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        <p className="text-xs font-medium">Computing live municipal water metrics...</p>
      </div>
    );
  }

  const m = metrics || {
    totalWaterSources: 9,
    availableCount: 8,
    limitedCount: 1,
    unavailableCount: 0,
    pendingSubmissionsCount: 0,
    pendingReportsCount: 0,
    totalChatMessages: 2,
    totalSubmissionsCount: 0,
    totalReportsCount: 0,
    activeVisitorsCount: 1,
    recentActivity: [],
    categoryBreakdown: {},
  };

  const total = m.totalWaterSources || 1;
  const functionalRate = Math.round((m.availableCount / total) * 100);

  return (
    <div className="flex flex-col min-w-0 lg:h-[calc(100dvh-4.5rem)] space-y-2.5">
      {/* Compact Top Header */}
      <AdminHeader
        title="Analytics & Civic Infrastructure"
        subtitle="Real-time municipal metrics on water availability, citizen submissions, and resource distributions in Irosin."
        isLive={isLive}
        lastSync={lastSync}
        isRefreshing={isRefreshing || loading}
        onRefresh={triggerRefresh}
        compact={true}
        className="shrink-0 mb-0 pb-2"
      />

      {/* Top 4 KPI Metrics (Compact 4-col on desktop, 2x2 grid on mobile) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 shrink-0">
        {/* KPI 1: Total Water Sources */}
        <div className="p-2.5 sm:p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
            <Droplets className="w-4.5 h-4.5" />
          </div>
          <div className="min-w-0">
            <span className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold block truncate">
              Total Water Sources
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-lg sm:text-xl font-black text-slate-900 dark:text-white leading-none">
                {m.totalWaterSources}
              </span>
              <span className="text-[10px] text-blue-600 dark:text-blue-400 font-bold truncate">
                in Irosin
              </span>
            </div>
          </div>
        </div>

        {/* KPI 2: Fully Operational */}
        <div className="p-2.5 sm:p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <TrendingUp className="w-4.5 h-4.5" />
          </div>
          <div className="min-w-0">
            <span className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold block truncate">
              Fully Operational
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-lg sm:text-xl font-black text-slate-900 dark:text-white leading-none">
                {m.availableCount}
              </span>
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">
                {functionalRate}% rate
              </span>
            </div>
          </div>
        </div>

        {/* KPI 3: Limited / Attention */}
        <div className="p-2.5 sm:p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-4.5 h-4.5" />
          </div>
          <div className="min-w-0">
            <span className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold block truncate">
              Limited / Attention
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-lg sm:text-xl font-black text-slate-900 dark:text-white leading-none">
                {m.limitedCount + m.unavailableCount}
              </span>
              <span className="text-[10px] text-amber-600 dark:text-amber-400 font-bold truncate">
                {m.limitedCount} limited
              </span>
            </div>
          </div>
        </div>

        {/* KPI 4: Community Chat */}
        <div className="p-2.5 sm:p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
            <MessageSquare className="w-4.5 h-4.5" />
          </div>
          <div className="min-w-0">
            <span className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold block truncate">
              Community Chat
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-lg sm:text-xl font-black text-slate-900 dark:text-white leading-none">
                {m.totalChatMessages}
              </span>
              <span className="text-[10px] text-purple-600 dark:text-purple-400 font-bold truncate">
                live messages
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Charts & Telemetry Grid (Fits viewport on desktop, scrolls cleanly on mobile) */}
      <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-2 gap-2.5 overflow-hidden">
        {/* Left Card: Category Donut Breakdown */}
        <div className="flex flex-col min-h-0 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-3.5 shadow-2xs overflow-hidden">
          <div className="shrink-0 mb-1 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white leading-tight">
                Resource Types Distribution
              </h3>
              <p className="text-[11px] text-slate-400">
                Breakdown by municipal category across Irosin
              </p>
            </div>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
              {m.totalWaterSources} Sources
            </span>
          </div>

          <div className="flex-1 min-h-0 overflow-y-auto flex items-center justify-center">
            <CategoryChart
              data={m.categoryBreakdown}
              totalCount={m.totalWaterSources}
            />
          </div>
        </div>

        {/* Right Card: Availability Health Breakdown */}
        <div className="flex flex-col min-h-0 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-3.5 shadow-2xs justify-between overflow-hidden">
          <div className="shrink-0 flex items-center justify-between mb-2">
            <div>
              <h3 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white flex items-center gap-1.5 leading-tight">
                <BarChart3 className="w-4 h-4 text-blue-500" />
                <span>Availability Health Breakdown</span>
              </h3>
              <p className="text-[11px] text-slate-400">
                Current operational status of water distribution points
              </p>
            </div>
            <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              {functionalRate}% Operational
            </span>
          </div>

          {/* Progress Bars */}
          <div className="flex-1 min-h-0 overflow-y-auto space-y-2.5 py-1">
            {/* Normal Flow */}
            <div>
              <div className="flex justify-between text-xs mb-1 font-semibold text-slate-700 dark:text-slate-300">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
                  Available / Normal Flow
                </span>
                <span className="font-bold">
                  {m.availableCount} ({Math.round((m.availableCount / total) * 100)}%)
                </span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-emerald-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${(m.availableCount / total) * 100}%` }}
                />
              </div>
            </div>

            {/* Limited Supply */}
            <div>
              <div className="flex justify-between text-xs mb-1 font-semibold text-slate-700 dark:text-slate-300">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-500 inline-block" />
                  Limited Supply / Low Pressure
                </span>
                <span className="font-bold">
                  {m.limitedCount} ({Math.round((m.limitedCount / total) * 100)}%)
                </span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-amber-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${(m.limitedCount / total) * 100}%` }}
                />
              </div>
            </div>

            {/* Temporarily Unavailable */}
            <div>
              <div className="flex justify-between text-xs mb-1 font-semibold text-slate-700 dark:text-slate-300">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-rose-500 inline-block" />
                  Temporarily Unavailable / Dry
                </span>
                <span className="font-bold">
                  {m.unavailableCount} ({Math.round((m.unavailableCount / total) * 100)}%)
                </span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-rose-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${(m.unavailableCount / total) * 100}%` }}
                />
              </div>
            </div>
          </div>

          {/* Telemetry info callout */}
          <div className="shrink-0 p-2.5 rounded-xl bg-blue-50/60 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/40 text-[11px] text-blue-800 dark:text-blue-300 flex items-center gap-2.5 mt-2">
            <ShieldCheck className="w-4 h-4 text-blue-500 shrink-0" />
            <p className="leading-tight">
              Realtime telemetry tracks live municipal updates. As soon as a field inspection is logged or a citizen report is resolved, these metrics reflect immediately.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
