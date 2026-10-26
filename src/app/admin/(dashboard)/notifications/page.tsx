"use client";

import React, { useState } from "react";
import { Bell, Send, CheckCircle2, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { sendBroadcastNotificationAction } from "@/actions/notification-actions";

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
        title,
        body,
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
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Notification Dispatcher</h1>
        <p className="text-sm text-muted-foreground">
          Broadcast real-time in-app alerts and web push notifications to all users of IroWa
        </p>
      </div>

      {success && (
        <div className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 text-sm flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          Notification successfully dispatched to active users and push subscribers!
        </div>
      )}

      {error && (
        <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm flex items-center gap-2">
          <ShieldAlert className="w-5 h-5 shrink-0" />
          {error}
        </div>
      )}

      <form onSubmit={handleSend} className="space-y-6">
        <Card className="p-6 space-y-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Bell className="w-5 h-5 text-primary" /> Broadcast Message
          </h2>

          <div>
            <label className="text-sm font-medium block mb-1">Notification Title *</label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Clean Spring Source Reopened"
              required
            />
          </div>

          <div>
            <label className="text-sm font-medium block mb-1">Message Body *</label>
            <Textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={4}
              placeholder="Enter message text that will appear in user notification centers and push trays..."
              required
            />
          </div>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" disabled={sending} className="flex items-center gap-2">
            <Send className="w-4 h-4" />
            {sending ? "Dispatching..." : "Send Broadcast Now"}
          </Button>
        </div>
      </form>
    </div>
  );
}
