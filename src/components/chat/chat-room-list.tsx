// src/components/chat/chat-room-list.tsx
"use client";

import React, { useState, useMemo } from "react";
import { MessageSquare, Droplets, AlertTriangle, Search, X, Radio, ShieldAlert, CheckCircle2 } from "lucide-react";
import { ChatRoomWithSource } from "@/types/chat";
import { useChatRooms } from "@/hooks/use-chat-rooms";
import { CATEGORY_COLORS } from "@/lib/utils/constants";
import { formatRelativeTime } from "@/lib/utils/date-utils";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface ChatRoomListProps {
  activeSourceId?: string;
  onSelectRoom?: (sourceId: string) => void;
}

export function ChatRoomList({ activeSourceId, onSelectRoom }: ChatRoomListProps) {
  const { rooms, announcements, isLoading, isConnected } = useChatRooms();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"discussions" | "advisories">("discussions");

  // Filter rooms by search query (name or barangay)
  const filteredRooms = useMemo(() => {
    if (!searchQuery.trim()) return rooms;
    const q = searchQuery.toLowerCase().trim();
    return rooms.filter((room) => {
      const name = room.water_source?.name?.toLowerCase() || "";
      const brgy = room.water_source?.barangay?.toLowerCase() || "";
      const cat = room.water_source?.category?.toLowerCase() || "";
      return name.includes(q) || brgy.includes(q) || cat.includes(q);
    });
  }, [rooms, searchQuery]);

  return (
    <div className="w-full md:w-88 shrink-0 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="p-3.5 sm:p-4 border-b border-slate-100 dark:border-slate-800 space-y-3 shrink-0">
        <div>
          <h2 className="font-extrabold text-lg text-slate-900 dark:text-white leading-tight">
            Community Chat
          </h2>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
            Water point discussions across Irosin
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search discussions or barangay..."
            className="w-full h-9 pl-8.5 pr-8 rounded-xl bg-slate-50 dark:bg-slate-800/80 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 border border-slate-200/80 dark:border-slate-700/80 focus:outline-none focus:border-blue-500 transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 active:scale-90 transition-transform cursor-pointer"
              aria-label="Clear search"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Tab Selector: Discussions vs Official Advisories */}
        <div className="flex items-center p-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-semibold select-none">
          <button
            onClick={() => setActiveTab("discussions")}
            className={cn(
              "flex-1 py-1.5 rounded-lg text-center transition-all duration-150 active:scale-95 cursor-pointer flex items-center justify-center gap-1.5",
              activeTab === "discussions"
                ? "bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-2xs font-bold"
                : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
            )}
          >
            <Droplets className="h-3.5 w-3.5" />
            <span>Discussions ({rooms.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("advisories")}
            className={cn(
              "flex-1 py-1.5 rounded-lg text-center transition-all duration-150 active:scale-95 cursor-pointer flex items-center justify-center gap-1.5",
              activeTab === "advisories"
                ? "bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-2xs font-bold"
                : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
            )}
          >
            <AlertTriangle className="h-3.5 w-3.5" />
            <span>Advisories ({announcements.length})</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-2 sm:p-3 space-y-1.5">
        {isLoading ? (
          <div className="p-2 space-y-2.5">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-2xl border border-slate-100 dark:border-slate-800">
                <Skeleton className="w-10 h-10 rounded-xl shrink-0" />
                <div className="flex-1 space-y-1.5 min-w-0">
                  <Skeleton className="w-2/3 h-3.5 rounded-md" />
                  <Skeleton className="w-1/2 h-3 rounded-md" />
                </div>
              </div>
            ))}
          </div>
        ) : activeTab === "discussions" ? (
          filteredRooms.length === 0 ? (
            <div className="p-8 text-center text-slate-400 flex flex-col items-center justify-center">
              <MessageSquare className="h-8 w-8 text-slate-300 dark:text-slate-600 mb-2" />
              <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                {searchQuery ? `No discussions match "${searchQuery}"` : "No active discussion rooms"}
              </p>
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="mt-2 text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline cursor-pointer"
                >
                  Clear search
                </button>
              )}
            </div>
          ) : (
            filteredRooms.map((room) => {
              const source = room.water_source;
              const sourceId = room.water_source_id;
              const isSelected = activeSourceId === sourceId;
              const colorDef =
                CATEGORY_COLORS[(source?.category as any) || "Other"] ||
                CATEGORY_COLORS["Other"];
              const lastMsg = room.last_message;
              const msgCount = room.message_count || 0;

              return (
                <button
                  key={room.id}
                  onClick={() => onSelectRoom && onSelectRoom(sourceId)}
                  className={cn(
                    "w-full flex items-center justify-between p-2.5 sm:p-3 rounded-2xl transition-all duration-150 ease-out cursor-pointer text-left select-none active:scale-[0.98]",
                    isSelected
                      ? "bg-blue-50/90 dark:bg-blue-950/40 border border-blue-200/90 dark:border-blue-800/70 shadow-2xs"
                      : "hover:bg-slate-100/80 dark:hover:bg-slate-800/60 border border-transparent"
                  )}
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    {/* Category Icon */}
                    <div
                      className={cn(
                        "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border shadow-2xs",
                        colorDef.bg,
                        colorDef.border,
                        colorDef.text
                      )}
                    >
                      <Droplets className="h-5 w-5" />
                    </div>

                    {/* Room Info */}
                    <div className="min-w-0 flex-1 pr-1">
                      <div className="flex items-center justify-between gap-1 mb-0.5">
                        <h4 className="font-bold text-xs text-slate-900 dark:text-white truncate">
                          {source?.name || "Water Source Room"}
                        </h4>
                        {lastMsg && (
                          <span className="text-[10px] text-slate-400 shrink-0 font-medium">
                            {formatRelativeTime(lastMsg.created_at)}
                          </span>
                        )}
                      </div>

                      {/* Snippet / Subtitle */}
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                        {lastMsg ? (
                          <span>
                            <strong className="text-slate-700 dark:text-slate-300 font-semibold">
                              {lastMsg.display_name.split(" ")[0]}:
                            </strong>{" "}
                            {lastMsg.message}
                          </span>
                        ) : (
                          <span className="text-slate-400 italic">
                            {source?.category} {source?.barangay ? `• Brgy. ${source.barangay}` : ""}
                          </span>
                        )}
                      </p>
                    </div>
                  </div>

                  {/* Message Count Badge */}
                  {msgCount > 0 && (
                    <span className="ml-2 px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 text-[10px] font-bold shrink-0 border border-blue-200/60 dark:border-blue-800/60">
                      {msgCount}
                    </span>
                  )}
                </button>
              );
            })
          )
        ) : (
          /* Official Advisories Tab */
          <div className="space-y-2.5 p-1">
            {announcements.length === 0 ? (
              <div className="p-8 text-center text-slate-400">
                <CheckCircle2 className="h-8 w-8 text-emerald-500 mx-auto mb-2" />
                <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                  No active warnings or advisories
                </p>
                <p className="text-[11px] text-slate-400 mt-1">
                  All municipal water channels and springs are operating normally.
                </p>
              </div>
            ) : (
              announcements.map((ann) => (
                <div
                  key={ann.id}
                  className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 space-y-2"
                >
                  <div className="flex items-start justify-between gap-2">
                    <span
                      className={cn(
                        "text-[9px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full",
                        ann.priority === "high"
                          ? "bg-rose-100 text-rose-700 dark:bg-rose-950/80 dark:text-rose-300 border border-rose-200 dark:border-rose-900"
                          : "bg-blue-100 text-blue-700 dark:bg-blue-950/80 dark:text-blue-300 border border-blue-200 dark:border-blue-900"
                      )}
                    >
                      {ann.priority === "high" ? "Urgent Notice" : "Official Bulletin"}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {formatRelativeTime(ann.published_at || ann.created_at)}
                    </span>
                  </div>

                  <h4 className="font-bold text-xs text-slate-900 dark:text-white leading-snug">
                    {ann.title}
                  </h4>

                  <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
                    {ann.body}
                  </p>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
