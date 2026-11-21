// src/app/notifications/page.tsx
"use client";

import React, { useState } from "react";
import { Navbar } from "@/components/layout/navbar";
import { Sidebar } from "@/components/layout/sidebar";
import { BottomNav } from "@/components/layout/bottom-nav";
import { NotificationList } from "@/components/notifications/notification-list";
import { useNotifications } from "@/contexts/notification-context";
import { 
  Bell, 
  BellRing, 
  Check, 
  Loader2, 
  CheckCircle2, 
  AlertCircle, 
  X 
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function NotificationsPage() {
  const { pushEnabled, togglePushNotifications } = useNotifications();
  const [isToggling, setIsToggling] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const handleToggle = async () => {
    if (isToggling) return;
    setIsToggling(true);
    setFeedbackMessage(null);

    try {
      const newState = await togglePushNotifications();
      if (newState) {
        setFeedbackMessage({
          type: "success",
          text: "Push alerts active! You will receive municipal advisories on this device.",
        });
      } else {
        setFeedbackMessage({
          type: "success",
          text: "Push alerts turned off.",
        });
      }
    } catch (err: any) {
      setFeedbackMessage({
        type: "error",
        text: err.message || "Could not enable alerts. Please verify browser notification permissions.",
      });
    } finally {
      setIsToggling(false);
    }
  };

  return (
    <div className="flex flex-col h-full w-full overflow-hidden bg-slate-50 dark:bg-slate-950">
      <Navbar showSearch={false} />
      <div className="flex flex-1 min-h-0 w-full overflow-hidden">
        <Sidebar />
        <main className="flex-1 min-w-0 h-full overflow-y-auto p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto w-full space-y-5 pb-28 md:pb-12">
          {/* Header & Mobile-Friendly Push Toggle */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 sm:p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-2xs">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs font-semibold text-blue-600 dark:text-blue-400">
                <Bell className="h-4 w-4" />
                <span>Alerts & Advisories</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                Notifications
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                Official municipal bulletins, water availability updates, and dry weather precautions.
              </p>
            </div>

            {/* Smooth Tactile Push Notifications Button */}
            <button
              type="button"
              onClick={handleToggle}
              disabled={isToggling}
              className={cn(
                "relative flex items-center justify-center gap-2.5 px-5 py-3 rounded-2xl text-xs font-bold border transition-all duration-200 select-none touch-manipulation cursor-pointer",
                "active:scale-95 active:shadow-none focus:outline-none focus:ring-2 focus:ring-blue-500/20",
                "w-full sm:w-auto shrink-0 shadow-2xs",
                pushEnabled
                  ? "bg-emerald-50/90 hover:bg-emerald-100/80 active:bg-emerald-200/80 text-emerald-800 dark:bg-emerald-950/40 dark:hover:bg-emerald-900/50 dark:text-emerald-300 border-emerald-300/80 dark:border-emerald-800"
                  : "bg-blue-50/60 hover:bg-blue-100/70 active:bg-blue-200/60 text-blue-700 dark:bg-blue-950/30 dark:hover:bg-blue-900/40 dark:text-blue-300 border-blue-200 dark:border-blue-900/60",
                isToggling && "opacity-80 cursor-wait active:scale-100"
              )}
            >
              {isToggling ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin text-blue-600 dark:text-blue-400 shrink-0" />
                  <span>{pushEnabled ? "Disabling..." : "Requesting Alerts..."}</span>
                </>
              ) : pushEnabled ? (
                <>
                  <span className="relative flex h-2.5 w-2.5 shrink-0">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                  </span>
                  <span>Push Alerts Active</span>
                  <Check className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0 ml-0.5" />
                </>
              ) : (
                <>
                  <BellRing className="h-4 w-4 text-blue-600 dark:text-blue-400 shrink-0" />
                  <span>Enable Push Alerts</span>
                </>
              )}
            </button>
          </div>

          {/* User Feedback Message (Success or Permission Blocked) */}
          {feedbackMessage && (
            <div
              className={cn(
                "p-3.5 rounded-2xl text-xs flex items-center justify-between gap-2.5 transition-all animate-in fade-in slide-in-from-top-2 duration-200 shadow-2xs",
                feedbackMessage.type === "success"
                  ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900"
                  : "bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-900"
              )}
            >
              <div className="flex items-center gap-2">
                {feedbackMessage.type === "success" ? (
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                ) : (
                  <AlertCircle className="h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
                )}
                <span>{feedbackMessage.text}</span>
              </div>
              <button
                type="button"
                onClick={() => setFeedbackMessage(null)}
                className="p-1 hover:bg-black/5 dark:hover:bg-white/10 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                title="Dismiss"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          )}

          <NotificationList />
        </main>
      </div>
      <BottomNav />
    </div>
  );
}
