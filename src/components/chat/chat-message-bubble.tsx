// src/components/chat/chat-message-bubble.tsx
"use client";

import React from "react";
import { ChatMessageRow } from "@/types/chat";
import { formatRelativeTime } from "@/lib/utils/date-utils";
import { ShieldCheck, Flag } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChatMessageBubbleProps {
  message: ChatMessageRow;
  isCurrentUser: boolean;
  onReportMessage?: (msgId: string) => void;
}

export function ChatMessageBubble({
  message,
  isCurrentUser,
  onReportMessage,
}: ChatMessageBubbleProps) {
  const isAdmin = message.display_name.toLowerCase().includes("admin") || message.display_name.toLowerCase().includes("mdrrmo");

  return (
    <div className={cn("flex gap-3 group animate-in fade-in duration-200", isCurrentUser ? "flex-row-reverse" : "flex-row")}>
      {/* Avatar circle */}
      <div
        className={cn(
          "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 border-2",
          isAdmin
            ? "bg-blue-600 text-white border-blue-400"
            : isCurrentUser
            ? "bg-slate-800 text-white dark:bg-slate-200 dark:text-slate-900 border-white dark:border-slate-800"
            : "bg-teal-600 text-white border-white dark:border-slate-800"
        )}
      >
        {isAdmin ? "A" : message.display_name.slice(0, 1).toUpperCase()}
      </div>

      <div className={cn("flex flex-col max-w-[80%]", isCurrentUser ? "items-end" : "items-start")}>
        {/* Name and time */}
        <div className="flex items-center gap-2 mb-1 px-1">
          <span className="font-semibold text-xs text-slate-900 dark:text-white flex items-center gap-1">
            {message.display_name}
            {isAdmin && (
              <span className="text-[10px] bg-blue-100 text-blue-700 dark:bg-blue-900/60 dark:text-blue-300 px-1.5 py-0.2 rounded-full inline-flex items-center gap-0.5">
                <ShieldCheck className="h-3 w-3" />
                Staff
              </span>
            )}
          </span>
          <span className="text-[10px] text-slate-400">
            {formatRelativeTime(message.created_at)}
          </span>
        </div>

        {/* Bubble */}
        <div
          className={cn(
            "p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed shadow-xs relative",
            isCurrentUser
              ? "bg-blue-600 text-white rounded-tr-xs"
              : isAdmin
              ? "bg-blue-50 dark:bg-blue-950/40 text-blue-950 dark:text-blue-100 border border-blue-200/80 dark:border-blue-900/50 rounded-tl-xs"
              : "bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-tl-xs"
          )}
        >
          {message.status === "hidden" ? (
            <span className="italic text-slate-400">[Message hidden by moderator]</span>
          ) : (
            message.message
          )}
        </div>
      </div>
    </div>
  );
}
