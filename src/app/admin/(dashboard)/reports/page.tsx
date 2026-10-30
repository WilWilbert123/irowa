// src/app/admin/(dashboard)/reports/page.tsx
"use client";

import React, { useEffect, useState, useCallback, useMemo } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  Search,
  Eye,
  MapPin,
  ShieldCheck,
  Check,
  X,
  Loader2,
  ExternalLink,
  ShieldAlert,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { getAllReportsAction, updateReportStatusAction } from "@/actions/report-actions";
import { WaterReport } from "@/types/report";
import { REPORT_TYPE_LABELS } from "@/lib/utils/constants";
import { formatDate } from "@/lib/utils/date-utils";
import { useAdminRealtime } from "@/hooks/use-admin-realtime";
import { AdminHeader } from "@/components/admin/admin-header";
import { cn } from "@/lib/utils";

export default function AdminReportsPage() {
  const [reports, setReports] = useState<WaterReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const loadReports = useCallback(async () => {
    try {
      const data = await getAllReportsAction();
      setReports(data);
    } catch (err) {
      console.error("Failed to load reports", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const { isLive, lastSync, isRefreshing, triggerRefresh } = useAdminRealtime({
    tables: ["water_reports"],
    onSync: loadReports,
  });

  useEffect(() => {
    loadReports();
  }, [loadReports]);

  const handleUpdateStatus = async (
    reportId: string,
    status: "investigating" | "resolved" | "dismissed"
  ) => {
    setUpdatingId(reportId);
    try {
      const res = await updateReportStatusAction(
        reportId,
        status,
        `Status updated to ${status} by administrator`
      );
      if (res.success) {
        setReports((prev) =>
          prev.map((r) => (r.id === reportId ? { ...r, status } : r))
        );
      } else {
        alert("Failed to update report status");
      }
    } catch (err: any) {
      alert(err.message || "Failed to update report");
    } finally {
      setUpdatingId(null);
    }
  };

  const filtered = useMemo(() => {
    return reports.filter((rep) => {
      const matchesStatus = filterStatus === "all" || rep.status === filterStatus;
      const matchesSearch =
        (rep.water_source?.name &&
          rep.water_source.name.toLowerCase().includes(search.toLowerCase())) ||
        (rep.description && rep.description.toLowerCase().includes(search.toLowerCase())) ||
        (rep.report_type && rep.report_type.toLowerCase().includes(search.toLowerCase())) ||
        (rep.water_source?.barangay &&
          rep.water_source.barangay.toLowerCase().includes(search.toLowerCase()));
      return matchesStatus && matchesSearch;
    });
  }, [reports, filterStatus, search]);

  const pendingCount = reports.filter((r) => r.status === "pending").length;
  const investigatingCount = reports.filter((r) => r.status === "investigating").length;
  const resolvedCount = reports.filter((r) => r.status === "resolved").length;
  const dismissedCount = reports.filter((r) => r.status === "dismissed").length;

  const filterTabs = [
    { key: "all", label: "All", count: reports.length },
    { key: "pending", label: "Pending", count: pendingCount },
    { key: "investigating", label: "Investigating", count: investigatingCount },
    { key: "resolved", label: "Resolved", count: resolvedCount },
    { key: "dismissed", label: "Dismissed", count: dismissedCount },
  ];

  return (
    <div className="flex flex-col min-w-0 lg:h-[calc(100dvh-4.5rem)] space-y-2.5">
      {/* Compact Top Header */}
      <AdminHeader
        title="Community Reports"
        subtitle="Investigate reported inaccuracies, dried-up sources, and safety hazards reported by local citizens."
        isLive={isLive}
        lastSync={lastSync}
        isRefreshing={isRefreshing || loading}
        onRefresh={triggerRefresh}
        badgeCount={pendingCount}
        compact={true}
        className="shrink-0 mb-0 pb-2.5"
      />

      {/* Sleek Toolbar: Search & Filter Tabs */}
      <div className="shrink-0 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 bg-white dark:bg-slate-900 p-2 sm:p-2.5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xs">
        {/* Search Input */}
        <div className="relative flex-1 min-w-[220px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search reports by water source, issue, or keyword..."
            className="pl-8.5 pr-8 h-8.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700/60 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:bg-white dark:focus:bg-slate-900"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              title="Clear search"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1 overflow-x-auto pb-0.5 sm:pb-0 scrollbar-none shrink-0">
          {filterTabs.map((tab) => {
            const isActive = filterStatus === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setFilterStatus(tab.key)}
                className={cn(
                  "px-2.5 py-1 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5",
                  isActive
                    ? "bg-blue-600 text-white shadow-2xs"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-700/70"
                )}
              >
                <span>{tab.label}</span>
                <span
                  className={cn(
                    "text-[10px] px-1.5 py-0.2 rounded-full font-bold",
                    isActive
                      ? "bg-white/20 text-white"
                      : "bg-slate-200/80 dark:bg-slate-700 text-slate-600 dark:text-slate-300"
                  )}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Content Area */}
      {loading ? (
        <div className="flex-1 flex flex-col items-center justify-center p-12 text-slate-400 space-y-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
          <Loader2 className="w-7 h-7 animate-spin text-blue-500" />
          <p className="text-xs font-medium">Connecting to community reports stream...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs space-y-3">
          <div className="w-11 h-11 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-500 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              No Community Reports Found
            </h3>
            <p className="text-xs text-slate-400 max-w-sm mt-0.5">
              {search || filterStatus !== "all"
                ? "No community reports match your search criteria."
                : "No reported water hazards or defect flags. Community reports submitted by citizens will appear here in real-time."}
            </p>
          </div>
          {(search || filterStatus !== "all") && (
            <button
              type="button"
              onClick={() => {
                setSearch("");
                setFilterStatus("all");
              }}
              className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
            >
              Reset Filters
            </button>
          )}
        </div>
      ) : (
        <>
          {/* Desktop Table View - Designed to fit screen with internal scroll */}
          <div className="hidden md:flex flex-1 min-h-0 flex-col rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs overflow-hidden">
            <div className="flex-1 overflow-y-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="sticky top-0 z-10 bg-slate-50/95 dark:bg-slate-850/95 backdrop-blur-xs border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="py-2.5 px-4">Water Source</th>
                    <th className="py-2.5 px-3">Reported Issue</th>
                    <th className="py-2.5 px-3">Description</th>
                    <th className="py-2.5 px-3">Date</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 text-slate-700 dark:text-slate-300">
                  {filtered.map((rep) => {
                    const isPending = rep.status === "pending";
                    const isInvestigating = rep.status === "investigating";
                    const isProcessing = updatingId === rep.id;
                    const reportLabel = REPORT_TYPE_LABELS[rep.report_type] || rep.report_type;

                    return (
                      <tr
                        key={rep.id}
                        className="hover:bg-slate-50/70 dark:hover:bg-slate-800/50 transition-colors group"
                      >
                        {/* Water Source & Location */}
                        <td className="py-2.5 px-4 font-bold text-slate-900 dark:text-white">
                          <Link
                            href={`/admin/reports/${rep.id}`}
                            className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors block"
                          >
                            <span>{rep.water_source?.name || "Unlinked Water Source"}</span>
                          </Link>
                          <div className="flex items-center gap-1 text-[11px] font-normal text-slate-400 mt-0.5">
                            <MapPin className="w-3 h-3 text-blue-500 shrink-0" />
                            <span>
                              {rep.water_source?.barangay ? `Brgy. ${rep.water_source.barangay}` : "Irosin"}
                            </span>
                          </div>
                        </td>

                        {/* Reported Issue */}
                        <td className="py-2.5 px-3">
                          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-500/10 text-rose-700 dark:text-rose-300 border border-rose-500/20">
                            <AlertTriangle className="w-3 h-3 text-rose-500 shrink-0" />
                            <span className="truncate max-w-[130px]">{reportLabel}</span>
                          </span>
                        </td>

                        {/* Description */}
                        <td className="py-2.5 px-3 text-slate-600 dark:text-slate-300 max-w-[220px]">
                          <p className="line-clamp-1 text-xs" title={rep.description}>
                            &quot;{rep.description}&quot;
                          </p>
                        </td>

                        {/* Date */}
                        <td className="py-2.5 px-3 text-slate-400 text-[11px] whitespace-nowrap">
                          {formatDate(rep.created_at)}
                        </td>

                        {/* Status */}
                        <td className="py-2.5 px-3">
                          <span
                            className={cn(
                              "px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider inline-flex items-center gap-1.5 shrink-0",
                              rep.status === "pending"
                                ? "bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20"
                                : rep.status === "investigating"
                                ? "bg-blue-500/10 text-blue-700 dark:text-blue-300 border border-blue-500/20"
                                : rep.status === "resolved"
                                ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20"
                                : "bg-slate-500/10 text-slate-600 dark:text-slate-400 border border-slate-500/20"
                            )}
                          >
                            <span
                              className={cn(
                                "w-1.5 h-1.5 rounded-full",
                                rep.status === "pending"
                                  ? "bg-amber-500"
                                  : rep.status === "investigating"
                                  ? "bg-blue-500 animate-pulse"
                                  : rep.status === "resolved"
                                  ? "bg-emerald-500"
                                  : "bg-slate-400"
                              )}
                            />
                            <span>{rep.status}</span>
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="py-2.5 px-4 text-right space-x-1 shrink-0">
                          {isPending ? (
                            <button
                              type="button"
                              onClick={() => handleUpdateStatus(rep.id, "investigating")}
                              disabled={isProcessing}
                              className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-[11px] shadow-2xs transition-colors disabled:opacity-50 cursor-pointer"
                              title="Begin Investigation"
                            >
                              <span>Investigate</span>
                            </button>
                          ) : rep.status === "investigating" ? (
                            <button
                              type="button"
                              onClick={() => handleUpdateStatus(rep.id, "resolved")}
                              disabled={isProcessing}
                              className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-[11px] shadow-2xs transition-colors disabled:opacity-50 cursor-pointer"
                              title="Mark as Resolved"
                            >
                              <Check className="w-3 h-3" />
                              <span>Resolve</span>
                            </button>
                          ) : null}

                          {rep.status !== "dismissed" && rep.status !== "resolved" && (
                            <button
                              type="button"
                              onClick={() => handleUpdateStatus(rep.id, "dismissed")}
                              disabled={isProcessing}
                              className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/40 dark:hover:text-rose-300 font-semibold text-[11px] transition-colors cursor-pointer"
                              title="Dismiss Report"
                            >
                              <X className="w-3 h-3" />
                              <span>Dismiss</span>
                            </button>
                          )}

                          <Link
                            href={`/admin/reports/${rep.id}`}
                            className="inline-flex p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-slate-800 transition-colors"
                            title="View Full Report Record"
                          >
                            <Eye className="h-3.5 w-3.5" />
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Table Footer Status Bar */}
            <div className="shrink-0 px-4 py-2 bg-slate-50/90 dark:bg-slate-850/90 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
              <div className="flex items-center gap-2">
                <span>
                  Showing <strong className="text-slate-700 dark:text-slate-200">{filtered.length}</strong> of{" "}
                  <strong>{reports.length}</strong> community reports
                </span>
                {filterStatus !== "all" && (
                  <span className="text-blue-500 font-medium">({filterStatus} view)</span>
                )}
              </div>
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1.5 text-rose-600 dark:text-rose-400 font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                  Live incident response queue
                </span>
              </div>
            </div>
          </div>

          {/* Mobile Responsive Cards View (Shown on < md screens) */}
          <div className="md:hidden flex-1 overflow-y-auto space-y-2.5 pb-24">
            {filtered.map((rep) => {
              const isPending = rep.status === "pending";
              const isInvestigating = rep.status === "investigating";
              const isProcessing = updatingId === rep.id;
              const reportLabel = REPORT_TYPE_LABELS[rep.report_type] || rep.report_type;

              return (
                <div
                  key={rep.id}
                  className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-3 shadow-2xs space-y-2 hover:border-slate-300 dark:hover:border-slate-700 transition-all"
                >
                  {/* Top Bar: Issue Type & Status */}
                  <div className="flex items-center justify-between gap-2">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-500/10 text-rose-700 dark:text-rose-300 border border-rose-500/20">
                      <AlertTriangle className="w-3 h-3 text-rose-500 shrink-0" />
                      <span className="truncate max-w-[140px]">{reportLabel}</span>
                    </span>

                    <span
                      className={cn(
                        "px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider inline-flex items-center gap-1 shrink-0",
                        rep.status === "pending"
                          ? "bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20"
                          : rep.status === "investigating"
                          ? "bg-blue-500/10 text-blue-700 dark:text-blue-300 border border-blue-500/20"
                          : rep.status === "resolved"
                          ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20"
                          : "bg-slate-500/10 text-slate-600 dark:text-slate-400 border border-slate-500/20"
                      )}
                    >
                      <span
                        className={cn(
                          "w-1.5 h-1.5 rounded-full",
                          rep.status === "pending"
                            ? "bg-amber-500"
                            : rep.status === "investigating"
                            ? "bg-blue-500 animate-pulse"
                            : rep.status === "resolved"
                            ? "bg-emerald-500"
                            : "bg-slate-400"
                        )}
                      />
                      <span>{rep.status}</span>
                    </span>
                  </div>

                  {/* Water Source & Description */}
                  <div>
                    <Link
                      href={`/admin/reports/${rep.id}`}
                      className="font-bold text-sm text-slate-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 block"
                    >
                      {rep.water_source?.name || "Unlinked Water Source"}
                    </Link>
                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 line-clamp-2 leading-relaxed">
                      &quot;{rep.description}&quot;
                    </p>
                  </div>

                  {/* Location & Date Info */}
                  <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-1.5 border-t border-slate-100 dark:border-slate-800/80">
                    <div className="flex items-center gap-1 truncate max-w-[140px]">
                      <MapPin className="w-3 h-3 text-blue-500 shrink-0" />
                      <span className="truncate">
                        {rep.water_source?.barangay ? `Brgy. ${rep.water_source.barangay}` : "Irosin"}
                      </span>
                    </div>

                    <div className="flex items-center gap-1 text-[11px] text-slate-400">
                      <Clock className="w-3 h-3 shrink-0" />
                      <span>{formatDate(rep.created_at)}</span>
                    </div>
                  </div>

                  {/* Actions Row */}
                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800/80">
                    <Link
                      href={`/admin/reports/${rep.id}`}
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      <Eye className="w-3 h-3" />
                      <span>View File</span>
                    </Link>

                    <div className="flex items-center gap-1.5">
                      {isPending ? (
                        <button
                          type="button"
                          onClick={() => handleUpdateStatus(rep.id, "investigating")}
                          disabled={isProcessing}
                          className="px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition-colors shadow-2xs cursor-pointer"
                        >
                          Investigate
                        </button>
                      ) : rep.status === "investigating" ? (
                        <button
                          type="button"
                          onClick={() => handleUpdateStatus(rep.id, "resolved")}
                          disabled={isProcessing}
                          className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition-colors shadow-2xs cursor-pointer flex items-center gap-1"
                        >
                          <Check className="w-3 h-3" />
                          <span>Resolve</span>
                        </button>
                      ) : null}

                      {rep.status !== "dismissed" && rep.status !== "resolved" && (
                        <button
                          type="button"
                          onClick={() => handleUpdateStatus(rep.id, "dismissed")}
                          disabled={isProcessing}
                          className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 text-xs font-medium transition-colors cursor-pointer"
                        >
                          Dismiss
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
