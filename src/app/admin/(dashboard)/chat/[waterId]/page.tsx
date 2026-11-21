// src/app/admin/(dashboard)/chat/[waterId]/page.tsx
"use client";

import React, { useEffect, useState, useCallback, useMemo } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  Shield,
  Eye,
  EyeOff,
  Trash2,
  RefreshCw,
  CheckCircle2,
  ExternalLink,
  AlertTriangle,
  MessageSquare,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  getAdminChatRoomOverviewAction,
  moderateMessageAction,
} from "@/actions/chat-actions";
import { ChatRoom, ChatMessage } from "@/types/chat";
import { formatDate } from "@/lib/utils/date-utils";
import { getAdminCache, setAdminCache, ADMIN_CACHE_KEYS } from "@/lib/cache/admin-cache";
import { useAdminRealtime } from "@/hooks/use-admin-realtime";
import { cn } from "@/lib/utils";

type StatusFilter = "all" | "published" | "hidden" | "flagged" | "deleted";

interface CachedRoomOverview {
  waterSource: any | null;
  room: ChatRoom | null;
  messages: ChatMessage[];
}

export default function AdminWaterChatRoomPage() {
  const params = useParams();
  const waterId = params?.waterId as string;
  const roomCacheKey = `admin_chat_room_${waterId}`;

  // 0ms instant hydration from cache if available
  const cachedOverview = getAdminCache<CachedRoomOverview>(roomCacheKey);
  const cachedRoomsList = getAdminCache<ChatRoom[]>(ADMIN_CACHE_KEYS.CHAT_ROOMS);
  const matchedRoomFromList = useMemo(
    () => cachedRoomsList?.find((r) => r.water_source_id === waterId) || null,
    [cachedRoomsList, waterId]
  );

  const [waterSource, setWaterSource] = useState<any | null>(
    cachedOverview?.waterSource || matchedRoomFromList?.water_source || null
  );
  const [room, setRoom] = useState<ChatRoom | null>(
    cachedOverview?.room || matchedRoomFromList || null
  );
  const [messages, setMessages] = useState<ChatMessage[]>(
    cachedOverview?.messages || []
  );
  const [loading, setLoading] = useState(!cachedOverview);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [moderatingId, setModeratingId] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    if (!waterId) return;
    try {
      const overview = await getAdminChatRoomOverviewAction(waterId);
      if (overview.waterSource) setWaterSource(overview.waterSource);
      if (overview.room) setRoom(overview.room);
      setMessages(overview.messages);
      setAdminCache(roomCacheKey, overview);
    } catch (err) {
      console.error("Failed to load room chat data", err);
    } finally {
      setLoading(false);
    }
  }, [waterId, roomCacheKey]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const { isRefreshing, triggerRefresh } = useAdminRealtime({
    tables: ["chat_messages"],
    onSync: loadData,
  });

  const handleModerate = async (
    messageId: string,
    action: "published" | "hidden" | "deleted" | "purge"
  ) => {
    setModeratingId(messageId);

    // 0ms optimistic update
    const previousMessages = messages;
    const nextMessages =
      action === "purge"
        ? messages.filter((m) => m.id !== messageId)
        : messages.map((m) =>
            m.id === messageId
              ? {
                  ...m,
                  status: action as ChatMessage["status"],
                  moderation_reason:
                    action === "published"
                      ? null
                      : `Moderated by admin (${action})`,
                }
              : m
          );

    setMessages(nextMessages);
    setAdminCache(roomCacheKey, {
      waterSource,
      room,
      messages: nextMessages,
    });

    try {
      const res = await moderateMessageAction(
        messageId,
        action,
        action === "published" ? undefined : `Moderated by admin (${action})`
      );
      if (!res.success) {
        setMessages(previousMessages);
        alert("Failed to moderate message: " + (res.error || "Unknown error"));
      }
    } catch (err) {
      setMessages(previousMessages);
      alert("Failed to moderate message: " + (err as Error).message);
    } finally {
      setModeratingId(null);
    }
  };

  const counts = useMemo(() => {
    return {
      all: messages.length,
      published: messages.filter((m) => m.status === "published").length,
      hidden: messages.filter((m) => m.status === "hidden").length,
      flagged: messages.filter((m) => m.status === "flagged").length,
      deleted: messages.filter((m) => m.status === "deleted").length,
    };
  }, [messages]);

  const filteredMessages = useMemo(() => {
    if (statusFilter === "all") return messages;
    return messages.filter((m) => m.status === statusFilter);
  }, [messages, statusFilter]);

  const primaryPhoto =
    waterSource?.photos?.find((p: any) => p.is_primary) ||
    waterSource?.photos?.[0];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xs">
        <div className="flex items-center gap-3 min-w-0">
          <Button asChild variant="ghost" size="icon" className="rounded-xl shrink-0">
            <Link href="/admin/chat">
              <ArrowLeft className="w-5 h-5" />
            </Link>
          </Button>

          {primaryPhoto?.storage_path ? (
            <div className="w-11 h-11 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 shrink-0 bg-slate-100 dark:bg-slate-800">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={primaryPhoto.storage_path}
                alt={waterSource?.name || "Water Source"}
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            <div className="w-11 h-11 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
              <MessageSquare className="w-5 h-5" />
            </div>
          )}

          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900 dark:text-white truncate">
                {waterSource?.name || "Water Source"} Chat
              </h1>
              <Badge variant={room?.is_active !== false ? "default" : "secondary"}>
                {room?.is_active !== false ? "Live" : "Disabled"}
              </Badge>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
              {waterSource?.barangay ? `Brgy. ${waterSource.barangay}` : "Irosin"}, Sorsogon
              {room?.id ? ` • Room ID: ${room.id}` : ""}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={triggerRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-1.5 rounded-xl text-xs h-8.5 cursor-pointer"
          >
            <RefreshCw className={cn("w-3.5 h-3.5", isRefreshing && "animate-spin")} />
            <span>Refresh</span>
          </Button>
          <Button asChild size="sm" variant="outline" className="rounded-xl text-xs h-8.5">
            <Link href={`/chat/${waterId}`} target="_blank" className="flex items-center gap-1.5">
              <span>View Public Chat</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </Button>
        </div>
      </div>

      {/* Status Filter Tabs (All, Published, Hidden, Flagged, Deleted) */}
      <div className="flex items-center justify-between flex-wrap gap-2 bg-white dark:bg-slate-900 p-2 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xs">
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none">
          {(
            [
              { id: "all", label: "All Messages", count: counts.all },
              { id: "published", label: "Published", count: counts.published },
              { id: "hidden", label: "Hidden", count: counts.hidden },
              { id: "flagged", label: "Flagged", count: counts.flagged },
              { id: "deleted", label: "Deleted", count: counts.deleted },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setStatusFilter(tab.id)}
              className={cn(
                "px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5",
                statusFilter === tab.id
                  ? "bg-blue-600 text-white shadow-2xs"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              )}
            >
              <span>{tab.label}</span>
              <span
                className={cn(
                  "text-[10px] px-1.5 py-0.2 rounded-full font-bold",
                  statusFilter === tab.id
                    ? "bg-white/20 text-white"
                    : tab.count > 0 && (tab.id === "hidden" || tab.id === "flagged" || tab.id === "deleted")
                    ? "bg-amber-500/20 text-amber-700 dark:text-amber-300"
                    : "bg-slate-200/80 dark:bg-slate-700 text-slate-600 dark:text-slate-300"
                )}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 px-2 flex items-center gap-1.5">
          <Shield className="w-3.5 h-3.5 text-blue-500" />
          <span>Admin Live Oversight (Includes Hidden & Deleted)</span>
        </span>
      </div>

      {/* Messages List */}
      <Card className="p-0 overflow-hidden divide-y divide-slate-100 dark:divide-slate-800 rounded-2xl border-slate-200/80 dark:border-slate-800">
        {loading && messages.length === 0 ? (
          <div className="p-6 space-y-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-20 w-full rounded-xl bg-slate-100 dark:bg-slate-800/60 animate-pulse"
              />
            ))}
          </div>
        ) : filteredMessages.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-xs sm:text-sm space-y-1">
            <p className="font-semibold text-slate-700 dark:text-slate-300">
              {statusFilter === "all"
                ? "No messages posted in this conversation yet."
                : `No ${statusFilter} messages in this room.`}
            </p>
            {statusFilter !== "all" && counts.all > 0 && (
              <button
                type="button"
                onClick={() => setStatusFilter("all")}
                className="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline cursor-pointer mt-1"
              >
                Show all {counts.all} messages
              </button>
            )}
          </div>
        ) : (
          filteredMessages.map((msg) => {
            const isHidden = msg.status === "hidden";
            const isDeleted = msg.status === "deleted";
            const isFlagged = msg.status === "flagged";

            return (
              <div
                key={msg.id}
                className={cn(
                  "p-4 transition-colors",
                  isHidden
                    ? "bg-amber-50/40 dark:bg-amber-950/15"
                    : isDeleted
                    ? "bg-rose-50/40 dark:bg-rose-950/15"
                    : isFlagged
                    ? "bg-rose-50/60 dark:bg-rose-950/25"
                    : "bg-white dark:bg-slate-900"
                )}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-1.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">
                      {msg.display_name}
                    </span>
                    <span className="text-[11px] text-slate-400 font-mono">
                      ID: {msg.visitor_id.slice(0, 8)}
                    </span>
                    <span
                      className={cn(
                        "px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border",
                        msg.status === "published"
                          ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20"
                          : isHidden
                          ? "bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30"
                          : isFlagged
                          ? "bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/30"
                          : "bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-300 dark:border-slate-700"
                      )}
                    >
                      {msg.status}
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-400">
                    {formatDate(msg.created_at)}
                  </span>
                </div>

                <p
                  className={cn(
                    "text-xs sm:text-sm py-1 whitespace-pre-wrap",
                    isDeleted
                      ? "line-through text-slate-400 dark:text-slate-500"
                      : isHidden
                      ? "text-slate-600 dark:text-slate-300 italic"
                      : "text-slate-800 dark:text-slate-100"
                  )}
                >
                  {msg.message}
                </p>

                {msg.moderation_reason && (
                  <p className="text-[11px] text-amber-600 dark:text-amber-400 italic mt-1 flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3 shrink-0" />
                    <span>{msg.moderation_reason}</span>
                  </p>
                )}

                <div className="flex items-center flex-wrap gap-2 mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-800/80 text-xs">
                  {msg.status !== "published" && (
                    <button
                      type="button"
                      disabled={moderatingId === msg.id}
                      onClick={() => handleModerate(msg.id, "published")}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-2xs transition-colors cursor-pointer disabled:opacity-50"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>
                        {isHidden
                          ? "Unhide Message"
                          : isDeleted
                          ? "Restore Message"
                          : "Approve & Publish"}
                      </span>
                    </button>
                  )}

                  {msg.status !== "hidden" && (
                    <button
                      type="button"
                      disabled={moderatingId === msg.id}
                      onClick={() => handleModerate(msg.id, "hidden")}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/20 font-semibold text-xs transition-colors cursor-pointer disabled:opacity-50"
                    >
                      <EyeOff className="w-3.5 h-3.5" />
                      <span>Hide</span>
                    </button>
                  )}

                  {msg.status !== "deleted" ? (
                    <button
                      type="button"
                      disabled={moderatingId === msg.id}
                      onClick={() => handleModerate(msg.id, "deleted")}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/20 font-semibold text-xs transition-colors cursor-pointer disabled:opacity-50"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      disabled={moderatingId === msg.id}
                      onClick={() => handleModerate(msg.id, "purge")}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs transition-colors cursor-pointer disabled:opacity-50"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete Permanently</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </Card>
    </div>
  );
}
