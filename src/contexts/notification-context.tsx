// src/contexts/notification-context.tsx
"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { NotificationRow, AnnouncementRow } from "@/types/notification";
import { getNotifications, getAnnouncements } from "@/lib/services/notification-service";
import { subscribeToPushNotifications, unsubscribeFromPushNotifications } from "@/lib/notifications/push-manager";
import { createClient } from "@/lib/supabase/client";
import { useVisitor } from "./visitor-context";

interface NotificationContextType {
  notifications: NotificationRow[];
  announcements: AnnouncementRow[];
  unreadCount: number;
  isLoading: boolean;
  pushEnabled: boolean;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  togglePushNotifications: () => Promise<boolean>;
  refreshNotifications: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<NotificationRow[]>([]);
  const [announcements, setAnnouncements] = useState<AnnouncementRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pushEnabled, setPushEnabled] = useState(false);
  const { visitor } = useVisitor();

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [notifs, anncs] = await Promise.all([
        getNotifications(visitor?.visitorId),
        getAnnouncements(),
      ]);
      setNotifications(notifs);
      setAnnouncements(anncs);
    } catch {
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();

    // Setup Supabase Realtime subscription
    const supabase = createClient();
    const channel = supabase
      .channel("public_notifications")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "notifications" },
        (payload: any) => {
          const newNotif = payload.new as NotificationRow;
          setNotifications((prev) => [newNotif, ...prev]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [visitor?.visitorId]);

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
    );
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
  };

  const togglePushNotifications = async (): Promise<boolean> => {
    if (pushEnabled) {
      const success = await unsubscribeFromPushNotifications();
      if (success) setPushEnabled(false);
      return false;
    } else {
      const res = await subscribeToPushNotifications(visitor?.visitorId);
      if (res.success) {
        setPushEnabled(true);
        return true;
      }
      return false;
    }
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        announcements,
        unreadCount,
        isLoading,
        pushEnabled,
        markAsRead,
        markAllAsRead,
        togglePushNotifications,
        refreshNotifications: loadData,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotifications must be used within a NotificationProvider");
  }
  return context;
}
