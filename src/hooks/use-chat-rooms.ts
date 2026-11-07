// src/hooks/use-chat-rooms.ts
"use client";

import { useEffect, useState, useCallback } from "react";
import { ChatRoomWithSource } from "@/types/chat";
import { getChatRooms, getPublishedAnnouncements } from "@/lib/services/chat-service";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";

const CACHED_ROOMS_KEY = "irowa_offline_chat_rooms";
const CACHED_ANNOUNCEMENTS_KEY = "irowa_offline_announcements";

export function useChatRooms() {
  const [rooms, setRooms] = useState<ChatRoomWithSource[]>([]);
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isConnected, setIsConnected] = useState(false);

  // Load offline cached discussions on mount
  useEffect(() => {
    try {
      const cachedRooms = localStorage.getItem(CACHED_ROOMS_KEY);
      const cachedAnn = localStorage.getItem(CACHED_ANNOUNCEMENTS_KEY);
      if (cachedRooms) {
        setRooms(JSON.parse(cachedRooms));
        setIsLoading(false);
      }
      if (cachedAnn) {
        setAnnouncements(JSON.parse(cachedAnn));
      }
    } catch {
      // Ignore parse error
    }
  }, []);

  const fetchRooms = useCallback(async () => {
    try {
      const [roomsData, announcementsData] = await Promise.all([
        getChatRooms(),
        getPublishedAnnouncements(),
      ]);
      if (roomsData && roomsData.length > 0) {
        setRooms(roomsData);
        try {
          localStorage.setItem(CACHED_ROOMS_KEY, JSON.stringify(roomsData));
        } catch {}
      }
      if (announcementsData && announcementsData.length > 0) {
        setAnnouncements(announcementsData);
        try {
          localStorage.setItem(CACHED_ANNOUNCEMENTS_KEY, JSON.stringify(announcementsData));
        } catch {}
      }
    } catch (err) {
      console.warn("Failed to fetch chat rooms, using offline backup:", err);
      try {
        const cachedRooms = localStorage.getItem(CACHED_ROOMS_KEY);
        if (cachedRooms) {
          setRooms(JSON.parse(cachedRooms));
        }
      } catch {}
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
