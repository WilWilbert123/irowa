// src/contexts/chat-context.tsx
"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { ChatMessageRow } from "@/types/chat";
import { getMessagesAction, sendChatMessageAction } from "@/actions/chat-actions";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import { useVisitor } from "./visitor-context";

interface ChatContextType {
  messages: ChatMessageRow[];
  isLoading: boolean;
  error: string | null;
  activeWaterSourceId: string | null;
  setActiveWaterSourceId: (id: string | null) => void;
  sendMessage: (text: string) => Promise<{
    success: boolean;
    error?: string;
    isFlagged?: boolean;
    moderationReason?: string | null;
  }>;
  refreshMessages: () => Promise<void>;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const [activeWaterSourceId, setActiveWaterSourceId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessageRow[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { visitor } = useVisitor();

  const loadMessages = useCallback(async (sourceId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getMessagesAction(sourceId);
      setMessages(data);
    } catch (err: any) {
      setError(err.message || "Failed to load messages");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!activeWaterSourceId) {
      setMessages([]);
      return;
    }

    loadMessages(activeWaterSourceId);

    // Set up Realtime listener if Supabase is active
    if (!isSupabaseConfigured()) {
      return;
    }

    const supabase = createClient();
    const channel = supabase
      .channel(`chat_${activeWaterSourceId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "chat_messages",
        },
        (payload: any) => {
          if (payload.eventType === "INSERT" || payload.eventType === "UPDATE") {
            const newMsg = payload.new as ChatMessageRow;
            if (newMsg.status === "published") {
              setMessages((prev) => {
                if (prev.some((m) => m.id === newMsg.id)) return prev;
                return [...prev, newMsg].sort(
                  (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
                );
              });
            } else {
              // If hidden, flagged, or deleted by admin, remove from public chat stream
              setMessages((prev) => prev.filter((m) => m.id !== newMsg.id));
            }
          } else if (payload.eventType === "DELETE") {
            const oldId = payload.old?.id;
            if (oldId) {
              setMessages((prev) => prev.filter((m) => m.id !== oldId));
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [activeWaterSourceId, loadMessages]);

  const handleSendMessage = async (text: string) => {
    if (!activeWaterSourceId || !visitor) {
      return { success: false, error: "Missing active conversation or visitor identifier" };
    }
    const displayName = visitor.displayName || "Resident";

    const res: any = await sendChatMessageAction({
      water_source_id: activeWaterSourceId,
      visitor_id: visitor.visitorId,
      display_name: displayName,
      message: text,
    });

    if (res.success && res.data) {
      const isFlagged = res.data.status === "flagged";
      if (!isFlagged) {
        setMessages((prev) => {
          if (prev.some((m) => m.id === res.data?.id)) return prev;
          return [...prev, res.data!];
        });
      }
      return {
        success: true,
        isFlagged,
        moderationReason: res.data.moderation_reason,
      };
    }
    return { success: false, error: res.error || "Failed to deliver message" };
  };

  return (
    <ChatContext.Provider
      value={{
        messages,
        isLoading,
        error,
        activeWaterSourceId,
        setActiveWaterSourceId,
        sendMessage: handleSendMessage,
        refreshMessages: () => (activeWaterSourceId ? loadMessages(activeWaterSourceId) : Promise.resolve()),
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error("useChat must be used within a ChatProvider");
  }
  return context;
}
