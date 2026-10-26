// src/hooks/use-realtime-chat.ts
"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export function useRealtimeChat(roomId: string, onNewMessage: (msg: any) => void) {
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!roomId) return;
    const supabase = createClient();

    const channel = supabase
      .channel(`room_${roomId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "chat_messages",
          filter: `chat_room_id=eq.${roomId}`,
        },
        (payload: any) => {
          onNewMessage(payload.new);
        }
      )
      .subscribe((status: any) => {
        setIsConnected(status === "SUBSCRIBED");
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [roomId, onNewMessage]);

  return { isConnected };
}
