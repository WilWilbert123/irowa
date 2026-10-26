"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Megaphone, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { createAnnouncementAction } from "@/actions/notification-actions";
import { AnnouncementPriority } from "@/types/notification";

export default function NewAnnouncementPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [priority, setPriority] = useState<AnnouncementPriority>("normal");
  const [expiresAt, setExpiresAt] = useState("");
  const [broadcastPush, setBroadcastPush] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !body.trim()) {
      setError("Title and announcement body are required.");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      await createAnnouncementAction({
        title,
        body,
        priority,
        expires_at: expiresAt ? new Date(expiresAt).toISOString() : undefined,
      });

      router.push("/admin/announcements");
    } catch (err) {
      setError((err as Error).message || "Failed to create announcement");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Button asChild variant="ghost" size="icon">
          <Link href="/admin/announcements">
            <ArrowLeft className="w-5 h-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Create Advisory / Announcement</h1>
          <p className="text-sm text-muted-foreground">Broadcast an alert or advisory to all users of IroWa</p>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card className="p-6 space-y-4">
          <div>
            <label className="text-sm font-medium block mb-1">Title *</label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Low Water Pressure Advisory in San Julian"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium block mb-1">Priority Level</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as AnnouncementPriority)}
                className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
              >
                <option value="normal">Normal (Information)</option>
                <option value="high">High (Advisory)</option>
                <option value="urgent">Urgent (Emergency / Boil Water Alert)</option>
              </select>
            </div>

            <div>
              <label className="text-sm font-medium block mb-1">Expiration Date (Optional)</label>
              <Input
                type="date"
                value={expiresAt}
                onChange={(e) => setExpiresAt(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium block mb-1">Announcement Body *</label>
            <Textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={5}
              placeholder="Provide detailed instructions, affected barangays, alternative water stations, or estimated restoration times..."
              required
            />
          </div>

          <div className="pt-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={broadcastPush}
                onChange={(e) => setBroadcastPush(e.target.checked)}
                className="rounded border-input text-primary focus:ring-primary w-4 h-4"
              />
              <span className="text-sm font-medium">
                Send push notification to all subscribed devices
              </span>
            </label>
          </div>
        </Card>

        <div className="flex justify-end gap-3">
          <Button asChild variant="outline">
            <Link href="/admin/announcements">Cancel</Link>
          </Button>
          <Button type="submit" disabled={submitting} className="flex items-center gap-2">
            <Send className="w-4 h-4" />
            {submitting ? "Broadcasting..." : "Publish Announcement"}
          </Button>
        </div>
      </form>
    </div>
  );
}
