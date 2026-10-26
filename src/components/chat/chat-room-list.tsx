// src/components/chat/chat-room-list.tsx
"use client";

import React from "react";
import Link from "next/link";
import { MessageSquare, Droplets, AlertTriangle, Users, Compass, ShieldAlert } from "lucide-react";
import { WaterSourceWithPhotos } from "@/types/water";
import { cn } from "@/lib/utils";

interface ChatRoomListProps {
  sources: WaterSourceWithPhotos[];
  activeSourceId?: string;
  onSelectRoom?: (sourceId: string) => void;
}

export function ChatRoomList({ sources, activeSourceId, onSelectRoom }: ChatRoomListProps) {
  const defaultRooms = [
    {
      id: "general",
      name: "General Community",
      category: "Public Forum",
      onlineCount: 32,
      icon: MessageSquare,
      color: "text-blue-500 bg-blue-50 dark:bg-blue-950/40",
    },
    {
      id: "alerts",
      name: "Water Alerts & Dry Spell",
      category: "Advisories",
      onlineCount: 12,
      icon: AlertTriangle,
      color: "text-rose-500 bg-rose-50 dark:bg-rose-950/40",
    },
    {
      id: "emergency",
      name: "Emergency Water Points",
      category: "Standby Wells",
      onlineCount: 6,
      icon: ShieldAlert,
      color: "text-amber-500 bg-amber-50 dark:bg-amber-950/40",
    },
  ];

  return (
    <div className="w-full md:w-80 shrink-0 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col h-full overflow-hidden">
      <div className="p-4 border-b border-slate-100 dark:border-slate-800">
        <h2 className="font-extrabold text-lg text-slate-900 dark:text-white">Community Chat</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Live discussions about water points across Irosin.
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-4">
        {/* Topic channels */}
        <div>
          <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider px-2">
            Community Channels
          </span>
          <div className="space-y-1 mt-1.5">
            {defaultRooms.map((room) => {
              const Icon = room.icon;
              const isSelected = activeSourceId === room.id;
              return (
                <button
                  key={room.id}
                  onClick={() => onSelectRoom && onSelectRoom(room.id)}
                  className={cn(
                    "w-full flex items-center justify-between p-3 rounded-2xl transition-all cursor-pointer text-left",
                    isSelected
                      ? "bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/60"
                      : "hover:bg-slate-100 dark:hover:bg-slate-800/60"
                  )}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center shrink-0", room.color)}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-semibold text-xs text-slate-900 dark:text-white truncate">
                        {room.name}
                      </h4>
                      <span className="text-[10px] text-slate-400">{room.category}</span>
                    </div>
                  </div>
                  <span className="text-[10px] font-medium text-emerald-600 dark:text-emerald-400 shrink-0">
                    {room.onlineCount} online
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Water Source Specific Chat Rooms */}
        <div>
          <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider px-2">
            Water Resource Discussions
          </span>
          <div className="space-y-1 mt-1.5">
            {sources.map((source) => {
              const isSelected = activeSourceId === source.id;
              return (
                <button
                  key={source.id}
                  onClick={() => onSelectRoom && onSelectRoom(source.id)}
                  className={cn(
                    "w-full flex items-center justify-between p-3 rounded-2xl transition-all cursor-pointer text-left",
                    isSelected
                      ? "bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/60"
                      : "hover:bg-slate-100 dark:hover:bg-slate-800/60"
                  )}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-xl bg-blue-100/60 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                      <Droplets className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-semibold text-xs text-slate-900 dark:text-white truncate">
                        {source.name}
                      </h4>
                      <span className="text-[10px] text-slate-400">
                        {source.category} {source.barangay ? `• ${source.barangay}` : ""}
                      </span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
