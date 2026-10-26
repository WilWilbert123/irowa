"use client";

import React, { useState } from "react";
import { Users, ShieldAlert, ShieldCheck, Clock, UserX, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { formatDate } from "@/lib/utils/date-utils";

interface MockSession {
  id: string;
  visitor_id: string;
  display_name: string;
  is_restricted: boolean;
  restriction_reason?: string;
  restricted_until?: string;
  created_at: string;
  last_seen_at: string;
}

const INITIAL_SESSIONS: MockSession[] = [
  {
    id: "sess-1",
    visitor_id: "vis_8f9a2b1c",
    display_name: "Maria Santos",
    is_restricted: false,
    created_at: new Date(Date.now() - 3600000 * 48).toISOString(),
    last_seen_at: new Date(Date.now() - 60000 * 5).toISOString(),
  },
  {
    id: "sess-2",
    visitor_id: "vis_1a2b3c4d",
    display_name: "Rizal Dela Cruz",
    is_restricted: false,
    created_at: new Date(Date.now() - 3600000 * 24).toISOString(),
    last_seen_at: new Date(Date.now() - 60000 * 12).toISOString(),
  },
  {
    id: "sess-3",
    visitor_id: "vis_99x88y77",
    display_name: "SpamBot_99",
    is_restricted: true,
    restriction_reason: "Automated spam message burst in San Mateo Springs chat",
    restricted_until: new Date(Date.now() + 3600000 * 72).toISOString(),
    created_at: new Date(Date.now() - 3600000 * 6).toISOString(),
    last_seen_at: new Date(Date.now() - 3600000 * 1).toISOString(),
  },
];

export default function AdminUsersModerationPage() {
  const [sessions, setSessions] = useState<MockSession[]>(INITIAL_SESSIONS);
  const [search, setSearch] = useState("");

  const handleToggleRestriction = (visitorId: string) => {
    setSessions((prev) =>
      prev.map((s) => {
        if (s.visitor_id === visitorId) {
          const nextRestricted = !s.is_restricted;
          return {
            ...s,
            is_restricted: nextRestricted,
            restriction_reason: nextRestricted ? "Manual administrator restriction" : undefined,
            restricted_until: nextRestricted
              ? new Date(Date.now() + 3600000 * 24).toISOString()
              : undefined,
          };
        }
        return s;
      })
    );
  };

  const filtered = sessions.filter(
    (s) =>
      s.display_name.toLowerCase().includes(search.toLowerCase()) ||
      s.visitor_id.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Visitor Sessions & Moderation</h1>
        <p className="text-sm text-muted-foreground">
          View anonymous visitor identifiers, active display names, and apply temporary restrictions for abuse prevention
        </p>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by display name or visitor ID..."
          className="pl-9 max-w-md"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((sess) => (
          <Card key={sess.id} className="p-5 flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-xs">
                    {sess.display_name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm text-foreground">{sess.display_name}</h3>
                    <span className="text-[11px] font-mono text-muted-foreground block">
                      {sess.visitor_id}
                    </span>
                  </div>
                </div>

                <Badge variant={sess.is_restricted ? "destructive" : "default"} className="text-[10px] capitalize">
                  {sess.is_restricted ? "Restricted" : "Active"}
                </Badge>
              </div>

              {sess.is_restricted && (
                <div className="p-2.5 rounded bg-destructive/10 border border-destructive/20 text-xs text-destructive space-y-1">
                  <div className="font-semibold flex items-center gap-1">
                    <ShieldAlert className="w-3.5 h-3.5" /> Restriction Active
                  </div>
                  <p>{sess.restriction_reason}</p>
                  {sess.restricted_until && (
                    <p className="text-[10px] opacity-80">
                      Until: {formatDate(sess.restricted_until)}
                    </p>
                  )}
                </div>
              )}

              <div className="text-xs text-muted-foreground space-y-1 pt-2 border-t border-border">
                <div className="flex items-center justify-between">
                  <span>First seen:</span>
                  <span>{formatDate(sess.created_at)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Last active:</span>
                  <span>{formatDate(sess.last_seen_at)}</span>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-border">
              <Button
                size="sm"
                variant={sess.is_restricted ? "outline" : "destructive"}
                onClick={() => handleToggleRestriction(sess.visitor_id)}
                className="w-full text-xs flex items-center justify-center gap-1.5"
              >
                {sess.is_restricted ? (
                  <>
                    <ShieldCheck className="w-3.5 h-3.5" /> Lift Restriction
                  </>
                ) : (
                  <>
                    <UserX className="w-3.5 h-3.5" /> Restrict Session (24h)
                  </>
                )}
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
