// src/app/admin/(dashboard)/users/page.tsx
"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  Users,
  ShieldAlert,
  ShieldCheck,
  Clock,
  UserX,
  Search,
  Loader2,
  Lock,
  Unlock,
  X,
  User,
  Shield,
  AlertTriangle,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { formatDate } from "@/lib/utils/date-utils";
import { AdminHeader } from "@/components/admin/admin-header";
import { useAdminRealtime } from "@/hooks/use-admin-realtime";
import {
  getVisitorSessionsAction,
  toggleVisitorRestrictionAction,
  VisitorSessionRecord,
} from "@/actions/visitor-actions";
import { cn } from "@/lib/utils";

export default function AdminUsersModerationPage() {
  const [sessions, setSessions] = useState<VisitorSessionRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterTab, setFilterTab] = useState<"all" | "active" | "restricted">("all");
  const [updatingVisitorId, setUpdatingVisitorId] = useState<string | null>(null);

  // Restriction Modal State
  const [restrictingSession, setRestrictingSession] = useState<VisitorSessionRecord | null>(null);
  const [restrictionReason, setRestrictionReason] = useState("");

  const loadSessions = useCallback(async () => {
    try {
      const data = await getVisitorSessionsAction();
      setSessions(data);
    } catch (err) {
      console.error("Failed to load visitor sessions:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const { isLive, lastSync, isRefreshing, triggerRefresh } = useAdminRealtime({
    tables: ["visitor_sessions"],
    onSync: loadSessions,
  });

  useEffect(() => {
    loadSessions();
  }, [loadSessions]);

  const handleToggleRestriction = async (sess: VisitorSessionRecord) => {
    if (!sess.is_restricted) {
      // Open clean in-app modal instead of blocking browser prompt
      setRestrictingSession(sess);
      setRestrictionReason("Repeated abuse or spam flags");
      return;
    }

    // Direct lift restriction
    setUpdatingVisitorId(sess.visitor_id);
    try {
      const res = await toggleVisitorRestrictionAction(sess.visitor_id, false, "");
      if (res.success) {
        setSessions((prev) =>
          prev.map((s) =>
            s.visitor_id === sess.visitor_id
              ? {
                  ...s,
                  is_restricted: false,
                  restriction_reason: null,
                }
              : s
          )
        );
      } else {
        alert(res.error || "Failed to update visitor status");
      }
    } catch (err: any) {
      alert(err.message || "Restriction error");
    } finally {
      setUpdatingVisitorId(null);
    }
  };

  const handleConfirmRestriction = async () => {
    if (!restrictingSession) return;
    const reason = restrictionReason.trim() || "Administrative restriction";
    const visitorId = restrictingSession.visitor_id;

    setUpdatingVisitorId(visitorId);
    try {
      const res = await toggleVisitorRestrictionAction(visitorId, true, reason);
      if (res.success) {
        setSessions((prev) =>
          prev.map((s) =>
            s.visitor_id === visitorId
              ? {
                  ...s,
                  is_restricted: true,
                  restriction_reason: reason,
                }
              : s
          )
        );
        setRestrictingSession(null);
        setRestrictionReason("");
      } else {
        alert(res.error || "Failed to restrict visitor");
      }
    } catch (err: any) {
      alert(err.message || "Restriction error");
    } finally {
      setUpdatingVisitorId(null);
    }
  };

  const restrictedCount = sessions.filter((s) => s.is_restricted).length;
  const activeCount = sessions.length - restrictedCount;

  const filtered = useMemo(() => {
    return sessions.filter((s) => {
      const matchesTab =
        filterTab === "all"
          ? true
          : filterTab === "restricted"
          ? s.is_restricted
          : !s.is_restricted;

      const matchesSearch =
        (s.display_name && s.display_name.toLowerCase().includes(search.toLowerCase())) ||
        s.visitor_id.toLowerCase().includes(search.toLowerCase());

      return matchesTab && matchesSearch;
    });
  }, [sessions, filterTab, search]);

  const filterTabs = [
    { key: "all", label: "All Sessions", count: sessions.length },
    { key: "active", label: "Active", count: activeCount },
    { key: "restricted", label: "Restricted", count: restrictedCount },
  ];

  return (
    <div className="flex flex-col min-w-0 lg:h-[calc(100dvh-4.5rem)] space-y-2.5">
      {/* Compact Top Header */}
      <AdminHeader
        title="Visitor Sessions & Security"
        subtitle="Live registry of anonymous citizen sessions, display names, and rate-limiting moderation controls."
        isLive={isLive}
        lastSync={lastSync}
        isRefreshing={isRefreshing || loading}
        onRefresh={triggerRefresh}
        badgeCount={sessions.length}
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
            placeholder="Search by display name or visitor identifier..."
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
            const isActive = filterTab === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setFilterTab(tab.key as any)}
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
                      : tab.key === "restricted" && restrictedCount > 0
                      ? "bg-rose-500/20 text-rose-600 dark:text-rose-400"
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
          <p className="text-xs font-medium">Loading live visitor sessions...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs space-y-3">
          <div className="w-11 h-11 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              No Visitor Sessions Found
            </h3>
            <p className="text-xs text-slate-400 max-w-sm mt-0.5">
              {search || filterTab !== "all"
                ? "No visitor profiles match your search criteria."
                : "Active citizen visitor sessions connected to IroWa will automatically register here in real-time."}
            </p>
          </div>
          {(search || filterTab !== "all") && (
            <button
              type="button"
              onClick={() => {
                setSearch("");
                setFilterTab("all");
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
                    <th className="py-2.5 px-4">Citizen Profile</th>
                    <th className="py-2.5 px-3">Visitor ID</th>
                    <th className="py-2.5 px-3">Security Status</th>
                    <th className="py-2.5 px-3">Last Active</th>
                    <th className="py-2.5 px-3">First Joined</th>
                    <th className="py-2.5 px-4 text-right">Moderation</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 text-slate-700 dark:text-slate-300">
                  {filtered.map((sess) => {
                    const isProcessing = updatingVisitorId === sess.visitor_id;

                    return (
                      <tr
                        key={sess.id}
                        className={cn(
                          "transition-colors group",
                          sess.is_restricted
                            ? "bg-rose-50/30 dark:bg-rose-950/20 hover:bg-rose-50/50 dark:hover:bg-rose-950/30"
                            : "hover:bg-slate-50/70 dark:hover:bg-slate-800/50"
                        )}
                      >
                        {/* Display Name with Avatar Icon */}
                        <td className="py-2.5 px-4 font-bold text-slate-900 dark:text-white">
                          <div className="flex items-center gap-2">
                            <div
                              className={cn(
                                "w-6 h-6 rounded-lg flex items-center justify-center shrink-0 font-bold text-[11px]",
                                sess.is_restricted
                                  ? "bg-rose-500/10 text-rose-600 dark:text-rose-400"
                                  : "bg-blue-500/10 text-blue-600 dark:text-blue-400"
                              )}
                            >
                              {(sess.display_name || "A")[0].toUpperCase()}
                            </div>
                            <span className="truncate max-w-[180px]">
                              {sess.display_name || "Anonymous Citizen"}
                            </span>
                          </div>
                        </td>

                        {/* Visitor ID Monospace */}
                        <td className="py-2.5 px-3">
                          <span className="font-mono text-[10px] text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                            {sess.visitor_id.slice(0, 16)}...
                          </span>
                        </td>

                        {/* Status */}
                        <td className="py-2.5 px-3">
                          <span
                            className={cn(
                              "px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider inline-flex items-center gap-1.5",
                              sess.is_restricted
                                ? "bg-rose-500/10 text-rose-700 dark:text-rose-300 border border-rose-500/20"
                                : "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20"
                            )}
                          >
                            <span
                              className={cn(
                                "w-1.5 h-1.5 rounded-full",
                                sess.is_restricted ? "bg-rose-500" : "bg-emerald-500 animate-pulse"
                              )}
                            />
                            <span>{sess.is_restricted ? "Restricted" : "Active"}</span>
                          </span>
                          {sess.is_restricted && sess.restriction_reason && (
                            <span className="block text-[10px] text-rose-500 font-medium truncate max-w-[150px] mt-0.5">
                              {sess.restriction_reason}
                            </span>
                          )}
                        </td>

                        {/* Last Seen */}
                        <td className="py-2.5 px-3 text-slate-400 text-[11px] whitespace-nowrap">
                          {formatDate(sess.last_seen_at)}
                        </td>

                        {/* First Joined */}
                        <td className="py-2.5 px-3 text-slate-400 text-[11px] whitespace-nowrap">
                          {formatDate(sess.created_at)}
                        </td>

                        {/* Action Toggle */}
                        <td className="py-2.5 px-4 text-right shrink-0">
                          <button
                            type="button"
                            onClick={() => handleToggleRestriction(sess)}
                            disabled={isProcessing}
                            className={cn(
                              "inline-flex items-center gap-1 px-2.5 py-1 rounded-lg font-semibold text-[11px] transition-colors cursor-pointer disabled:opacity-50",
                              sess.is_restricted
                                ? "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                                : "bg-rose-500/10 text-rose-600 dark:text-rose-400 hover:bg-rose-500/20 border border-rose-500/20"
                            )}
                          >
                            {sess.is_restricted ? (
                              <>
                                <Unlock className="w-3 h-3" />
                                <span>Lift Restriction</span>
                              </>
                            ) : (
                              <>
                                <Lock className="w-3 h-3" />
                                <span>Apply Restriction</span>
                              </>
                            )}
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
                  <strong>{sessions.length}</strong> registered visitor sessions
                </span>
                {filterTab !== "all" && (
                  <span className="text-blue-500 font-medium">({filterTab} view)</span>
                )}
              </div>
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  Live security registry
                </span>
              </div>
            </div>
          </div>

          {/* Mobile Responsive Cards View (Shown on < md screens) */}
          <div className="md:hidden flex-1 overflow-y-auto space-y-2.5 pb-24">
            {filtered.map((sess) => {
              const isProcessing = updatingVisitorId === sess.visitor_id;

              return (
                <div
                  key={sess.id}
                  className={cn(
                    "rounded-2xl border p-3 shadow-2xs space-y-2 transition-all",
                    sess.is_restricted
                      ? "bg-rose-50/20 dark:bg-rose-950/20 border-rose-200/80 dark:border-rose-900/60"
                      : "bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800"
                  )}
                >
                  {/* Top Bar: Profile & Status */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <div
                        className={cn(
                          "w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs shrink-0",
                          sess.is_restricted
                            ? "bg-rose-500/10 text-rose-600 dark:text-rose-400"
                            : "bg-blue-500/10 text-blue-600 dark:text-blue-400"
                        )}
                      >
                        {(sess.display_name || "A")[0].toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white truncate">
                          {sess.display_name || "Anonymous Citizen"}
                        </h4>
                        <span className="font-mono text-[10px] text-slate-400 block truncate">
                          {sess.visitor_id}
                        </span>
                      </div>
                    </div>

                    <span
                      className={cn(
                        "px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider inline-flex items-center gap-1 shrink-0",
                        sess.is_restricted
                          ? "bg-rose-500/10 text-rose-700 dark:text-rose-300 border border-rose-500/20"
                          : "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20"
                      )}
                    >
                      <span
                        className={cn(
                          "w-1.5 h-1.5 rounded-full",
                          sess.is_restricted ? "bg-rose-500" : "bg-emerald-500 animate-pulse"
                        )}
                      />
                      <span>{sess.is_restricted ? "Restricted" : "Active"}</span>
                    </span>
                  </div>

                  {sess.is_restricted && sess.restriction_reason && (
                    <div className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-[11px] text-rose-700 dark:text-rose-300">
                      <strong>Reason:</strong> {sess.restriction_reason}
                    </div>
                  )}

                  {/* Dates */}
                  <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-1.5 border-t border-slate-100 dark:border-slate-800/80">
                    <div className="flex items-center gap-1 text-[11px]">
                      <Clock className="w-3 h-3 text-blue-500 shrink-0" />
                      <span>Last Seen: {formatDate(sess.last_seen_at)}</span>
                    </div>
                    <div className="text-[10px] text-slate-400">
                      Joined {formatDate(sess.created_at)}
                    </div>
                  </div>

                  {/* Action Button */}
                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80">
                    <button
                      type="button"
                      onClick={() => handleToggleRestriction(sess)}
                      disabled={isProcessing}
                      className={cn(
                        "w-full flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-xl font-semibold text-xs shadow-2xs transition-colors cursor-pointer disabled:opacity-50",
                        sess.is_restricted
                          ? "bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-300"
                          : "bg-rose-600 hover:bg-rose-700 text-white"
                      )}
                    >
                      {sess.is_restricted ? (
                        <>
                          <Unlock className="w-3 h-3" />
                          <span>Lift Restriction</span>
                        </>
                      ) : (
                        <>
                          <Lock className="w-3 h-3" />
                          <span>Apply Restriction</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* In-App Restriction Reason Modal */}
      {restrictingSession && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 sm:p-5 shadow-xl space-y-3.5">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-rose-500" />
                <span>Apply Visitor Restriction</span>
              </h4>
              <button
                type="button"
                onClick={() => {
                  setRestrictingSession(null);
                  setRestrictionReason("");
                }}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Restrict citizen{" "}
              <strong className="text-slate-800 dark:text-slate-200">
                &quot;{restrictingSession.display_name || restrictingSession.visitor_id}&quot;
              </strong>{" "}
              from submitting water resources, comments, and community reports.
            </p>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                Restriction Reason
              </label>
              <Input
                value={restrictionReason}
                onChange={(e) => setRestrictionReason(e.target.value)}
                placeholder="e.g. Repeated abuse, rate limit violation, spam..."
                className="text-xs h-9"
                autoFocus
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setRestrictingSession(null);
                  setRestrictionReason("");
                }}
                className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-xs hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmRestriction}
                disabled={updatingVisitorId === restrictingSession.visitor_id}
                className="px-4 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white font-bold text-xs transition-colors cursor-pointer"
              >
                {updatingVisitorId === restrictingSession.visitor_id ? "Applying..." : "Confirm Restriction"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
