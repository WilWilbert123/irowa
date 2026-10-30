// src/app/admin/(dashboard)/water-sources/page.tsx
"use client";

import React, { useEffect, useState, useCallback, useMemo } from "react";
import Link from "next/link";
import { AdminHeader } from "@/components/admin/admin-header";
import { getAllWaterSourcesAction, archiveWaterSourceAction } from "@/actions/water-actions";
import { AVAILABILITY_BADGES, CATEGORY_COLORS } from "@/lib/utils/constants";
import { formatDate } from "@/lib/utils/date-utils";
import {
  Eye,
  Edit,
  Trash2,
  Search,
  Droplets,
  MapPin,
  Loader2,
  X,
  ExternalLink,
  Plus,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { WaterSource } from "@/types/water";
import { useAdminRealtime } from "@/hooks/use-admin-realtime";
import { Input } from "@/components/ui/input";

export default function AdminWaterSourcesPage() {
  const [sources, setSources] = useState<WaterSource[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [archivingId, setArchivingId] = useState<string | null>(null);

  const loadSources = useCallback(async () => {
    try {
      const data = await getAllWaterSourcesAction();
      setSources(data);
    } catch (err) {
      console.error("Failed to load water sources:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const { isLive, lastSync, isRefreshing, triggerRefresh } = useAdminRealtime({
    tables: ["water_sources"],
    onSync: loadSources,
  });

  useEffect(() => {
    loadSources();
  }, [loadSources]);

  const handleArchive = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to archive "${name}" from the active public map?`)) {
      return;
    }
    setArchivingId(id);
    try {
      const res = await archiveWaterSourceAction(id);
      if (res.success) {
        setSources((prev) => prev.filter((s) => s.id !== id));
      } else {
        alert(res.error || "Failed to archive water source");
      }
    } catch (err: any) {
      alert(err.message || "Failed to archive water source");
    } finally {
      setArchivingId(null);
    }
  };

  const filtered = useMemo(() => {
    return sources.filter((s) => {
      const matchesStatus =
        filterStatus === "all" ||
        s.availability_status.toLowerCase() === filterStatus.toLowerCase();
      const matchesSearch =
        s.name.toLowerCase().includes(search.toLowerCase()) ||
        (s.barangay && s.barangay.toLowerCase().includes(search.toLowerCase())) ||
        s.category.toLowerCase().includes(search.toLowerCase());
      return matchesStatus && matchesSearch;
    });
  }, [sources, filterStatus, search]);

  const availableCount = sources.filter((s) => s.availability_status === "Available").length;
  const limitedCount = sources.filter((s) => s.availability_status === "Limited Supply").length;
  const unavailableCount = sources.filter(
    (s) =>
      s.availability_status === "Temporarily Unavailable" ||
      s.availability_status === "Seasonal"
  ).length;

  const filterTabs = [
    { key: "all", label: "All", count: sources.length },
    { key: "Available", label: "Available", count: availableCount },
    { key: "Limited Supply", label: "Limited Supply", count: limitedCount },
    { key: "Temporarily Unavailable", label: "Unavailable", count: unavailableCount },
  ];

  return (
    <div className="flex flex-col min-w-0 lg:h-[calc(100dvh-4.5rem)] space-y-2.5">
      {/* Compact Top Header */}
      <AdminHeader
        title="Water Sources Management"
        subtitle={`Managing ${sources.length} approved municipal and natural water resources in Irosin.`}
        actionButton={{
          href: "/admin/water-sources/new",
          label: "Create New Resource",
        }}
        isLive={isLive}
        lastSync={lastSync}
        isRefreshing={isRefreshing || loading}
        onRefresh={triggerRefresh}
        badgeCount={sources.length}
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
            placeholder="Search by name, barangay, or type..."
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
          <p className="text-xs font-medium">Loading water sources catalogue...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs space-y-3">
          <div className="w-11 h-11 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center">
            <Droplets className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              No Water Sources Found
            </h3>
            <p className="text-xs text-slate-400 max-w-sm mt-0.5">
              {search
                ? `No results match "${search}". Try clearing search keywords.`
                : "No water sources match the selected status filter."}
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
          {/* Desktop Table View - Designed to fit screen with internal scroll if needed */}
          <div className="hidden md:flex flex-1 min-h-0 flex-col rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs overflow-hidden">
            <div className="flex-1 overflow-y-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="sticky top-0 z-10 bg-slate-50/95 dark:bg-slate-850/95 backdrop-blur-xs border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="py-2.5 px-4">Resource Name</th>
                    <th className="py-2.5 px-3">Category</th>
                    <th className="py-2.5 px-3">Barangay</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3">Last Verified</th>
                    <th className="py-2.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 text-slate-700 dark:text-slate-300">
                  {filtered.map((source) => {
                    const badge =
                      AVAILABILITY_BADGES[source.availability_status] ||
                      AVAILABILITY_BADGES["Available"];
                    const catDef =
                      CATEGORY_COLORS[source.category] || CATEGORY_COLORS["Other"];

                    return (
                      <tr
                        key={source.id}
                        className="hover:bg-slate-50/70 dark:hover:bg-slate-800/50 transition-colors group"
                      >
                        {/* Name */}
                        <td className="py-2.5 px-4 font-bold text-slate-900 dark:text-white">
                          <Link
                            href={`/admin/water-sources/${source.id}`}
                            className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors inline-flex items-center gap-1.5"
                          >
                            <span>{source.name}</span>
                          </Link>
                        </td>

                        {/* Category */}
                        <td className="py-2.5 px-3">
                          <span
                            className={cn(
                              "px-2 py-0.5 rounded-full font-semibold text-[10px] inline-block",
                              catDef.bg,
                              catDef.text
                            )}
                          >
                            {source.category}
                          </span>
                        </td>

                        {/* Barangay */}
                        <td className="py-2.5 px-3 font-medium text-slate-600 dark:text-slate-300">
                          <div className="flex items-center gap-1 text-slate-600 dark:text-slate-400">
                            <MapPin className="w-3 h-3 text-blue-500 shrink-0" />
                            <span className="truncate max-w-[140px]">
                              {source.barangay ? `Brgy. ${source.barangay}` : "Irosin Central"}
                            </span>
                          </div>
                        </td>

                        {/* Status */}
                        <td className="py-2.5 px-3">
                          <span
                            className={cn(
                              "px-2 py-0.5 rounded-full font-semibold text-[10px] inline-flex items-center gap-1.5",
                              badge.bg
                            )}
                          >
                            <span className={cn("w-1.5 h-1.5 rounded-full", badge.dot)} />
                            <span>{source.availability_status}</span>
                          </span>
                        </td>

                        {/* Last Verified */}
                        <td className="py-2.5 px-3 text-slate-400 text-[11px]">
                          {formatDate(source.last_verified_at)}
                        </td>

                        {/* Actions */}
                        <td className="py-2.5 px-4 text-right space-x-1 shrink-0">
                          <Link
                            href={`/water/${source.slug}`}
                            target="_blank"
                            className="inline-flex p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-slate-800 transition-colors"
                            title="View Public Map Page"
                          >
                            <Eye className="h-3.5 w-3.5" />
                          </Link>
                          <Link
                            href={`/admin/water-sources/${source.id}/edit`}
                            className="inline-flex p-1.5 rounded-lg text-slate-400 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-slate-800 transition-colors"
                            title="Edit Resource Details"
                          >
                            <Edit className="h-3.5 w-3.5" />
                          </Link>
                          <button
                            type="button"
                            onClick={() => handleArchive(source.id, source.name)}
                            disabled={archivingId === source.id}
                            className="inline-flex p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-slate-800 transition-colors cursor-pointer disabled:opacity-50"
                            title="Archive / Remove from Public Map"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
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
                  <strong>{sources.length}</strong> resources
                </span>
                {filterStatus !== "all" && (
                  <span className="text-blue-500 font-medium">({filterStatus} filter applied)</span>
                )}
              </div>
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  Live municipal database
                </span>
              </div>
            </div>
          </div>

          {/* Mobile Responsive Cards View (Shown on < md screens) */}
          <div className="md:hidden flex-1 overflow-y-auto space-y-2.5 pb-24">
            {filtered.map((source) => {
              const badge =
                AVAILABILITY_BADGES[source.availability_status] ||
                AVAILABILITY_BADGES["Available"];
              const catDef =
                CATEGORY_COLORS[source.category] || CATEGORY_COLORS["Other"];

              return (
                <div
                  key={source.id}
                  className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-3 shadow-2xs space-y-2 hover:border-slate-300 dark:hover:border-slate-700 transition-all"
                >
                  {/* Top Bar: Category & Status */}
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={cn(
                        "px-2 py-0.5 rounded-full font-semibold text-[10px]",
                        catDef.bg,
                        catDef.text
                      )}
                    >
                      {source.category}
                    </span>

                    <span
                      className={cn(
                        "px-2 py-0.5 rounded-full font-semibold text-[10px] inline-flex items-center gap-1.5 shrink-0",
                        badge.bg
                      )}
                    >
                      <span className={cn("w-1.5 h-1.5 rounded-full", badge.dot)} />
                      {source.availability_status}
                    </span>
                  </div>

                  {/* Title & Barangay */}
                  <div>
                    <Link
                      href={`/admin/water-sources/${source.id}`}
                      className="font-bold text-sm text-slate-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 block"
                    >
                      {source.name}
                    </Link>
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mt-1">
                      <MapPin className="w-3 h-3 text-blue-500 shrink-0" />
                      <span>{source.barangay ? `Brgy. ${source.barangay}` : "Irosin Central"}</span>
                      <span className="text-slate-300 dark:text-slate-600">•</span>
                      <span className="text-[11px] text-slate-400">
                        {formatDate(source.last_verified_at)}
                      </span>
                    </div>
                  </div>

                  {/* Actions Row */}
                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800/80">
                    <Link
                      href={`/water/${source.slug}`}
                      target="_blank"
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      <ExternalLink className="w-3 h-3" />
                      <span>Public Page</span>
                    </Link>

                    <div className="flex items-center gap-1">
                      <Link
                        href={`/admin/water-sources/${source.id}/edit`}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-amber-600 dark:hover:text-amber-400 text-xs font-medium transition-colors"
                        title="Edit Resource"
                      >
                        <Edit className="h-3 w-3" />
                        <span>Edit</span>
                      </Link>
                      <button
                        type="button"
                        onClick={() => handleArchive(source.id, source.name)}
                        disabled={archivingId === source.id}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400 hover:bg-rose-500/20 text-xs font-medium transition-colors cursor-pointer disabled:opacity-50"
                        title="Archive Resource"
                      >
                        <Trash2 className="h-3 w-3" />
                        <span>Archive</span>
                      </button>
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
