// src/app/admin/(dashboard)/announcements/page.tsx
"use client";

import React, { useEffect, useState, useCallback, useMemo } from "react";
import Link from "next/link";
import {
  Plus,
  Bell,
  AlertTriangle,
  Calendar,
  Megaphone,
  Loader2,
  Search,
  X,
  Radio,
  Clock,
  CheckCircle2,
  ExternalLink,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { getActiveAnnouncementsAction } from "@/actions/notification-actions";
import { Announcement } from "@/types/notification";
import { formatDate } from "@/lib/utils/date-utils";
import { AdminHeader } from "@/components/admin/admin-header";
import { useAdminRealtime } from "@/hooks/use-admin-realtime";
import { cn } from "@/lib/utils";

export default function AdminAnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterPriority, setFilterPriority] = useState<string>("all");

  const loadData = useCallback(async () => {
    try {
      const data = await getActiveAnnouncementsAction();
      setAnnouncements(data);
    } catch (err) {
      console.error("Failed to load announcements", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const { isLive, lastSync, isRefreshing, triggerRefresh } = useAdminRealtime({
    tables: ["announcements"],
    onSync: loadData,
  });

  useEffect(() => {
    loadData();
  }, [loadData]);

  const urgentCount = announcements.filter((a) => a.priority === "urgent").length;
  const highCount = announcements.filter((a) => a.priority === "high").length;
  const normalCount = announcements.filter(
    (a) => a.priority === "normal" || a.priority === "low"
  ).length;

  const filterTabs = [
    { key: "all", label: "All", count: announcements.length },
    { key: "urgent", label: "Urgent", count: urgentCount },
    { key: "high", label: "High", count: highCount },
    { key: "normal", label: "Normal", count: normalCount },
  ];

  const filtered = useMemo(() => {
    return announcements.filter((ann) => {
      const matchesPriority =
        filterPriority === "all" ||
        (filterPriority === "normal"
          ? ann.priority === "normal" || ann.priority === "low"
          : ann.priority === filterPriority);
      const matchesSearch =
        ann.title.toLowerCase().includes(search.toLowerCase()) ||
        ann.body.toLowerCase().includes(search.toLowerCase());
      return matchesPriority && matchesSearch;
    });
  }, [announcements, filterPriority, search]);

  return (
    <div className="flex flex-col min-w-0 lg:h-[calc(100dvh-4.5rem)] space-y-2.5">
      {/* Compact Top Header */}
      <AdminHeader
        title="Official Advisories & Announcements"
        subtitle="Publish and broadcast municipal water advisories, emergency drought notices, and routine maintenance bulletins."
        actionButton={{
          href: "/admin/announcements/new",
          label: "New Announcement",
        }}
        isLive={isLive}
        lastSync={lastSync}
        isRefreshing={isRefreshing || loading}
        onRefresh={triggerRefresh}
        badgeCount={announcements.length}
        compact={true}
        className="shrink-0 mb-0 pb-2.5"
      />

      {/* Sleek Toolbar: Search & Priority Filter Tabs */}
      <div className="shrink-0 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 bg-white dark:bg-slate-900 p-2 sm:p-2.5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xs">
        {/* Search Input */}
        <div className="relative flex-1 min-w-[220px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search advisories and announcements..."
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

        {/* Priority Filter Pills */}
        <div className="flex items-center gap-1 overflow-x-auto pb-0.5 sm:pb-0 scrollbar-none shrink-0">
          {filterTabs.map((tab) => {
            const isActive = filterPriority === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setFilterPriority(tab.key)}
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
          <p className="text-xs font-medium">Loading municipal advisories...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs space-y-3">
          <div className="w-11 h-11 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center">
            <Megaphone className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              No Active Advisories Found
            </h3>
            <p className="text-xs text-slate-400 max-w-sm mt-0.5">
              {search || filterPriority !== "all"
                ? "No announcements match your search or filter criteria."
                : "Broadcast emergency alerts or scheduled maintenance advisories to all citizens across public pages."}
            </p>
          </div>
          {search || filterPriority !== "all" ? (
            <button
              type="button"
              onClick={() => {
                setSearch("");
                setFilterPriority("all");
              }}
              className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer"
            >
              Reset Filters
            </button>
          ) : (
            <Link
              href="/admin/announcements/new"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create Announcement</span>
            </Link>
          )}
        </div>
      ) : (
        <>
          {/* Desktop Table View - Fits screen with internal scroll */}
          <div className="hidden md:flex flex-1 min-h-0 flex-col rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs overflow-hidden">
            <div className="flex-1 overflow-y-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="sticky top-0 z-10 bg-slate-50/95 dark:bg-slate-850/95 backdrop-blur-xs border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="py-2.5 px-4">Advisory Title</th>
                    <th className="py-2.5 px-3">Priority</th>
                    <th className="py-2.5 px-3">Announcement Content</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-4 text-right">Published Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 text-slate-700 dark:text-slate-300">
                  {filtered.map((ann) => {
                    const isUrgent = ann.priority === "urgent";
                    const isHigh = ann.priority === "high";

                    return (
                      <tr
                        key={ann.id}
                        className="hover:bg-slate-50/70 dark:hover:bg-slate-800/50 transition-colors group"
                      >
                        {/* Title with Priority Icon */}
                        <td className="py-2.5 px-4 font-bold text-slate-900 dark:text-white">
                          <div className="flex items-center gap-2">
                            <div
                              className={cn(
                                "w-6 h-6 rounded-lg flex items-center justify-center shrink-0",
                                isUrgent
                                  ? "bg-rose-500/10 text-rose-600 dark:text-rose-400"
                                  : isHigh
                                  ? "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                                  : "bg-blue-500/10 text-blue-600 dark:text-blue-400"
                              )}
                            >
                              {isUrgent ? (
                                <AlertTriangle className="w-3.5 h-3.5" />
                              ) : isHigh ? (
                                <Bell className="w-3.5 h-3.5" />
                              ) : (
                                <Megaphone className="w-3.5 h-3.5" />
                              )}
                            </div>
                            <span className="truncate max-w-[220px] lg:max-w-xs">{ann.title}</span>
                          </div>
                        </td>

                        {/* Priority Badge */}
                        <td className="py-2.5 px-3">
                          <span
                            className={cn(
                              "px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider inline-flex items-center gap-1.5",
                              isUrgent
                                ? "bg-rose-500/10 text-rose-700 dark:text-rose-300 border border-rose-500/20"
                                : isHigh
                                ? "bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20"
                                : "bg-blue-500/10 text-blue-700 dark:text-blue-300 border border-blue-500/20"
                            )}
                          >
                            <span
                              className={cn(
                                "w-1.5 h-1.5 rounded-full",
                                isUrgent ? "bg-rose-500 animate-pulse" : isHigh ? "bg-amber-500" : "bg-blue-500"
                              )}
                            />
                            <span>{ann.priority}</span>
                          </span>
                        </td>

                        {/* Body Preview */}
                        <td className="py-2.5 px-3 text-slate-600 dark:text-slate-300 max-w-[320px]">
                          <p className="line-clamp-2 text-xs leading-relaxed" title={ann.body}>
                            {ann.body}
                          </p>
                        </td>

                        {/* Status */}
                        <td className="py-2.5 px-3">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 uppercase tracking-wider">
                            {ann.status}
                          </span>
                        </td>

                        {/* Published Date */}
                        <td className="py-2.5 px-4 text-right text-slate-400 text-[11px] whitespace-nowrap">
                          {formatDate(ann.published_at || ann.created_at)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Table Footer Status Bar */}
            <div className="shrink-0 px-4 py-2 bg-slate-50/90 dark:bg-slate-850/90 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
              <span>
                Showing <strong className="text-slate-700 dark:text-slate-200">{filtered.length}</strong> of{" "}
                <strong>{announcements.length}</strong> broadcast advisories
              </span>
              <span className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400 font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                Live municipal broadcast network
              </span>
            </div>
          </div>

          {/* Mobile Responsive Cards View (Shown on < md screens) */}
          <div className="md:hidden flex-1 overflow-y-auto space-y-2.5 pb-24">
            {filtered.map((ann) => {
              const isUrgent = ann.priority === "urgent";
              const isHigh = ann.priority === "high";

              return (
                <div
                  key={ann.id}
                  className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-3 shadow-2xs space-y-2 hover:border-slate-300 dark:hover:border-slate-700 transition-all"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={cn(
                        "px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider inline-flex items-center gap-1",
                        isUrgent
                          ? "bg-rose-500/10 text-rose-700 dark:text-rose-300 border border-rose-500/20"
                          : isHigh
                          ? "bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20"
                          : "bg-blue-500/10 text-blue-700 dark:text-blue-300 border border-blue-500/20"
                      )}
                    >
                      <span
                        className={cn(
                          "w-1.5 h-1.5 rounded-full",
                          isUrgent ? "bg-rose-500 animate-pulse" : isHigh ? "bg-amber-500" : "bg-blue-500"
                        )}
                      />
                      <span>{ann.priority} Priority</span>
                    </span>

                    <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                      {ann.status}
                    </span>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <div
                      className={cn(
                        "w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5",
                        isUrgent
                          ? "bg-rose-500/10 text-rose-600 dark:text-rose-400"
                          : isHigh
                          ? "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                          : "bg-blue-500/10 text-blue-600 dark:text-blue-400"
                      )}
                    >
                      {isUrgent ? (
                        <AlertTriangle className="w-4 h-4" />
                      ) : isHigh ? (
                        <Bell className="w-4 h-4" />
                      ) : (
                        <Megaphone className="w-4 h-4" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-bold text-sm text-slate-900 dark:text-white leading-snug">
                        {ann.title}
                      </h3>
                      <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed line-clamp-3">
                        {ann.body}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800/80 text-[11px] text-slate-400">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{formatDate(ann.published_at || ann.created_at)}</span>
                    </div>

                    <span className="text-blue-600 dark:text-blue-400 font-semibold">
                      Broadcast Active
                    </span>
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
