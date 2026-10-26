"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { 
  ArrowLeft, CheckCircle2, XCircle, MapPin, User, 
  Clock, Phone, AlertCircle, ShieldAlert 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { 
  getSubmissionByIdAction, 
  approveSubmissionAction, 
  rejectSubmissionAction 
} from "@/actions/submission-actions";
import { WaterSubmission } from "@/types/submission";
import { CATEGORY_LABELS, AVAILABILITY_STATUS_LABELS } from "@/lib/utils/constants";
import { formatDate } from "@/lib/utils/date-utils";
import { getDirectionsUrl } from "@/lib/map/map-utils";

export default function AdminSubmissionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const submissionId = params?.submissionId as string;

  const [submission, setSubmission] = useState<WaterSubmission | null>(null);
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [showRejectBox, setShowRejectBox] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      if (!submissionId) return;
      try {
        const data = await getSubmissionByIdAction(submissionId);
        setSubmission(data);
      } catch (err) {
        console.error("Failed to load submission", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [submissionId]);

  const handleApprove = async () => {
    if (!confirm("Approve and publish this water resource immediately? It will appear on the public map.")) {
      return;
    }
    setIsProcessing(true);
    setError(null);
    try {
      const res = await approveSubmissionAction(submissionId);
      alert("Submission approved and published successfully!");
      if (res.publishedSourceId) {
        router.push(`/admin/water-sources/${res.publishedSourceId}`);
      } else {
        router.push("/admin/submissions");
      }
    } catch (err) {
      setError((err as Error).message || "Approval failed");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      alert("Please provide a reason for rejection.");
      return;
    }
    setIsProcessing(true);
    setError(null);
    try {
      await rejectSubmissionAction(submissionId, rejectionReason);
      alert("Submission rejected.");
      router.push("/admin/submissions");
    } catch (err) {
      setError((err as Error).message || "Rejection failed");
    } finally {
      setIsProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center text-muted-foreground animate-pulse">
        Loading submission details...
      </div>
    );
  }

  if (!submission) {
    return (
      <div className="p-8 text-center space-y-4">
        <h2 className="text-xl font-bold">Submission Not Found</h2>
        <Button asChild variant="outline">
          <Link href="/admin/submissions">Back to Submissions</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button asChild variant="ghost" size="icon">
            <Link href="/admin/submissions">
              <ArrowLeft className="w-5 h-5" />
            </Link>
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight text-foreground">{submission.name}</h1>
              <Badge 
                variant={
                  submission.status === "pending" 
                    ? "destructive" 
                    : submission.status === "approved" 
                    ? "default" 
                    : "secondary"
                }
                className="capitalize"
              >
                {submission.status}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">Submission ID: {submission.id}</p>
          </div>
        </div>

        <Button asChild variant="outline">
          <a
            href={getDirectionsUrl(submission.latitude, submission.longitude)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 self-start"
          >
            <MapPin className="w-4 h-4" />
            Preview Map Coordinates
          </a>
        </Button>
      </div>

      {error && (
        <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
          {error}
        </div>
      )}

      {submission.status === "rejected" && submission.rejection_reason && (
        <Card className="p-4 bg-muted/60 border-destructive/20 space-y-1">
          <span className="text-xs font-semibold text-destructive uppercase tracking-wider block">
            Rejection Reason
          </span>
          <p className="text-sm text-muted-foreground">{submission.rejection_reason}</p>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <Card className="p-6 space-y-4">
            <h2 className="text-lg font-semibold">Submitted Information</h2>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">
              {submission.description || "No description provided."}
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-4 border-t border-border">
              <div>
                <span className="text-xs text-muted-foreground block">Category</span>
                <span className="text-sm font-medium">{CATEGORY_LABELS[submission.category] || submission.category}</span>
              </div>
              <div>
                <span className="text-xs text-muted-foreground block">Reported Availability</span>
                <span className="text-sm font-medium">{AVAILABILITY_STATUS_LABELS[submission.availability_status]}</span>
              </div>
              <div>
                <span className="text-xs text-muted-foreground block">Barangay</span>
                <span className="text-sm font-medium">{submission.barangay || "Irosin"}</span>
              </div>
            </div>
          </Card>

          <Card className="p-6 space-y-4">
            <h2 className="text-lg font-semibold">Location & Contact</h2>
            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium">{submission.address || "No specific address provided"}</p>
                  <p className="text-xs text-muted-foreground font-mono mt-0.5">
                    Coordinates: {submission.latitude.toFixed(6)}, {submission.longitude.toFixed(6)}
                  </p>
                </div>
              </div>

              {submission.operating_hours && (
                <div className="flex items-center gap-2.5">
                  <Clock className="w-4 h-4 text-primary shrink-0" />
                  <span>Hours: {submission.operating_hours}</span>
                </div>
              )}

              {submission.contact_information && (
                <div className="flex items-center gap-2.5">
                  <Phone className="w-4 h-4 text-primary shrink-0" />
                  <span>Contact: {submission.contact_information}</span>
                </div>
              )}
            </div>
          </Card>

          {submission.photos && submission.photos.length > 0 && (
            <Card className="p-6 space-y-4">
              <h2 className="text-lg font-semibold">Submitted Photos ({submission.photos.length})</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {submission.photos.map((photo: any) => (
                  <div key={photo.id} className="relative aspect-video rounded-lg overflow-hidden border border-border bg-muted">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={photo.storage_path} alt="Submitted photo" className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          <Card className="p-6 space-y-4">
            <h2 className="text-lg font-semibold">Submitter Profile</h2>
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-primary" />
                <span className="font-medium text-foreground">{submission.submitter_name}</span>
              </div>
              <div className="text-xs text-muted-foreground">
                <span className="block">Visitor ID:</span>
                <span className="font-mono text-[11px] truncate block">{submission.visitor_id}</span>
              </div>
              <div className="text-xs text-muted-foreground">
                <span className="block">Submitted At:</span>
                <span className="font-medium text-foreground">{formatDate(submission.created_at)}</span>
              </div>
            </div>
          </Card>

          {submission.status === "pending" && (
            <Card className="p-6 space-y-4 border-primary/20">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-primary" /> Moderation Action
              </h2>
              <p className="text-xs text-muted-foreground">
                Approving this submission will convert it into an official water resource, publish it to the public map, and link it to a dedicated group chat.
              </p>

              {!showRejectBox ? (
                <div className="space-y-2">
                  <Button
                    onClick={handleApprove}
                    disabled={isProcessing}
                    className="w-full flex items-center justify-center gap-2"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    {isProcessing ? "Approving..." : "Approve & Publish"}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setShowRejectBox(true)}
                    disabled={isProcessing}
                    className="w-full text-destructive hover:bg-destructive/10"
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    Reject Submission
                  </Button>
                </div>
              ) : (
                <div className="space-y-3 pt-2">
                  <label className="text-xs font-medium block">Reason for Rejection *</label>
                  <Textarea
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder="e.g. Duplicate entry, invalid location coordinates, or incomplete information."
                    rows={3}
                  />
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setShowRejectBox(false)}
                      disabled={isProcessing}
                      className="w-1/2"
                    >
                      Cancel
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={handleReject}
                      disabled={isProcessing}
                      className="w-1/2"
                    >
                      Confirm Reject
                    </Button>
                  </div>
                </div>
              )}
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
