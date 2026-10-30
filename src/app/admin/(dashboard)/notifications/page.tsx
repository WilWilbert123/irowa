// src/app/admin/(dashboard)/notifications/page.tsx
"use client";

import React, { useState } from "react";
import { Bell, Send, CheckCircle2, ShieldAlert, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { sendBroadcastNotificationAction } from "@/actions/notification-actions";
import { AdminHeader } from "@/components/admin/admin-header";

export default function AdminNotificationBroadcastPage() {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !body.trim()) return;

    setSending(true);
    setError(null);
    setSuccess(false);

    try {
      await sendBroadcastNotificationAction({
        title: title.trim(),
        body: body.trim(),
      });
      setSuccess(true);
      setTitle("");
      setBody("");
    } catch (err) {
      setError((err as Error).message || "Failed to broadcast notification");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="max-w-3xl space-y-6">
      <AdminHeader
        title="Push & Alert Notification Dispatcher"
        subtitle="Broadcast real-time in-app alerts and web push notifications to all citizens using IroWa."
        isLive={true}
      />

      {success && (
        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 text-emerald-700 dark:text-emerald-300 text-xs sm:text-sm font-semibold flex items-center gap-2.5">
          <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-500" />
          Notification successfully dispatched to active users and push subscribers!
        </div>
      )}

      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs sm:text-sm font-semibold flex items-center gap-2.5">
          <ShieldAlert className="w-5 h-5 shrink-0 text-rose-500" />
          {error}
        </div>
      )}

      <form onSubmit={handleSend} className="space-y-6">
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Bell className="w-4 h-4 text-blue-500" />
            Dispatch Broadcast Message
          </h2>

          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
              Notification Title <span className="text-rose-500">*</span>
            </label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Clean Spring Source Reopened at Brgy. Liang"
              className="rounded-xl bg-slate-50 dark:bg-slate-800/60 text-xs sm:text-sm"
              required
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
              Message Body <span className="text-rose-500">*</span>
            </label>
            <Textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={4}
              placeholder="Enter message text that will appear in user notification trays and push alerts..."
              className="rounded-xl bg-slate-50 dark:bg-slate-800/60 text-xs sm:text-sm leading-relaxed"
              required
            />
          </div>
        </div>

        <div className="flex justify-end">
          <Button
            type="submit"
            disabled={sending}
            className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs flex items-center gap-2 shadow-xs cursor-pointer"
          >
            {sending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Dispatching Alert...</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>Send Broadcast Now</span>
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
