// src/app/admin/(dashboard)/audit-logs/page.tsx
"use client";

import React, { useEffect, useState, useCallback, useMemo } from "react";
import {
  History,
  Shield,
  Calendar,
  Search,
  Loader2,
  Clock,
  Activity,
  X,
  FileCode,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { getAuditLogs } from "@/lib/services/audit-service";
import { AuditLogRow } from "@/types/admin";
import { formatDate } from "@/lib/utils/date-utils";
import { AdminHeader } from "@/components/admin/admin-header";
import { useAdminRealtime } from "@/hooks/use-admin-realtime";
import { cn } from "@/lib/utils";

export default function AdminAuditLogsPage() {
  const [logs, setLogs] = useState<AuditLogRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterEntity, setFilterEntity] = useState<string>("all");

  const loadLogs = useCallback(async () => {
    try {
      const data = await getAuditLogs();
      setLogs(data);
    } catch (err) {
      console.error("Failed to load audit logs", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const { isLive, lastSync, isRefreshing, triggerRefresh } = useAdminRealtime({
    tables: ["audit_logs"],
    onSync: loadLogs,
  });

  useEffect(() => {
    loadLogs();
  }, [loadLogs]);

  const entityTypes = useMemo(() => {
    const map: Record<string, number> = {};
    logs.forEach((l) => {
      if (l.entity_type) {
        map[l.entity_type] = (map[l.entity_type] || 0) + 1;
      }
    });
    return map;
  }, [logs]);

  const filtered = useMemo(() => {
    return logs.filter((l) => {
      const matchesEntity = filterEntity === "all" || l.entity_type === filterEntity;
      const matchesSearch =
        l.action.toLowerCase().includes(search.toLowerCase()) ||
        l.entity_type.toLowerCase().includes(search.toLowerCase()) ||
        (l.entity_id && l.entity_id.toLowerCase().includes(search.toLowerCase())) ||
        (l.details && JSON.stringify(l.details).toLowerCase().includes(search.toLowerCase()));

      return matchesEntity && matchesSearch;
    });
  }, [logs, filterEntity, search]);

  return (
    <div className="flex flex-col min-w-0 lg:h-[calc(100dvh-4.5rem)] space-y-2.5">
      {/* Compact Top Header */}
      <AdminHeader
        title="Audit Log Trail"
        subtitle="Immutable, real-time record of administrative actions, moderation events, and database mutations."
        isLive={isLive}
        lastSync={lastSync}
        isRefreshing={isRefreshing || loading}
        onRefresh={triggerRefresh}
        badgeCount={logs.length}
        compact={true}
        className="shrink-0 mb-0 pb-2.5"
      />

      {/* Sleek Toolbar: Search & Entity Filter Pills */}
      <div className="shrink-0 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 bg-white dark:bg-slate-900 p-2 sm:p-2.5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xs">
        {/* Search Input */}
        <div className="relative flex-1 min-w-[220px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Filter by action name, entity type, record ID, or details..."
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
          <button
            type="button"
            onClick={() => setFilterEntity("all")}
            className={cn(
              "px-2.5 py-1 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5",
              filterEntity === "all"
                ? "bg-blue-600 text-white shadow-2xs"
                : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-700/70"
            )}
          >
            <span>All Records</span>
            <span
              className={cn(
                "text-[10px] px-1.5 py-0.2 rounded-full font-bold",
                filterEntity === "all"
                  ? "bg-white/20 text-white"
                  : "bg-slate-200/80 dark:bg-slate-700 text-slate-600 dark:text-slate-300"
              )}
            >
              {logs.length}
            </span>
          </button>

          {Object.entries(entityTypes).map(([entity, count]) => {
            const isActive = filterEntity === entity;
            return (
              <button
                key={entity}
                type="button"
                onClick={() => setFilterEntity(entity)}
                className={cn(
                  "px-2.5 py-1 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 capitalize",
                  isActive
                    ? "bg-blue-600 text-white shadow-2xs"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-700/70"
                )}
              >
                <span>{entity.replace(/_/g, " ")}</span>
                <span
                  className={cn(
                    "text-[10px] px-1.5 py-0.2 rounded-full font-bold",
                    isActive
                      ? "bg-white/20 text-white"
                      : "bg-slate-200/80 dark:bg-slate-700 text-slate-600 dark:text-slate-300"
                  )}
                >
                  {count}
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
          <p className="text-xs font-medium">Loading immutable audit stream...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs space-y-3">
          <div className="w-11 h-11 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center">
            <History className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              No Audit Records Found
            </h3>
            <p className="text-xs text-slate-400 max-w-sm mt-0.5">
              {search || filterEntity !== "all"
                ? "No audit records match your search filter."
                : "Administrative actions performed across the dashboard will record here in real-time."}
            </p>
          </div>
          {(search || filterEntity !== "all") && (
            <button
              type="button"
              onClick={() => {
                setSearch("");
                setFilterEntity("all");
              }}
              className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer"
            >
              Reset Filters
            </button>
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
                    <th className="py-2.5 px-4">Timestamp</th>
                    <th className="py-2.5 px-3">Action</th>
                    <th className="py-2.5 px-3">Entity Type</th>
                    <th className="py-2.5 px-3">Entity ID</th>
                    <th className="py-2.5 px-4 text-right">Event Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 text-slate-700 dark:text-slate-300">
                  {filtered.map((log) => (
                    <tr
                      key={log.id}
                      className="hover:bg-slate-50/70 dark:hover:bg-slate-800/50 transition-colors group"
                    >
                      {/* Timestamp */}
                      <td className="py-2.5 px-4 text-slate-400 whitespace-nowrap font-mono text-[11px]">
                        {formatDate(log.created_at)}
                      </td>

                      {/* Action */}
                      <td className="py-2.5 px-3">
                        <span className="px-2 py-0.5 rounded-full font-mono font-bold text-[10px] bg-blue-500/10 text-blue-700 dark:text-blue-300 border border-blue-500/20 inline-block">
                          {log.action}
                        </span>
                      </td>

                      {/* Entity Type */}
                      <td className="py-2.5 px-3 font-semibold text-slate-900 dark:text-white capitalize">
                        {log.entity_type.replace(/_/g, " ")}
                      </td>

                      {/* Entity ID */}
                      <td className="py-2.5 px-3 font-mono text-[10px] text-slate-400">
                        {log.entity_id ? (
                          <span className="bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">
                            {log.entity_id.substring(0, 14)}...
                          </span>
                        ) : (
                          "—"
                        )}
                      </td>

                      {/* Details */}
                      <td className="py-2.5 px-4 text-right font-mono text-[11px] text-slate-500 dark:text-slate-400 max-w-xs truncate">
                        {log.details ? (
                          <span title={JSON.stringify(log.details, null, 2)}>
                            {JSON.stringify(log.details)}
                          </span>
                        ) : (
                          "—"
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Table Footer Status Bar */}
            <div className="shrink-0 px-4 py-2 bg-slate-50/90 dark:bg-slate-850/90 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
              <div className="flex items-center gap-2">
                <span>
                  Showing <strong className="text-slate-700 dark:text-slate-200">{filtered.length}</strong> of{" "}
                  <strong>{logs.length}</strong> immutable audit records
                </span>
                {filterEntity !== "all" && (
                  <span className="text-blue-500 font-medium">({filterEntity} view)</span>
                )}
              </div>
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400 font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                  Append-only municipal ledger
                </span>
              </div>
            </div>
          </div>

          {/* Mobile Responsive Cards View (Shown on < md screens) */}
          <div className="md:hidden flex-1 overflow-y-auto space-y-2.5 pb-24">
            {filtered.map((log) => (
              <div
                key={log.id}
                className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-3 shadow-2xs space-y-2 hover:border-slate-300 dark:hover:border-slate-700 transition-all text-xs"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="px-2 py-0.5 rounded-full font-mono font-bold text-[10px] bg-blue-500/10 text-blue-700 dark:text-blue-300 border border-blue-500/20">
                    {log.action}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {formatDate(log.created_at)}
                  </span>
                </div>

                <div className="flex items-center justify-between text-slate-800 dark:text-slate-200 pt-1">
                  <span className="font-semibold capitalize">
                    {log.entity_type.replace(/_/g, " ")}
                  </span>
                  {log.entity_id && (
                    <span className="font-mono text-[10px] text-slate-400 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">
                      {log.entity_id.substring(0, 12)}...
                    </span>
                  )}
                </div>

                {log.details && (
                  <pre className="p-2 rounded-xl bg-slate-50 dark:bg-slate-850 text-[10px] text-slate-600 dark:text-slate-400 overflow-x-auto font-mono max-h-24 leading-relaxed">
                    {JSON.stringify(log.details, null, 2)}
                  </pre>
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
