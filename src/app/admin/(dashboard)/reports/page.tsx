"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { 
  AlertTriangle, CheckCircle2, Clock, Search, 
  Eye, RefreshCw, MapPin, User 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { getAllReportsAction } from "@/actions/report-actions";
import { WaterReport } from "@/types/report";
import { REPORT_TYPE_LABELS } from "@/lib/utils/constants";
import { formatDate } from "@/lib/utils/date-utils";

export default function AdminReportsPage() {
  const [reports, setReports] = useState<WaterReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [search, setSearch] = useState("");

  const loadReports = async () => {
    setLoading(true);
    try {
      const data = await getAllReportsAction();
      setReports(data);
    } catch (err) {
      console.error("Failed to load reports", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReports();
  }, []);

  const filtered = reports.filter((rep) => {
    const matchesStatus = filterStatus === "all" || rep.status === filterStatus;
    const matchesSearch = 
      (rep.water_source?.name && rep.water_source.name.toLowerCase().includes(search.toLowerCase())) ||
      rep.description.toLowerCase().includes(search.toLowerCase()) ||
      (rep.visitor_id && rep.visitor_id.toLowerCase().includes(search.toLowerCase()));
    return matchesStatus && matchesSearch;
  });

  const pendingCount = reports.filter((r) => r.status === "pending").length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Community Reports</h1>
            {pendingCount > 0 && (
              <Badge variant="destructive" className="animate-pulse">
                {pendingCount} Pending Review
              </Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground">
            Investigate reported inaccuracies, dried-up sources, or safety hazards
          </p>
        </div>

        <Button variant="outline" onClick={loadReports} className="flex items-center gap-2 self-start">
          <RefreshCw className="w-4 h-4" />
          Refresh
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search reports by water source or keyword..."
            className="pl-9"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          {["all", "pending", "investigating", "resolved", "dismissed"].map((st) => (
            <Button
              key={st}
              variant={filterStatus === st ? "default" : "outline"}
              size="sm"
              onClick={() => setFilterStatus(st)}
              className="capitalize whitespace-nowrap"
            >
              {st}
            </Button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="p-12 text-center text-muted-foreground animate-pulse">
          Loading reports...
        </div>
      ) : filtered.length === 0 ? (
        <Card className="p-12 text-center space-y-3">
          <CheckCircle2 className="w-12 h-12 mx-auto text-emerald-500 opacity-70" />
          <h3 className="text-lg font-medium">No Reports Found</h3>
          <p className="text-sm text-muted-foreground max-w-sm mx-auto">
            {search || filterStatus !== "all" 
              ? "No reports match your current filter settings." 
              : "No community reports are currently logged."}
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((rep) => (
            <Card key={rep.id} className="p-5 flex flex-col justify-between hover:shadow-md transition-shadow">
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
                    <span className="font-semibold text-sm line-clamp-1">
                      {REPORT_TYPE_LABELS[rep.report_type] || rep.report_type}
                    </span>
                  </div>
                  <Badge 
                    variant={
                      rep.status === "pending" 
                        ? "destructive" 
                        : rep.status === "resolved" 
                        ? "default" 
                        : "secondary"
                    }
                    className="capitalize shrink-0 text-[11px]"
                  >
                    {rep.status === "pending" && <Clock className="w-3 h-3 mr-1 inline" />}
                    {rep.status}
                  </Badge>
                </div>

                <div className="text-xs text-muted-foreground">
                  <span className="block font-medium text-foreground">
                    Target: {rep.water_source?.name || "Water Source #" + rep.water_source_id.slice(0, 8)}
                  </span>
                  {rep.water_source?.barangay && (
                    <span className="flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3" /> {rep.water_source.barangay}, Irosin
                    </span>
                  )}
                </div>

                <div className="p-2.5 rounded bg-muted/60 text-xs text-foreground line-clamp-3">
                  &ldquo;{rep.description}&rdquo;
                </div>

                <div className="space-y-1 text-xs text-muted-foreground pt-2 border-t border-border">
                  <div className="flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5" />
                    <span>Visitor ID: <span className="font-mono">{rep.visitor_id.slice(0, 8)}...</span></span>
                  </div>
                  <div>Reported: {formatDate(rep.created_at)}</div>
                </div>
              </div>

              <div className="pt-4 mt-3 border-t border-border">
                <Button asChild size="sm" variant="outline" className="w-full">
                  <Link href={`/admin/reports/${rep.id}`} className="flex items-center justify-center gap-1.5">
                    <Eye className="w-3.5 h-3.5" />
                    Review Report
                  </Link>
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
