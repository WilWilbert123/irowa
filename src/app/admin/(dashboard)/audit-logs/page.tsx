"use client";

import React, { useEffect, useState } from "react";
import { History, Shield, Calendar, Search, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { getAuditLogs } from "@/lib/services/audit-service";
import { AuditLogRow } from "@/types/admin";
import { formatDate } from "@/lib/utils/date-utils";

export default function AdminAuditLogsPage() {
  const [logs, setLogs] = useState<AuditLogRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const loadLogs = async () => {
    setLoading(true);
    try {
      const data = await getAuditLogs();
      setLogs(data);
    } catch (err) {
      console.error("Failed to load audit logs", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, []);

  const filtered = logs.filter(
    (l) =>
      l.action.toLowerCase().includes(search.toLowerCase()) ||
      l.entity_type.toLowerCase().includes(search.toLowerCase()) ||
      (l.entity_id && l.entity_id.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Audit Log History</h1>
          <p className="text-sm text-muted-foreground">
            Immutable record of all administrative actions, water source mutations, and moderation events
          </p>
        </div>

        <Button variant="outline" onClick={loadLogs} className="flex items-center gap-2 self-start">
          <RefreshCw className="w-4 h-4" />
          Refresh
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Filter by action, entity type, or record ID..."
          className="pl-9 max-w-md"
        />
      </div>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-muted/50 text-muted-foreground border-b border-border text-xs uppercase font-medium">
              <tr>
                <th className="px-4 py-3">Timestamp</th>
                <th className="px-4 py-3">Action</th>
                <th className="px-4 py-3">Entity Type</th>
                <th className="px-4 py-3">Entity ID</th>
                <th className="px-4 py-3">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground animate-pulse">
                    Loading audit trail...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                    No audit records matching your search.
                  </td>
                </tr>
              ) : (
                filtered.map((log) => (
                  <tr key={log.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">
                      {formatDate(log.created_at)}
                    </td>
                    <td className="px-4 py-3 font-semibold text-xs">
                      <Badge variant="outline" className="font-mono">
                        {log.action}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-xs font-medium text-foreground">
                      {log.entity_type}
                    </td>
                    <td className="px-4 py-3 text-xs font-mono text-muted-foreground truncate max-w-[120px]">
                      {log.entity_id || "—"}
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground max-w-xs truncate">
                      {log.details ? JSON.stringify(log.details) : "—"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
