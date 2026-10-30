// src/app/admin/(dashboard)/submissions/page.tsx
"use client";

import React, { useEffect, useState, useCallback, useMemo } from "react";
import Link from "next/link";
import {
  Inbox,
  CheckCircle2,
  XCircle,
  Clock,
  Eye,
  MapPin,
  User,
  Search,
  Check,
  X,
  Loader2,
  ExternalLink,
  ShieldCheck,
  AlertCircle,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  getAllSubmissionsAction,
  approveSubmissionAction,
  rejectSubmissionAction,
} from "@/actions/submission-actions";
import { WaterSubmission } from "@/types/submission";
import { CATEGORY_COLORS } from "@/lib/utils/constants";
import { formatDate } from "@/lib/utils/date-utils";
import { useAdminRealtime } from "@/hooks/use-admin-realtime";
import { AdminHeader } from "@/components/admin/admin-header";
import { cn } from "@/lib/utils";

export default function AdminSubmissionsPage() {
  const [submissions, setSubmissions] = useState<WaterSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [actionInProgress, setActionInProgress] = useState<string | null>(null);
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  const loadSubmissions = useCallback(async () => {
    try {
      const data = await getAllSubmissionsAction();
      setSubmissions(data);
    } catch (err) {
      console.error("Failed to load submissions", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const { isLive, lastSync, isRefreshing, triggerRefresh } = useAdminRealtime({
    tables: ["water_submissions"],
    onSync: loadSubmissions,
  });

  useEffect(() => {
    loadSubmissions();
  }, [loadSubmissions]);

  const handleApprove = async (id: string) => {
    setActionInProgress(id);
    try {
      const res = await approveSubmissionAction(id);
      if (res.success) {
        setSubmissions((prev) =>
          prev.map((s) => (s.id === id ? { ...s, status: "approved" } : s))
        );
      } else {
        alert(res.error || "Failed to approve submission");
      }
    } catch (err: any) {
      alert(err.message || "Approval failed");
    } finally {
      setActionInProgress(null);
    }
  };

  const handleRejectConfirm = async (id: string) => {
    if (!rejectReason.trim()) {
      alert("Please provide a brief reason for rejection.");
      return;
    }
    setActionInProgress(id);
    try {
      const res = await rejectSubmissionAction(id, rejectReason.trim());
      if (res.success) {
        setSubmissions((prev) =>
          prev.map((s) =>
            s.id === id
              ? { ...s, status: "rejected", rejection_reason: rejectReason.trim() }
              : s
          )
        );
        setRejectingId(null);
        setRejectReason("");
      } else {
        alert(res.error || "Failed to reject submission");
      }
    } catch (err: any) {
      alert(err.message || "Rejection failed");
    } finally {
      setActionInProgress(null);
    }
  };

  const filtered = useMemo(() => {
    return submissions.filter((sub) => {
      const matchesStatus = filterStatus === "all" || sub.status === filterStatus;
      const matchesSearch =
        sub.name.toLowerCase().includes(search.toLowerCase()) ||
        sub.submitter_name.toLowerCase().includes(search.toLowerCase()) ||
        (sub.barangay && sub.barangay.toLowerCase().includes(search.toLowerCase())) ||
        sub.category.toLowerCase().includes(search.toLowerCase());
      return matchesStatus && matchesSearch;
    });
  }, [submissions, filterStatus, search]);

  const pendingCount = submissions.filter((s) => s.status === "pending").length;
  const approvedCount = submissions.filter((s) => s.status === "approved").length;
  const rejectedCount = submissions.filter((s) => s.status === "rejected").length;

  const filterTabs = [
    { key: "all", label: "All", count: submissions.length },
    { key: "pending", label: "Pending", count: pendingCount },
    { key: "approved", label: "Approved", count: approvedCount },
    { key: "rejected", label: "Rejected", count: rejectedCount },
  ];

  return (
    <div className="flex flex-col min-w-0 lg:h-[calc(100dvh-4.5rem)] space-y-2.5">
      {/* Compact Header */}
      <AdminHeader
        title="Community Submissions"
        subtitle="Review and verify citizen-proposed water sources before publishing them to the public map."
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
            placeholder="Search by resource, submitter, or barangay..."
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
          <p className="text-xs font-medium">Connecting to submissions stream...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs space-y-3">
          <div className="w-11 h-11 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center">
            <Inbox className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              No Submissions Found
            </h3>
            <p className="text-xs text-slate-400 max-w-sm mt-0.5">
              {search || filterStatus !== "all"
                ? "No submissions match your active search or filter criteria."
                : "No community submissions currently in queue. Newly submitted water points from citizens will appear here in real-time."}
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
                    <th className="py-2.5 px-4">Resource Name</th>
                    <th className="py-2.5 px-3">Category</th>
                    <th className="py-2.5 px-3">Submitter</th>
                    <th className="py-2.5 px-3">Barangay</th>
                    <th className="py-2.5 px-3">Date Submitted</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 text-slate-700 dark:text-slate-300">
                  {filtered.map((sub) => {
                    const catColors = CATEGORY_COLORS[sub.category] || CATEGORY_COLORS["Other"];
                    const isPending = sub.status === "pending";
                    const isProcessing = actionInProgress === sub.id;

                    return (
                      <tr
                        key={sub.id}
                        className="hover:bg-slate-50/70 dark:hover:bg-slate-800/50 transition-colors group"
                      >
                        {/* Resource Name */}
                        <td className="py-2.5 px-4 font-bold text-slate-900 dark:text-white">
                          <Link
                            href={`/admin/submissions/${sub.id}`}
                            className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors inline-flex items-center gap-1.5"
                          >
                            <span>{sub.name}</span>
                          </Link>
                          {sub.description && (
                            <p className="text-[11px] text-slate-400 font-normal line-clamp-1 max-w-[200px]">
                              {sub.description}
                            </p>
                          )}
                        </td>

                        {/* Category */}
                        <td className="py-2.5 px-3">
                          <span
                            className={cn(
                              "px-2 py-0.5 rounded-full font-semibold text-[10px] inline-block",
                              catColors.bg,
                              catColors.text
                            )}
                          >
                            {sub.category}
                          </span>
                        </td>

                        {/* Submitter */}
                        <td className="py-2.5 px-3 font-medium text-slate-600 dark:text-slate-300">
                          <div className="flex items-center gap-1.5">
                            <User className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                            <span className="truncate max-w-[130px]">{sub.submitter_name}</span>
                          </div>
                        </td>

                        {/* Barangay */}
                        <td className="py-2.5 px-3 font-medium text-slate-600 dark:text-slate-300">
                          <div className="flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                            <span className="truncate max-w-[130px]">
                              {sub.barangay ? `Brgy. ${sub.barangay}` : "Irosin"}
                            </span>
                          </div>
                        </td>

                        {/* Date */}
                        <td className="py-2.5 px-3 text-slate-400 text-[11px]">
                          {formatDate(sub.created_at)}
                        </td>

                        {/* Status */}
                        <td className="py-2.5 px-3">
                          <span
                            className={cn(
                              "px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider inline-flex items-center gap-1 shrink-0",
                              sub.status === "pending"
                                ? "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-200 dark:border-amber-900"
                                : sub.status === "approved"
                                ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900"
                                : "bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 border border-rose-200 dark:border-rose-900"
                            )}
                          >
                            {sub.status === "pending" && <Clock className="w-3 h-3" />}
                            {sub.status === "approved" && <CheckCircle2 className="w-3 h-3" />}
                            {sub.status === "rejected" && <XCircle className="w-3 h-3" />}
                            <span>{sub.status}</span>
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="py-2.5 px-4 text-right space-x-1 shrink-0">
                          {isPending && (
                            <>
                              <button
                                type="button"
                                onClick={() => handleApprove(sub.id)}
                                disabled={isProcessing}
                                className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-[11px] shadow-2xs transition-colors disabled:opacity-50 cursor-pointer"
                                title="Approve and Publish to Map"
                              >
                                <Check className="w-3 h-3" />
                                <span>Approve</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => setRejectingId(sub.id)}
                                disabled={isProcessing}
                                className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/40 dark:hover:text-rose-300 font-semibold text-[11px] transition-colors cursor-pointer"
                                title="Reject Submission"
                              >
                                <X className="w-3 h-3" />
                                <span>Reject</span>
                              </button>
                            </>
                          )}
                          <Link
                            href={`/admin/submissions/${sub.id}`}
                            className="inline-flex p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-slate-800 transition-colors"
                            title="View Full Details & Photos"
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
                  <strong>{submissions.length}</strong> community submissions
                </span>
                {filterStatus !== "all" && (
                  <span className="text-blue-500 font-medium">({filterStatus} view)</span>
                )}
              </div>
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400 font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                  Live verification queue
                </span>
              </div>
            </div>
          </div>

          {/* Mobile Responsive Cards View (Shown on < md screens) */}
          <div className="md:hidden flex-1 overflow-y-auto space-y-2.5 pb-24">
            {filtered.map((sub) => {
              const catColors = CATEGORY_COLORS[sub.category] || CATEGORY_COLORS["Other"];
              const isPending = sub.status === "pending";
              const isProcessing = actionInProgress === sub.id;

              return (
                <div
                  key={sub.id}
                  className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-3 shadow-2xs space-y-2 hover:border-slate-300 dark:hover:border-slate-700 transition-all"
                >
                  {/* Top Bar: Category & Status */}
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={cn(
                        "px-2 py-0.5 rounded-full font-semibold text-[10px]",
                        catColors.bg,
                        catColors.text
                      )}
                    >
                      {sub.category}
                    </span>

                    <span
                      className={cn(
                        "px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider shrink-0 flex items-center gap-1",
                        sub.status === "pending"
                          ? "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-200 dark:border-amber-900"
                          : sub.status === "approved"
                          ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900"
                          : "bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 border border-rose-200 dark:border-rose-900"
                      )}
                    >
                      {sub.status === "pending" && <Clock className="w-3 h-3" />}
                      {sub.status === "approved" && <CheckCircle2 className="w-3 h-3" />}
                      {sub.status === "rejected" && <XCircle className="w-3 h-3" />}
                      <span>{sub.status}</span>
                    </span>
                  </div>

                  {/* Title & Description */}
                  <div>
                    <Link
                      href={`/admin/submissions/${sub.id}`}
                      className="font-bold text-sm text-slate-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 block"
                    >
                      {sub.name}
                    </Link>
                    {sub.description && (
                      <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mt-0.5 leading-relaxed">
                        {sub.description}
                      </p>
                    )}
                  </div>

                  {/* Submitter & Location Info */}
                  <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-1.5 border-t border-slate-100 dark:border-slate-800/80">
                    <div className="flex items-center gap-1.5 truncate max-w-[150px]">
                      <User className="w-3 h-3 text-blue-500 shrink-0" />
                      <span className="truncate">{sub.submitter_name}</span>
                    </div>

                    <div className="flex items-center gap-1 text-[11px] text-slate-400">
                      <MapPin className="w-3 h-3 text-emerald-500 shrink-0" />
                      <span>{sub.barangay ? `Brgy. ${sub.barangay}` : "Irosin"}</span>
                    </div>
                  </div>

                  {/* Rejection Note if exists */}
                  {sub.rejection_reason && (
                    <div className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-[11px] text-rose-700 dark:text-rose-300">
                      <strong>Rejection note:</strong> {sub.rejection_reason}
                    </div>
                  )}

                  {/* Actions Row */}
                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800/80">
                    <Link
                      href={`/admin/submissions/${sub.id}`}
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      <Eye className="w-3 h-3" />
                      <span>View Details</span>
                    </Link>

                    {isPending && (
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => setRejectingId(sub.id)}
                          disabled={isProcessing}
                          className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-rose-600 dark:hover:text-rose-400 text-xs font-semibold transition-colors cursor-pointer"
                        >
                          Reject
                        </button>
                        <button
                          type="button"
                          onClick={() => handleApprove(sub.id)}
                          disabled={isProcessing}
                          className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition-colors shadow-2xs cursor-pointer flex items-center gap-1"
                        >
                          <Check className="w-3 h-3" />
                          <span>Approve</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* Reject Reason Modal Dialog */}
      {rejectingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 sm:p-5 shadow-xl space-y-3.5">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <XCircle className="w-4 h-4 text-rose-500" />
                <span>Reject Submission</span>
              </h4>
              <button
                type="button"
                onClick={() => {
                  setRejectingId(null);
                  setRejectReason("");
                }}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Please provide a reason for rejecting this water resource submission. This will be preserved in the audit log.
            </p>

            <Input
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="e.g. Duplicate location, inaccessible or inactive..."
              className="text-xs h-9"
              autoFocus
            />

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setRejectingId(null);
                  setRejectReason("");
                }}
                className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-xs hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleRejectConfirm(rejectingId)}
                disabled={actionInProgress === rejectingId || !rejectReason.trim()}
                className="px-4 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white font-bold text-xs transition-colors cursor-pointer"
              >
                {actionInProgress === rejectingId ? "Rejecting..." : "Confirm Rejection"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
