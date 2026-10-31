// src/hooks/use-chat-rooms.ts
"use client";

import { useEffect, useState, useCallback } from "react";
import { ChatRoomWithSource } from "@/types/chat";
import { getChatRooms, getPublishedAnnouncements } from "@/lib/services/chat-service";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";

export function useChatRooms() {
  const [rooms, setRooms] = useState<ChatRoomWithSource[]>([]);
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isConnected, setIsConnected] = useState(false);

  const fetchRooms = useCallback(async () => {
    try {
      const [roomsData, announcementsData] = await Promise.all([
        getChatRooms(),
        getPublishedAnnouncements(),
      ]);
      setRooms(roomsData);
      setAnnouncements(announcementsData);
    } catch (err) {
      console.error("Failed to fetch chat rooms or announcements:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRooms();

    if (!isSupabaseConfigured()) {
      setIsConnected(false);
      return;
    }

    const supabase = createClient();
    const channel = supabase
      .channel("chat_rooms_overview")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "chat_messages",
        },
        () => {
          fetchRooms();
        }
      )
      .subscribe((status: any) => {
        setIsConnected(status === "SUBSCRIBED");
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchRooms]);

  return {
    rooms,
    announcements,
    isLoading,
    isConnected,
    refreshRooms: fetchRooms,
  };
}
