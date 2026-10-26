"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Bell, AlertTriangle, ShieldCheck, Calendar, Megaphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getActiveAnnouncementsAction } from "@/actions/notification-actions";
import { Announcement } from "@/types/notification";
import { formatDate } from "@/lib/utils/date-utils";

export default function AdminAnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const data = await getActiveAnnouncementsAction();
        setAnnouncements(data);
      } catch (err) {
        console.error("Failed to load announcements", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Official Advisories & Announcements</h1>
          <p className="text-sm text-muted-foreground">
            Publish municipal water advisories, emergency alerts, and maintenance updates to all residents
          </p>
        </div>

        <Button asChild className="flex items-center gap-2 self-start">
          <Link href="/admin/announcements/new">
            <Plus className="w-4 h-4" />
            New Announcement
          </Link>
        </Button>
      </div>

      {loading ? (
        <div className="p-12 text-center text-muted-foreground animate-pulse">
          Loading announcements...
        </div>
      ) : announcements.length === 0 ? (
        <Card className="p-12 text-center space-y-3">
          <Megaphone className="w-12 h-12 mx-auto text-muted-foreground opacity-50" />
          <h3 className="text-lg font-medium">No Announcements Published</h3>
          <p className="text-sm text-muted-foreground max-w-sm mx-auto">
            You can broadcast emergency notices or scheduled maintenance advisories that will appear across all public pages.
          </p>
          <Button asChild size="sm" variant="outline" className="mt-2">
            <Link href="/admin/announcements/new">Create First Announcement</Link>
          </Button>
        </Card>
      ) : (
        <div className="space-y-4">
          {announcements.map((ann) => (
            <Card key={ann.id} className="p-5 space-y-3 hover:shadow-sm transition-shadow">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  {ann.priority === "urgent" ? (
                    <AlertTriangle className="w-5 h-5 text-destructive shrink-0" />
                  ) : ann.priority === "high" ? (
                    <Bell className="w-5 h-5 text-amber-500 shrink-0" />
                  ) : (
                    <Megaphone className="w-5 h-5 text-primary shrink-0" />
                  )}
                  <h3 className="font-semibold text-foreground text-base">{ann.title}</h3>
                </div>

                <div className="flex items-center gap-2">
                  <Badge 
                    variant={
                      ann.priority === "urgent" 
                        ? "destructive" 
                        : ann.priority === "high" 
                        ? "default" 
                        : "secondary"
                    }
                    className="capitalize text-[11px]"
                  >
                    Priority: {ann.priority}
                  </Badge>
                  <Badge variant={ann.status === "published" ? "default" : "outline"} className="capitalize text-[11px]">
                    {ann.status}
                  </Badge>
                </div>
              </div>

              <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                {ann.body}
              </p>

              <div className="flex flex-wrap items-center gap-4 pt-3 border-t border-border text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" /> Published: {formatDate(ann.created_at)}
                </span>
                {ann.expires_at && (
                  <span>Expires: {formatDate(ann.expires_at)}</span>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
