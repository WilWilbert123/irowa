// src/hooks/use-admin-realtime.ts
"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";

interface UseAdminRealtimeOptions {
  tables?: string[];
  onSync?: () => void | Promise<void>;
  pollIntervalMs?: number;
}

export function useAdminRealtime(options: UseAdminRealtimeOptions = {}) {
  const {
    tables = [
      "water_sources",
      "water_submissions",
      "water_reports",
      "chat_messages",
      "visitor_sessions",
      "audit_logs",
      "announcements",
    ],
    onSync,
    pollIntervalMs = 25000,
  } = options;

  const [isLive, setIsLive] = useState(false);
  const [lastSync, setLastSync] = useState<Date>(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);

  const onSyncRef = useRef(onSync);
  onSyncRef.current = onSync;

  const triggerRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      if (onSyncRef.current) {
        await onSyncRef.current();
      }
      setLastSync(new Date());
    } catch (err) {
      console.warn("Manual sync error:", err);
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    if (!isSupabaseConfigured()) {
      setIsLive(true);
      return;
    }

    const supabase = createClient();
    const channelName = `admin_realtime_${Math.random().toString(36).substring(7)}`;
    let channel = supabase.channel(channelName);

    tables.forEach((table) => {
      channel = channel.on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: table,
        },
        (payload: any) => {
          setLastSync(new Date());
          if (onSyncRef.current) {
            onSyncRef.current();
          }
        }
      );
    });

    channel.subscribe((status: string) => {
      setIsLive(status === "SUBSCRIBED");
    });

    // Polling fallback & focus refetch
    const intervalId = setInterval(() => {
      if (onSyncRef.current) {
        onSyncRef.current();
        setLastSync(new Date());
      }
    }, pollIntervalMs);

    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        if (onSyncRef.current) {
          onSyncRef.current();
          setLastSync(new Date());
        }
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      clearInterval(intervalId);
      document.removeEventListener("visibilitychange", handleVisibility);
      supabase.removeChannel(channel);
    };
  }, [tables.join(","), pollIntervalMs]);

  return {
    isLive,
    lastSync,
    isRefreshing,
    triggerRefresh,
  };
}

