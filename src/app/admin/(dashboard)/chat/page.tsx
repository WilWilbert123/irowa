// src/app/admin/(dashboard)/chat/page.tsx
"use client";

import React, { useEffect, useState, useCallback, useMemo } from "react";
import Link from "next/link";
import {
  MessageSquare,
  ShieldAlert,
  ArrowRight,
  Search,
  Clock,
  ShieldCheck,
  CheckCircle2,
  Trash2,
  EyeOff,
  Loader2,
  ExternalLink,
  MapPin,
  X,
  AlertTriangle,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  getAllChatRoomsAction,
  getReportedMessagesAction,
  moderateMessageAction,
} from "@/actions/chat-actions";
import { ChatRoom, ChatMessage } from "@/types/chat";
import { formatDate } from "@/lib/utils/date-utils";
import { AdminHeader } from "@/components/admin/admin-header";
import { useAdminRealtime } from "@/hooks/use-admin-realtime";
import { cn } from "@/lib/utils";

export default function AdminChatManagementPage() {
  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [reportedMessages, setReportedMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<"rooms" | "flagged">("rooms");
  const [moderatingId, setModeratingId] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    try {
      const [roomsData, flaggedData] = await Promise.all([
        getAllChatRoomsAction(),
        getReportedMessagesAction(),
      ]);
      setRooms(roomsData);
      setReportedMessages(flaggedData);
    } catch (err) {
      console.error("Failed to load chat data", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const { isLive, lastSync, isRefreshing, triggerRefresh } = useAdminRealtime({
    tables: ["chat_messages", "chat_rooms"],
    onSync: loadData,
  });

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleModerate = async (messageId: string, status: "approved" | "hidden" | "deleted") => {
    setModeratingId(messageId);
    try {
      await moderateMessageAction(messageId, status, `Moderated by admin (${status})`);
      setReportedMessages((prev) => prev.filter((m) => m.id !== messageId));
    } catch (err) {
      alert("Failed to moderate message: " + (err as Error).message);
    } finally {
      setModeratingId(null);
    }
  };

  const filteredRooms = useMemo(() => {
    return rooms.filter(
      (r) =>
        (r.water_source?.name &&
          r.water_source.name.toLowerCase().includes(search.toLowerCase())) ||
        (r.water_source?.barangay &&
          r.water_source.barangay.toLowerCase().includes(search.toLowerCase()))
    );
  }, [rooms, search]);

  const filteredFlagged = useMemo(() => {
    return reportedMessages.filter(
      (m) =>
        m.display_name.toLowerCase().includes(search.toLowerCase()) ||
        m.message.toLowerCase().includes(search.toLowerCase()) ||
        (m.moderation_reason &&
          m.moderation_reason.toLowerCase().includes(search.toLowerCase()))
    );
  }, [reportedMessages, search]);

  return (
    <div className="flex flex-col min-w-0 lg:h-[calc(100dvh-4.5rem)] space-y-2.5">
      {/* Compact Top Header */}
      <AdminHeader
        title="Community Chat Moderation"
        subtitle="Live discussion channels for each water resource and community safety content filtering."
        isLive={isLive}
        lastSync={lastSync}
        isRefreshing={isRefreshing || loading}
        onRefresh={triggerRefresh}
        badgeCount={reportedMessages.length}
        compact={true}
        className="shrink-0 mb-0 pb-2.5"
      />

      {/* Sleek Toolbar: Tab Pills & Search */}
      <div className="shrink-0 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 bg-white dark:bg-slate-900 p-2 sm:p-2.5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xs">
        {/* Tab Buttons */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab("rooms")}
            className={cn(
              "px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer flex items-center gap-2",
              activeTab === "rooms"
                ? "bg-blue-600 text-white shadow-2xs"
                : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            )}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Discussion Rooms</span>
            <span
              className={cn(
                "text-[10px] px-1.5 py-0.2 rounded-full font-bold",
                activeTab === "rooms"
                  ? "bg-white/20 text-white"
                  : "bg-slate-200/80 dark:bg-slate-700 text-slate-600 dark:text-slate-300"
              )}
            >
              {rooms.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("flagged")}
            className={cn(
              "px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer flex items-center gap-2",
              activeTab === "flagged"
                ? "bg-rose-600 text-white shadow-2xs"
                : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            )}
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Flagged Messages</span>
            <span
              className={cn(
                "text-[10px] px-1.5 py-0.2 rounded-full font-bold",
                activeTab === "flagged"
                  ? "bg-white/20 text-white"
                  : reportedMessages.length > 0
                  ? "bg-rose-500/20 text-rose-600 dark:text-rose-400"
                  : "bg-slate-200/80 dark:bg-slate-700 text-slate-600 dark:text-slate-300"
              )}
            >
              {reportedMessages.length}
            </span>
          </button>
        </div>

        {/* Search Input */}
        <div className="relative flex-1 sm:max-w-xs min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={
              activeTab === "rooms" ? "Search chat room..." : "Search flagged messages..."
            }
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
      </div>

      {/* Main Content Area */}
      {loading ? (
        <div className="flex-1 flex flex-col items-center justify-center p-12 text-slate-400 space-y-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
          <Loader2 className="w-7 h-7 animate-spin text-blue-500" />
          <p className="text-xs font-medium">Connecting to live chat channels...</p>
        </div>
      ) : activeTab === "rooms" ? (
        filteredRooms.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs space-y-3">
            <div className="w-11 h-11 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                No Chat Rooms Found
              </h3>
              <p className="text-xs text-slate-400 max-w-sm mt-0.5">
                {search
                  ? `No chat channels match "${search}".`
                  : "Discussion channels are automatically spawned when water sources are created."}
              </p>
            </div>
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300"
              >
                Clear Search
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
                      <th className="py-2.5 px-4">Discussion Channel</th>
                      <th className="py-2.5 px-3">Barangay Location</th>
                      <th className="py-2.5 px-3">Channel Status</th>
                      <th className="py-2.5 px-3">Created</th>
                      <th className="py-2.5 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 text-slate-700 dark:text-slate-300">
                    {filteredRooms.map((room) => (
                      <tr
                        key={room.id}
                        className="hover:bg-slate-50/70 dark:hover:bg-slate-800/50 transition-colors group"
                      >
                        {/* Room Name */}
                        <td className="py-2.5 px-4 font-bold text-slate-900 dark:text-white">
                          <Link
                            href={`/admin/chat/${room.water_source_id}`}
                            className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors inline-flex items-center gap-1.5"
                          >
                            <MessageSquare className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                            <span>{room.water_source?.name || "Water Point"}</span>
                          </Link>
                        </td>

                        {/* Location */}
                        <td className="py-2.5 px-3 font-medium text-slate-600 dark:text-slate-300">
                          <div className="flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                            <span>
                              {room.water_source?.barangay
                                ? `Brgy. ${room.water_source.barangay}`
                                : "Irosin Central"}
                            </span>
                          </div>
                        </td>

                        {/* Status */}
                        <td className="py-2.5 px-3">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20 inline-flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            <span>Live Channel</span>
                          </span>
                        </td>

                        {/* Created Date */}
                        <td className="py-2.5 px-3 text-slate-400 text-[11px] whitespace-nowrap">
                          {formatDate(room.created_at)}
                        </td>

                        {/* Actions */}
                        <td className="py-2.5 px-4 text-right space-x-1.5 shrink-0">
                          <Link
                            href={`/admin/chat/${room.water_source_id}`}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-[11px] shadow-2xs transition-colors"
                          >
                            <MessageSquare className="w-3 h-3" />
                            <span>Open Stream</span>
                          </Link>

                          {room.water_source?.slug && (
                            <Link
                              href={`/chat/${room.water_source.slug}`}
                              target="_blank"
                              className="inline-flex p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-slate-800 transition-colors"
                              title="View Citizen Public Chat"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </Link>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Table Footer */}
              <div className="shrink-0 px-4 py-2 bg-slate-50/90 dark:bg-slate-850/90 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                <span>
                  Showing <strong className="text-slate-700 dark:text-slate-200">{filteredRooms.length}</strong> of{" "}
                  <strong>{rooms.length}</strong> active chat rooms
                </span>
                <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  Live WebSockets stream active
                </span>
              </div>
            </div>

            {/* Mobile Responsive Cards View */}
            <div className="md:hidden flex-1 overflow-y-auto space-y-2.5 pb-24">
              {filteredRooms.map((room) => (
                <div
                  key={room.id}
                  className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-3 shadow-2xs space-y-2 hover:border-slate-300 dark:hover:border-slate-700 transition-all"
                >
                  <div className="flex items-center justify-between gap-2">
                    <Link
                      href={`/admin/chat/${room.water_source_id}`}
                      className="font-bold text-sm text-slate-900 dark:text-white hover:text-blue-600 block truncate"
                    >
                      {room.water_source?.name || "Water Point"}
                    </Link>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20 inline-flex items-center gap-1 shrink-0">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      Live
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                    <div className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-blue-500 shrink-0" />
                      <span>{room.water_source?.barangay ? `Brgy. ${room.water_source.barangay}` : "Irosin"}</span>
                    </div>
                    <div className="text-[11px] text-slate-400">
                      Created: {formatDate(room.created_at)}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800/80">
                    <Link
                      href={`/admin/chat/${room.water_source_id}`}
                      className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-2xs transition-colors"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>Open Live Stream</span>
                    </Link>

                    {room.water_source?.slug && (
                      <Link
                        href={`/chat/${room.water_source.slug}`}
                        target="_blank"
                        className="p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-blue-500 transition-colors"
                        title="View Citizen Public Chat"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </Link>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </>
        )
      ) : (
        /* Flagged Tab */
        filteredFlagged.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs space-y-3">
            <div className="w-11 h-11 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-500 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                No Flagged Messages
              </h3>
              <p className="text-xs text-slate-400 max-w-sm mt-0.5">
                {search
                  ? `No flagged messages match "${search}".`
                  : "All community discussions across Irosin are currently free of flagged content."}
              </p>
            </div>
          </div>
        ) : (
          <div className="flex-1 min-h-0 overflow-y-auto space-y-2.5 pb-24">
            {filteredFlagged.map((msg) => (
              <div
                key={msg.id}
                className="p-3 sm:p-4 rounded-2xl bg-white dark:bg-slate-900 border border-rose-200/80 dark:border-rose-900/60 shadow-2xs space-y-2.5"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-rose-100 dark:bg-rose-900/50 text-rose-600 flex items-center justify-center font-bold text-xs shrink-0">
                      !
                    </div>
                    <div>
                      <span className="font-bold text-xs text-slate-900 dark:text-white">
                        {msg.display_name}
                      </span>
                      <span className="font-mono text-[10px] text-slate-400 ml-1.5">
                        ({msg.visitor_id.slice(0, 8)})
                      </span>
                    </div>
                  </div>

                  <span className="text-[11px] text-slate-400">
                    {formatDate(msg.created_at)}
                  </span>
                </div>

                <div className="p-2.5 rounded-xl bg-rose-50/60 dark:bg-rose-950/30 border border-rose-100 dark:border-rose-900/40 text-xs text-slate-800 dark:text-slate-200 leading-relaxed font-sans">
                  &quot;{msg.message}&quot;
                </div>

                {msg.moderation_reason && (
                  <p className="text-[11px] text-rose-500 font-semibold flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" />
                    <span>Flagged reason: {msg.moderation_reason}</span>
                  </p>
                )}

                <div className="flex flex-wrap items-center justify-end gap-1.5 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => handleModerate(msg.id, "approved")}
                    disabled={moderatingId === msg.id}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition-colors cursor-pointer disabled:opacity-50"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Approve / Dismiss</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleModerate(msg.id, "hidden")}
                    disabled={moderatingId === msg.id}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-300 font-semibold text-xs transition-colors cursor-pointer disabled:opacity-50"
                  >
                    <EyeOff className="w-3.5 h-3.5" />
                    <span>Hide</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleModerate(msg.id, "deleted")}
                    disabled={moderatingId === msg.id}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs transition-colors cursor-pointer disabled:opacity-50"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )
      )}
    </div>
  );
}
