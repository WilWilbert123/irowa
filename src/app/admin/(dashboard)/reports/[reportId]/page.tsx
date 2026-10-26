"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { 
  ArrowLeft, AlertTriangle, CheckCircle2, Clock, 
  MapPin, Shield, ExternalLink, HelpCircle 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getReportByIdAction, updateReportStatusAction } from "@/actions/report-actions";
import { WaterReport, ReportStatus } from "@/types/report";
import { REPORT_TYPE_LABELS } from "@/lib/utils/constants";
import { formatDate } from "@/lib/utils/date-utils";

export default function AdminReportDetailPage() {
  const params = useParams();
  const router = useRouter();
  const reportId = params?.reportId as string;

  const [report, setReport] = useState<WaterReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    async function loadData() {
      if (!reportId) return;
      try {
        const data = await getReportByIdAction(reportId);
        setReport(data);
      } catch (err) {
        console.error("Failed to load report", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [reportId]);

  const handleUpdateStatus = async (status: "investigating" | "resolved" | "dismissed") => {
    setUpdating(true);
    try {
      await updateReportStatusAction(reportId, status);
      setReport((prev: any) => (prev ? { ...prev, status } : null));
      alert(`Report marked as ${status}`);
    } catch (err) {
      alert("Failed to update status: " + (err as Error).message);
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center text-muted-foreground animate-pulse">
        Loading report details...
      </div>
    );
  }

  if (!report) {
    return (
      <div className="p-8 text-center space-y-4">
        <h2 className="text-xl font-bold">Report Not Found</h2>
        <Button asChild variant="outline">
          <Link href="/admin/reports">Back to Reports</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button asChild variant="ghost" size="icon">
            <Link href="/admin/reports">
              <ArrowLeft className="w-5 h-5" />
            </Link>
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight text-foreground">
                Report #{report.id.slice(0, 8)}
              </h1>
              <Badge 
                variant={
                  report.status === "pending" 
                    ? "destructive" 
                    : report.status === "resolved" 
                    ? "default" 
                    : "secondary"
                }
                className="capitalize"
              >
                {report.status}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              Type: {REPORT_TYPE_LABELS[report.report_type] || report.report_type}
            </p>
          </div>
        </div>

        {report.water_source && (
          <Button asChild variant="outline">
            <Link href={`/admin/water-sources/${report.water_source_id}`} className="flex items-center gap-1.5">
              <ExternalLink className="w-4 h-4" />
              Manage Water Source
            </Link>
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <Card className="p-6 space-y-4">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-500" /> Community Report Details
            </h2>
            <div className="p-4 bg-muted/60 rounded-lg border border-border text-sm leading-relaxed whitespace-pre-wrap">
              {report.description}
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border text-xs text-muted-foreground">
              <div>
                <span className="block font-medium text-foreground">Logged At:</span>
                <span>{formatDate(report.created_at)}</span>
              </div>
              <div>
                <span className="block font-medium text-foreground">Visitor Token:</span>
                <span className="font-mono">{report.visitor_id.slice(0, 12)}...</span>
              </div>
            </div>
          </Card>

          {report.water_source && (
            <Card className="p-6 space-y-4">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <MapPin className="w-5 h-5 text-primary" /> Affected Water Resource
              </h2>
              <div className="space-y-2 text-sm">
                <p className="font-medium text-foreground text-base">{report.water_source.name}</p>
                <p className="text-muted-foreground">
                  Location: {report.water_source.barangay || "Irosin"}, Sorsogon
                </p>
                <p className="text-xs text-muted-foreground font-mono">
                  Coordinates: {report.water_source.latitude?.toFixed(6) ?? "—"}, {report.water_source.longitude?.toFixed(6) ?? "—"}
                </p>
              </div>

              <div className="pt-2 flex items-center gap-2">
                <Button asChild size="sm" variant="outline">
                  <Link href={`/water/${report.water_source_id}`} target="_blank">
                    Open Public Listing
                  </Link>
                </Button>
                <Button asChild size="sm" variant="outline">
                  <Link href={`/admin/water-sources/${report.water_source_id}/edit`}>
                    Edit Status / Coordinates
                  </Link>
                </Button>
              </div>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          <Card className="p-6 space-y-4">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary" /> Resolution Actions
            </h2>
            <p className="text-xs text-muted-foreground">
              Mark this report after field verification or updating the water pin status.
            </p>

            <div className="space-y-2">
              <Button
                variant={report.status === "investigating" ? "default" : "outline"}
                className="w-full justify-start gap-2"
                onClick={() => handleUpdateStatus("investigating")}
                disabled={updating}
              >
                <Clock className="w-4 h-4 text-amber-500" />
                Mark as Investigating
              </Button>
              <Button
                variant={report.status === "resolved" ? "default" : "outline"}
                className="w-full justify-start gap-2"
                onClick={() => handleUpdateStatus("resolved")}
                disabled={updating}
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                Mark as Resolved
              </Button>
              <Button
                variant={report.status === "dismissed" ? "default" : "outline"}
                className="w-full justify-start gap-2"
                onClick={() => handleUpdateStatus("dismissed")}
                disabled={updating}
              >
                <HelpCircle className="w-4 h-4 text-muted-foreground" />
                Dismiss Report
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
