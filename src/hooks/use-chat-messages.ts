// src/hooks/use-chat-messages.ts
"use client";

import { useChat } from "@/contexts/chat-context";

export function useChatMessages(waterSourceId?: string) {
  const chat = useChat();

  return {
    ...chat,
    activeSourceId: waterSourceId || chat.activeWaterSourceId,
  };
}
