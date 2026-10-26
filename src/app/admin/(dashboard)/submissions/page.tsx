"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { 
  Inbox, CheckCircle2, XCircle, Clock, Eye, 
  MapPin, User, Search, RefreshCw 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { getAllSubmissionsAction } from "@/actions/submission-actions";
import { WaterSubmission } from "@/types/submission";
import { CATEGORY_LABELS } from "@/lib/utils/constants";
import { formatDate } from "@/lib/utils/date-utils";

export default function AdminSubmissionsPage() {
  const [submissions, setSubmissions] = useState<WaterSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [search, setSearch] = useState("");

  const loadSubmissions = async () => {
    setLoading(true);
    try {
      const data = await getAllSubmissionsAction();
      setSubmissions(data);
    } catch (err) {
      console.error("Failed to load submissions", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSubmissions();
  }, []);

  const filtered = submissions.filter((sub) => {
    const matchesStatus = filterStatus === "all" || sub.status === filterStatus;
    const matchesSearch = 
      sub.name.toLowerCase().includes(search.toLowerCase()) ||
      sub.submitter_name.toLowerCase().includes(search.toLowerCase()) ||
      (sub.barangay && sub.barangay.toLowerCase().includes(search.toLowerCase()));
    return matchesStatus && matchesSearch;
  });

  const pendingCount = submissions.filter((s) => s.status === "pending").length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Community Submissions</h1>
            {pendingCount > 0 && (
              <Badge variant="destructive" className="animate-pulse">
                {pendingCount} Pending
              </Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground">
            Review proposed water sources submitted by residents and visitors before publishing
          </p>
        </div>

        <Button variant="outline" onClick={loadSubmissions} className="flex items-center gap-2 self-start">
          <RefreshCw className="w-4 h-4" />
          Refresh Queue
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by resource, submitter, or barangay..."
            className="pl-9"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          {["all", "pending", "approved", "rejected"].map((st) => (
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
          Loading submission queue...
        </div>
      ) : filtered.length === 0 ? (
        <Card className="p-12 text-center space-y-3">
          <Inbox className="w-12 h-12 mx-auto text-muted-foreground opacity-50" />
          <h3 className="text-lg font-medium">No Submissions Found</h3>
          <p className="text-sm text-muted-foreground max-w-sm mx-auto">
            {search || filterStatus !== "all" 
              ? "No submissions match your current filter settings." 
              : "No community submissions have been received yet."}
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((sub) => (
            <Card key={sub.id} className="p-5 flex flex-col justify-between hover:shadow-md transition-shadow">
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-semibold text-foreground line-clamp-1">{sub.name}</h3>
                  <Badge 
                    variant={
                      sub.status === "pending" 
                        ? "destructive" 
                        : sub.status === "approved" 
                        ? "default" 
                        : "secondary"
                    }
                    className="capitalize shrink-0"
                  >
                    {sub.status === "pending" && <Clock className="w-3 h-3 mr-1 inline" />}
                    {sub.status === "approved" && <CheckCircle2 className="w-3 h-3 mr-1 inline" />}
                    {sub.status === "rejected" && <XCircle className="w-3 h-3 mr-1 inline" />}
                    {sub.status}
                  </Badge>
                </div>

                <p className="text-xs text-muted-foreground line-clamp-2">
                  {sub.description || "No description provided."}
                </p>

                <div className="space-y-1.5 text-xs text-muted-foreground pt-2 border-t border-border">
                  <div className="flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-primary" />
                    <span>Submitted by: <strong className="text-foreground">{sub.submitter_name}</strong></span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-primary" />
                    <span>{sub.barangay || "Irosin"}, Sorsogon</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-medium text-foreground">Category:</span>
                    <span>{CATEGORY_LABELS[sub.category] || sub.category}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-muted-foreground">Date:</span>
                    <span>{formatDate(sub.created_at)}</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 mt-3 border-t border-border flex items-center justify-between">
                <Button asChild size="sm" variant="default" className="w-full">
                  <Link href={`/admin/submissions/${sub.id}`} className="flex items-center justify-center gap-1.5">
                    <Eye className="w-3.5 h-3.5" />
                    Review Submission
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
