// src/app/notifications/page.tsx
"use client";

import React from "react";
import { Navbar } from "@/components/layout/navbar";
import { Sidebar } from "@/components/layout/sidebar";
import { BottomNav } from "@/components/layout/bottom-nav";
import { NotificationList } from "@/components/notifications/notification-list";
import { useNotifications } from "@/contexts/notification-context";
import { Bell, Smartphone, Check } from "lucide-react";

export default function NotificationsPage() {
  const { pushEnabled, togglePushNotifications } = useNotifications();

  return (
    <div className="flex flex-col h-full w-full overflow-hidden bg-slate-50 dark:bg-slate-950">
      <Navbar showSearch={false} />
      <div className="flex flex-1 min-h-0 w-full overflow-hidden">
        <Sidebar />
        <main className="flex-1 min-w-0 h-full overflow-y-auto p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto w-full space-y-6 pb-28 md:pb-12">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold text-blue-600 dark:text-blue-400 mb-1">
                <Bell className="h-4 w-4" />
                <span>Alerts & Advisories</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
                Notifications
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                Official municipal updates, newly verified water points, and dry weather precautions.
              </p>
            </div>

            {/* Push Notifications Toggle */}
            <button
              onClick={togglePushNotifications}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-semibold border transition-all cursor-pointer ${
                pushEnabled
                  ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800"
                  : "bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:bg-slate-100"
              }`}
            >
              <Smartphone className="h-4 w-4 text-blue-500" />
              <span>{pushEnabled ? "Push Enabled" : "Enable Push Alerts"}</span>
              {pushEnabled && <Check className="h-3.5 w-3.5" />}
            </button>
          </div>

          <NotificationList />
        </main>
      </div>
      <BottomNav />
    </div>
  );
}
