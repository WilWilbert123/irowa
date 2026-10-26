// src/app/chat/[waterId]/page.tsx
"use client";

import React, { useEffect, useState, use } from "react";
import Link from "next/link";
import { ArrowLeft, Droplets, Info } from "lucide-react";
import { ChatMessageList } from "@/components/chat/chat-message-list";
import { ChatInput } from "@/components/chat/chat-input";
import { useChat } from "@/contexts/chat-context";
import { useWaterDetails } from "@/hooks/use-water-details";

export default function WaterChatPage({
  params,
}: {
  params: Promise<{ waterId: string }>;
}) {
  const { waterId } = use(params);
  const { source } = useWaterDetails(waterId);
  const { messages, isLoading, sendMessage, setActiveWaterSourceId } = useChat();

  useEffect(() => {
    if (waterId) {
      setActiveWaterSourceId(waterId);
    }
  }, [waterId, setActiveWaterSourceId]);

  return (
    <div className="flex flex-col w-full h-full bg-slate-50 dark:bg-slate-950 overflow-hidden">
      {/* Top Header */}
      <div className="h-16 px-4 sm:px-6 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <Link
            href="/chat"
            className="p-2 -ml-2 rounded-xl text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
            aria-label="Back to channels"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>

          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-300 flex items-center justify-center shrink-0">
              <Droplets className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-slate-900 dark:text-white leading-tight">
                {source?.name || "Water Source Chat"}
              </h3>
              <span className="text-[11px] text-slate-400 block">
                {source?.category} {source?.barangay ? `• Brgy. ${source.barangay}` : ""}
              </span>
            </div>
          </div>
        </div>

        {source && (
          <Link
            href={`/water/${source.slug}`}
            className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
          >
            <Info className="h-4 w-4" />
            <span className="hidden sm:inline">Source Info</span>
          </Link>
        )}
      </div>

      {/* Message stream */}
      <ChatMessageList messages={messages} isLoading={isLoading} />

      {/* Input bar */}
      <div className="pb-[env(safe-area-inset-bottom)]">
        <ChatInput onSendMessage={sendMessage} />
      </div>
    </div>
  );
}
