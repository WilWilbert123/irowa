// src/app/admin/(dashboard)/page.tsx
"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import {
  Droplets,
  Inbox,
  FileText,
  Users,
  MapPin,
  PlusCircle,
  Megaphone,
  Activity,
  ArrowRight,
  ShieldCheck,
  Clock,
} from "lucide-react";
import { AdminHeader } from "@/components/admin/admin-header";
import { MetricCard } from "@/components/admin/metric-card";
import { CategoryChart } from "@/components/admin/category-chart";
import { RecentReportsTable, RecentReportItem } from "@/components/admin/recent-reports-table";
import { getAdminDashboardMetricsAction } from "@/actions/analytics-actions";
import { getAllReportsAction } from "@/actions/report-actions";
import { AdminDashboardMetrics } from "@/types/admin";
import { useAdminRealtime } from "@/hooks/use-admin-realtime";
import { formatDate } from "@/lib/utils/date-utils";

export default function AdminOverviewPage() {
  const [metrics, setMetrics] = useState<AdminDashboardMetrics | null>(null);
  const [recentReports, setRecentReports] = useState<RecentReportItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadDashboardData = useCallback(async () => {
    try {
      const [metricsData, reportsData] = await Promise.all([
        getAdminDashboardMetricsAction(),
        getAllReportsAction(),
      ]);

      setMetrics(metricsData);

      // Map real reports to recent reports format
      const mappedReports: RecentReportItem[] = (reportsData || []).slice(0, 5).map((rep) => ({
        id: rep.id,
        title: `${rep.report_type} at ${rep.water_source?.name || "Water Source"}`,
        date: formatDate(rep.created_at),
        category: rep.water_source?.category || "Community Report",
        badge:
          rep.status === "pending"
            ? "Pending"
            : rep.status === "investigating"
            ? "Investigating"
            : "Resolved",
        waterSourceId: rep.water_source_id,
      }));

      setRecentReports(mappedReports);
    } catch (err) {
      console.error("Failed to load dashboard metrics:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Realtime synchronization hook across all relevant Supabase tables
  const { isLive, lastSync, isRefreshing, triggerRefresh } = useAdminRealtime({
    onSync: loadDashboardData,
  });

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  const defaultMetrics: AdminDashboardMetrics = {
    totalWaterSources: 8,
    availableCount: 7,
    limitedCount: 1,
    unavailableCount: 0,
    pendingSubmissionsCount: 0,
    pendingReportsCount: 0,
    totalChatMessages: 0,
    totalSubmissionsCount: 0,
    totalReportsCount: 0,
    activeVisitorsCount: 0,
    recentActivity: [],
    categoryBreakdown: {},
  };

  const m = metrics || defaultMetrics;

  return (
    <div className="space-y-6">
      <AdminHeader
        title="Dashboard Overview"
        subtitle="Live status of Irosin municipal water infrastructure, citizen submissions, and community reports."
        actionButton={{
          href: "/admin/water-sources/new",
          label: "Add Water Source",
        }}
        isLive={isLive}
        lastSync={lastSync}
        isRefreshing={isRefreshing || isLoading}
        onRefresh={triggerRefresh}
      />

      {/* Top 4 Real-time Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        <MetricCard
          title="Total Water Points"
          value={m.totalWaterSources}
          icon={Droplets}
          iconColor="text-blue-500"
          iconBg="bg-blue-50 dark:bg-blue-950/40"
          change={`${m.availableCount} actively dispensing`}
          isPositive={true}
          badge={`${m.limitedCount} limited`}
        />

        <MetricCard
          title="Submissions Queue"
          value={m.pendingSubmissionsCount}
          icon={Inbox}
          iconColor="text-emerald-500"
          iconBg="bg-emerald-50 dark:bg-emerald-950/40"
          change={
            m.pendingSubmissionsCount > 0
              ? `${m.pendingSubmissionsCount} pending admin review`
              : "Queue clear"
          }
          isPositive={m.pendingSubmissionsCount === 0}
          badge={`${m.totalSubmissionsCount || 0} total`}
        />

        <MetricCard
          title="Citizen Reports"
          value={m.pendingReportsCount}
          icon={FileText}
          iconColor="text-rose-500"
          iconBg="bg-rose-50 dark:bg-rose-950/40"
          change={
            m.pendingReportsCount > 0
              ? `${m.pendingReportsCount} requires field check`
              : "No reported hazards"
          }
          isPositive={m.pendingReportsCount === 0}
          badge={`${m.totalReportsCount || 0} all-time`}
        />

        <MetricCard
          title="Active Sessions & Chats"
          value={m.activeVisitorsCount && m.activeVisitorsCount > 0 ? m.activeVisitorsCount : m.totalChatMessages}
          icon={Users}
          iconColor="text-purple-500"
          iconBg="bg-purple-50 dark:bg-purple-950/40"
          change={`${m.totalChatMessages} community messages`}
          isPositive={true}
          badge="Real-time"
        />
      </div>

      {/* Quick Action Navigation Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <Link
          href="/admin/map"
          className="flex items-center gap-3 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-blue-500 hover:shadow-xs transition-all group"
        >
          <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-500 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
            <MapPin className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <h4 className="font-bold text-xs text-slate-900 dark:text-slate-100 truncate">
              Map Editor
            </h4>
            <span className="text-[11px] text-slate-400 block truncate">
              Place & reposition pins
            </span>
          </div>
        </Link>

        <Link
          href="/admin/submissions"
          className="flex items-center gap-3 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-emerald-500 hover:shadow-xs transition-all group"
        >
          <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-500 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
            <Inbox className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <h4 className="font-bold text-xs text-slate-900 dark:text-slate-100 truncate">
                Submissions
              </h4>
              {m.pendingSubmissionsCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-amber-500 text-amber-950">
                  {m.pendingSubmissionsCount}
                </span>
              )}
            </div>
            <span className="text-[11px] text-slate-400 block truncate">
              Review citizen taps
            </span>
          </div>
        </Link>

        <Link
          href="/admin/reports"
          className="flex items-center gap-3 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-rose-500 hover:shadow-xs transition-all group"
        >
          <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-500 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
            <FileText className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <h4 className="font-bold text-xs text-slate-900 dark:text-slate-100 truncate">
                Reports
              </h4>
              {m.pendingReportsCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-rose-500 text-white animate-pulse">
                  {m.pendingReportsCount}
                </span>
              )}
            </div>
            <span className="text-[11px] text-slate-400 block truncate">
              Resolve reported defects
            </span>
          </div>
        </Link>

        <Link
          href="/admin/announcements/new"
          className="flex items-center gap-3 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-purple-500 hover:shadow-xs transition-all group"
        >
          <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-500 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
            <Megaphone className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <h4 className="font-bold text-xs text-slate-900 dark:text-slate-100 truncate">
              Post Advisory
            </h4>
            <span className="text-[11px] text-slate-400 block truncate">
              Broadcast municipal alerts
            </span>
          </div>
        </Link>
      </div>

      {/* Main Two Column Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Donut Breakdown Card */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                Water Sources by Category
              </h3>
              <p className="text-xs text-slate-400">
                Distribution across municipal and natural resources
              </p>
            </div>
            <Link
              href="/admin/water-sources"
              className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-semibold flex items-center gap-1"
            >
              <span>View All ({m.totalWaterSources})</span>
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          <CategoryChart
            data={m.categoryBreakdown}
            totalCount={m.totalWaterSources}
          />
        </div>

        {/* Recent Community Reports Card */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="font-bold text-base text-slate-900 dark:text-white">
                  Recent Community Reports
                </h3>
                <p className="text-xs text-slate-400">
                  Citizen defect flags and status reports
                </p>
              </div>
              <Link
                href="/admin/reports"
                className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-semibold flex items-center gap-1"
              >
                <span>
                  Manage {m.pendingReportsCount > 0 ? `(${m.pendingReportsCount} pending)` : ""}
                </span>
                <ArrowRight className="h-3 w-3" />
              </Link>
            </div>

            <RecentReportsTable reports={recentReports} />
          </div>

          {recentReports.length > 0 && (
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-right">
              <Link
                href="/admin/reports"
                className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
              >
                View full reports queue →
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Live System Activity Feed */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-blue-500" />
            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              Live Operations & Activity Feed
            </h3>
          </div>
          <span className="text-[11px] font-semibold text-emerald-500 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Active Realtime Stream
          </span>
        </div>

        {m.recentActivity && m.recentActivity.length > 0 ? (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {m.recentActivity.map((act) => (
              <div
                key={act.id}
                className="py-3 sm:py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs hover:bg-slate-50/50 dark:hover:bg-slate-800/30 px-2 rounded-xl transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-blue-500 shrink-0" />
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {act.title}
                  </span>
                </div>

                <div className="flex items-center gap-3 text-slate-400 shrink-0 pl-5 sm:pl-0">
                  <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-medium text-[10px]">
                    {act.type}
                  </span>
                  <div className="flex items-center gap-1 text-[11px]">
                    <Clock className="w-3 h-3" />
                    <span>{act.timestamp}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-8 text-center text-slate-400 text-xs">
            No recent activity recorded yet. System events will stream here automatically.
          </div>
        )}
      </div>
    </div>
  );
}
