// src/components/notifications/notification-item.tsx
"use client";

import React from "react";
import Link from "next/link";
import { NotificationRow } from "@/types/notification";
import { formatRelativeTime } from "@/lib/utils/date-utils";
import { Droplet, AlertTriangle, Info, Bell, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface NotificationItemProps {
  notification: NotificationRow;
  onMarkRead: (id: string) => void;
}

export function NotificationItem({ notification, onMarkRead }: NotificationItemProps) {
  const getIcon = () => {
    switch (notification.type) {
      case "new_water_source":
        return <Droplet className="h-4 w-4 text-emerald-500" />;
      case "advisory":
        return <AlertTriangle className="h-4 w-4 text-amber-500" />;
      case "status_update":
        return <Info className="h-4 w-4 text-blue-500" />;
      default:
        return <Bell className="h-4 w-4 text-purple-500" />;
    }
  };

  return (
    <div
      onClick={() => onMarkRead(notification.id)}
      className={cn(
        "flex items-start gap-3.5 p-4 rounded-2xl border transition-all cursor-pointer",
        notification.is_read
          ? "bg-white dark:bg-slate-900 border-slate-200/70 dark:border-slate-800 opacity-80"
          : "bg-blue-50/50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900/50 shadow-xs"
      )}
    >
      <div className="w-9 h-9 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center shrink-0 shadow-xs">
        {getIcon()}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2 mb-1">
          <h4 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white truncate">
            {notification.title}
          </h4>
          <span className="text-[10px] text-slate-400 shrink-0">
            {formatRelativeTime(notification.created_at)}
          </span>
        </div>

        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
          {notification.body}
        </p>

        {notification.water_source_id && (
          <div className="mt-2.5">
            <Link
              href={`/water/${notification.water_source_id}`}
              className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-1"
            >
              <span>View Water Source Details →</span>
            </Link>
          </div>
        )}
      </div>

      {!notification.is_read && (
        <span className="w-2 h-2 rounded-full bg-blue-600 dark:bg-blue-400 shrink-0 mt-1.5" />
      )}
    </div>
  );
}
