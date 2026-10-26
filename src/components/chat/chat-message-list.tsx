// src/components/chat/chat-message-list.tsx
"use client";

import React, { useEffect, useRef } from "react";
import { ChatMessageRow } from "@/types/chat";
import { ChatMessageBubble } from "./chat-message-bubble";
import { useVisitor } from "@/contexts/visitor-context";
import { MessageSquare, Users } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface ChatMessageListProps {
  messages: ChatMessageRow[];
  isLoading?: boolean;
  onReportMessage?: (msgId: string) => void;
}

export function ChatMessageList({
  messages,
  isLoading,
  onReportMessage,
}: ChatMessageListProps) {
  const { visitor } = useVisitor();
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  if (isLoading) {
    return (
      <div className="flex-1 p-5 space-y-4 overflow-y-auto">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex gap-3">
            <Skeleton className="w-8 h-8 rounded-full shrink-0" />
            <div className="space-y-1.5 w-2/3">
              <Skeleton className="w-24 h-3.5 rounded-md" />
              <Skeleton className="w-full h-12 rounded-2xl" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-400">
        <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-3">
          <MessageSquare className="h-6 w-6 text-slate-400" />
        </div>
        <h4 className="font-semibold text-sm text-slate-700 dark:text-slate-300">No messages yet</h4>
        <p className="text-xs text-slate-500 max-w-xs mt-1">
          Be the first to share an update, ask about water conditions, or verify availability.
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4">
      {messages.map((msg) => (
        <ChatMessageBubble
          key={msg.id}
          message={msg}
          isCurrentUser={msg.visitor_id === visitor?.visitorId}
          onReportMessage={onReportMessage}
        />
      ))}
      <div ref={bottomRef} />
    </div>
  );
}
