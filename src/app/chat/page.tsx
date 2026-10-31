// src/app/chat/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import { ChatRoomList } from "@/components/chat/chat-room-list";
import { ChatMessageList } from "@/components/chat/chat-message-list";
import { ChatInput } from "@/components/chat/chat-input";
import { useWaterSources } from "@/hooks/use-water-sources";
import { useChat } from "@/contexts/chat-context";
import { useRouter } from "next/navigation";
import { useIsMobile } from "@/hooks/use-mobile";
import { Droplets, Radio } from "lucide-react";

export default function ChatMainPage() {
  const router = useRouter();
  const isMobile = useIsMobile();
  const { sources } = useWaterSources();
  const [activeRoomId, setActiveRoomId] = useState<string>("c3333333-3333-4333-c333-333333333333"); // Maasim River
  const { messages, isLoading, sendMessage, setActiveWaterSourceId } = useChat();

  useEffect(() => {
    if (!isMobile && activeRoomId) {
      setActiveWaterSourceId(activeRoomId);
    }
  }, [activeRoomId, isMobile, setActiveWaterSourceId]);

  const handleSelectRoom = (roomId: string) => {
    if (isMobile) {
      router.push(`/chat/${roomId}`);
    } else {
      setActiveRoomId(roomId);
      setActiveWaterSourceId(roomId);
    }
  };

  const currentSource = sources.find((s) => s.id === activeRoomId);

  return (
    <div className="flex w-full h-full overflow-hidden bg-white dark:bg-slate-900 border-x border-slate-200 dark:border-slate-800">
      <ChatRoomList
        activeSourceId={activeRoomId}
        onSelectRoom={handleSelectRoom}
      />

      {/* Right chat panel for desktop */}
      <div className="hidden md:flex flex-1 flex-col h-full bg-slate-50 dark:bg-slate-950/60 overflow-hidden">
        {/* Header */}
        <div className="h-16 px-6 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-300 flex items-center justify-center">
              <Droplets className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
                {currentSource?.name || "Community Discussion"}
              </h3>
              <span className="text-[11px] text-slate-400">
                {currentSource?.barangay ? `Barangay ${currentSource.barangay}` : "Live Public Room"}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/60 dark:border-emerald-800/60 text-emerald-600 dark:text-emerald-400 text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Live Stream</span>
          </div>
        </div>

        {/* Message Stream */}
        <ChatMessageList messages={messages} isLoading={isLoading} />

        {/* Bottom Input */}
        <ChatInput onSendMessage={sendMessage} />
      </div>
    </div>
  );
}
