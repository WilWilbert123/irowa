// src/components/notifications/notification-list.tsx
"use client";

import React from "react";
import { NotificationItem } from "./notification-item";
import { useNotifications } from "@/contexts/notification-context";
import { Bell, CheckCheck } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export function NotificationList() {
  const { notifications, unreadCount, markAsRead, markAllAsRead, isLoading } = useNotifications();

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2">
            <Skeleton className="w-1/3 h-4 rounded-md" />
            <Skeleton className="w-full h-8 rounded-lg" />
          </div>
        ))}
      </div>
    );
  }

  if (notifications.length === 0) {
    return (
      <div className="rounded-3xl border border-dashed border-slate-300 dark:border-slate-800 p-12 text-center flex flex-col items-center justify-center text-slate-400">
        <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-3">
          <Bell className="h-6 w-6 text-slate-400" />
        </div>
        <h4 className="font-semibold text-sm text-slate-700 dark:text-slate-300">No notifications yet</h4>
        <p className="text-xs text-slate-500 max-w-xs mt-1">
          You will receive updates here whenever new water resources are verified or emergency advisories are published.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {unreadCount > 0 && (
        <div className="flex justify-end">
          <button
            onClick={markAllAsRead}
            className="flex items-center gap-1.5 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
          >
            <CheckCheck className="h-3.5 w-3.5" />
            <span>Mark all as read</span>
          </button>
        </div>
      )}

      <div className="space-y-3">
        {notifications.map((notif) => (
          <NotificationItem
            key={notif.id}
            notification={notif}
            onMarkRead={markAsRead}
          />
        ))}
      </div>
    </div>
  );
}
