// src/app/admin/(dashboard)/page.tsx
import React from "react";
import { AdminHeader } from "@/components/admin/admin-header";
import { MetricCard } from "@/components/admin/metric-card";
import { CategoryChart } from "@/components/admin/category-chart";
import { RecentReportsTable } from "@/components/admin/recent-reports-table";
import { getAdminDashboardMetrics } from "@/lib/services/analytics-service";
import Link from "next/link";
import { MapPin, PlusCircle, Inbox, Megaphone } from "lucide-react";

export default async function AdminOverviewPage() {
  const metrics = await getAdminDashboardMetrics();

  return (
    <div className="space-y-6">
      <AdminHeader
        title="Dashboard"
        subtitle="Overview of IroWa activity and system status."
        actionButton={{
          href: "/admin/water-sources/new",
          label: "Add Water Source",
        }}
      />

      {/* Top 4 Metric Cards matching Mockup 3 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <MetricCard
          title="Total Water Sources"
          value={metrics.totalWaterSources}
          change="+6% from last month"
        />
        <MetricCard
          title="Total Views"
          value="12,842"
          change="+18% from last month"
        />
        <MetricCard
          title="Community Reports"
          value={metrics.pendingReportsCount + 22}
          change="+35% from last month"
        />
        <MetricCard
          title="Active Users"
          value="1,248"
          change="+12% from last month"
        />
      </div>

      {/* Quick Actions Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Link
          href="/admin/map"
          className="flex items-center gap-2.5 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-blue-500 transition-colors shadow-xs"
        >
          <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-500 flex items-center justify-center shrink-0">
            <MapPin className="h-4 w-4" />
          </div>
          <div>
            <h4 className="font-bold text-xs text-slate-800 dark:text-slate-200">Map Editor</h4>
            <span className="text-[10px] text-slate-400">Position & drag markers</span>
          </div>
        </Link>

        <Link
          href="/admin/submissions"
          className="flex items-center gap-2.5 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-blue-500 transition-colors shadow-xs"
        >
          <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-500 flex items-center justify-center shrink-0">
            <Inbox className="h-4 w-4" />
          </div>
          <div>
            <h4 className="font-bold text-xs text-slate-800 dark:text-slate-200">
              Submissions ({metrics.pendingSubmissionsCount})
            </h4>
            <span className="text-[10px] text-slate-400">Review pending pins</span>
          </div>
        </Link>

        <Link
          href="/admin/announcements/new"
          className="flex items-center gap-2.5 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-blue-500 transition-colors shadow-xs"
        >
          <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-500 flex items-center justify-center shrink-0">
            <Megaphone className="h-4 w-4" />
          </div>
          <div>
            <h4 className="font-bold text-xs text-slate-800 dark:text-slate-200">Post Advisory</h4>
            <span className="text-[10px] text-slate-400">Broadcast banner</span>
          </div>
        </Link>

        <Link
          href="/admin/water-sources/new"
          className="flex items-center gap-2.5 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-blue-500 transition-colors shadow-xs"
        >
          <div className="w-8 h-8 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-500 flex items-center justify-center shrink-0">
            <PlusCircle className="h-4 w-4" />
          </div>
          <div>
            <h4 className="font-bold text-xs text-slate-800 dark:text-slate-200">New Water Point</h4>
            <span className="text-[10px] text-slate-400">Add directly</span>
          </div>
        </Link>
      </div>

      {/* Two Column Layout matching Mockup 3 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Donut Chart Card */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              Water Sources by Category
            </h3>
            <Link
              href="/admin/water-sources"
              className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-semibold"
            >
              View All
            </Link>
          </div>

          <CategoryChart
            data={metrics.categoryBreakdown}
            totalCount={metrics.totalWaterSources}
          />
        </div>

        {/* Recent Community Reports Card */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              Recent Reports
            </h3>
            <Link
              href="/admin/reports"
              className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-semibold"
            >
              Manage ({metrics.pendingReportsCount} pending)
            </Link>
          </div>

          <RecentReportsTable />
        </div>
      </div>
    </div>
  );
}
