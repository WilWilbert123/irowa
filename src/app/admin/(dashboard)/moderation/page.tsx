"use client";

import React from "react";
import Link from "next/link";
import { ShieldCheck, MessageSquare, AlertTriangle, FileText, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function AdminContentModerationHubPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Content Moderation Center</h1>
        <p className="text-sm text-muted-foreground">
          Centralized review for community safety, submissions, chat filtering, and community reports
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6 space-y-4 hover:border-primary/50 transition-colors">
          <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center text-primary">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-foreground">Water Submissions</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Verify submitted geographic coordinates, photos, and availability claims from the community before publication.
            </p>
          </div>
          <Button asChild className="w-full" variant="outline">
            <Link href="/admin/submissions" className="flex items-center justify-between">
              <span>Review Submissions Queue</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </Button>
        </Card>

        <Card className="p-6 space-y-4 hover:border-primary/50 transition-colors">
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-foreground">Community Reports</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Investigate reports of dried springs, broken pumps, contaminated water, or inaccurate pins on the map.
            </p>
          </div>
          <Button asChild className="w-full" variant="outline">
            <Link href="/admin/reports" className="flex items-center justify-between">
              <span>Investigate Reports</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </Button>
        </Card>

        <Card className="p-6 space-y-4 hover:border-primary/50 transition-colors">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
            <MessageSquare className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-foreground">Chat Moderation</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Hide or permanently delete abusive, hateful, or spam messages across all water source discussion rooms.
            </p>
          </div>
          <Button asChild className="w-full" variant="outline">
            <Link href="/admin/chat" className="flex items-center justify-between">
              <span>Moderate Discussions</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </Button>
        </Card>
      </div>

      <Card className="p-6 space-y-3 bg-muted/40 border-border">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-primary" />
          <h3 className="font-semibold text-base">Civic Safety & Verification Policy</h3>
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed">
          IroWa operates as a vital emergency resource for the municipality of Irosin. Water availability
          and potability must be treated as distinct concepts. Water sources must never be labeled as potable
          or safe to drink without explicit municipal or sanitary authority verification.
        </p>
      </Card>
    </div>
  );
}
