"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { useParams, useRouter } from "next/navigation";
import { 
  ArrowLeft, CheckCircle2, XCircle, MapPin, User, 
  Clock, Phone, AlertCircle, ShieldAlert, Image as ImageIcon,
  Maximize2, ExternalLink, X, ChevronLeft, ChevronRight
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

const LocationPickerMap = dynamic(
  () => import("@/components/map/location-picker-map"),
  {
    ssr: false,
    loading: () => (
      <div className="h-[280px] w-full rounded-2xl bg-muted animate-pulse flex flex-col items-center justify-center gap-2 border border-border">
        <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
        <span className="text-xs font-semibold text-muted-foreground">Loading interactive map...</span>
      </div>
    ),
  }
);

function resolvePhotoUrl(storagePath: string): string {
  if (!storagePath) return "/images/irosin-map-placeholder.svg";
  if (
    storagePath.startsWith("http://") || 
    storagePath.startsWith("https://") || 
    storagePath.startsWith("/") ||
    storagePath.startsWith("data:") ||
    storagePath.startsWith("blob:")
  ) {
    return storagePath;
  }
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (supabaseUrl) {
    const bucket = storagePath.startsWith("sub-") ? "submission-photos" : "water-photos";
    return `${supabaseUrl}/storage/v1/object/public/${bucket}/${storagePath}`;
  }
  return storagePath;
}

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
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState<number | null>(null);

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

  // Keyboard navigation for image lightbox
  useEffect(() => {
    if (selectedPhotoIndex === null || !submission?.photos?.length) return;
    const total = submission.photos.length;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setSelectedPhotoIndex(null);
      } else if (e.key === "ArrowLeft") {
        setSelectedPhotoIndex((prev) => (prev === 0 ? total - 1 : (prev ?? 0) - 1));
      } else if (e.key === "ArrowRight") {
        setSelectedPhotoIndex((prev) => (prev === total - 1 ? 0 : (prev ?? 0) + 1));
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedPhotoIndex, submission]);

  const handleApprove = async () => {
    if (!confirm("Approve and publish this water resource immediately? It will appear on the public map.")) {
      return;
    }
    setIsProcessing(true);
    setError(null);
    try {
      const res = await approveSubmissionAction(submissionId);
      if (res.success) {
        if (res.publishedSourceId) {
          router.push(`/admin/water-sources/${res.publishedSourceId}`);
        } else {
          router.push("/admin/submissions");
        }
      } else {
        setError(res.error || "Approval failed");
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
      const res = await rejectSubmissionAction(submissionId, rejectionReason);
      if (res.success) {
        router.push("/admin/submissions");
      } else {
        setError(res.error || "Rejection failed");
      }
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
            Google Maps Directions
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

          {/* Interactive Leaflet Map & Location Card */}
          <Card className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-primary" />
                  <span>Geographic Pin & Location</span>
                </h2>
                <p className="text-xs text-muted-foreground">
                  Exact coordinates submitted by citizen contributor. Switch layers to inspect satellite terrain.
                </p>
              </div>
              <Badge variant="outline" className="font-mono text-xs">
                {submission.latitude.toFixed(6)}, {submission.longitude.toFixed(6)}
              </Badge>
            </div>

            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium">{submission.address || "No specific address provided"}</p>
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

            {/* Interactive Leaflet Map (ReadOnly Mode with Zoom and Layer Switcher) */}
            <div className="rounded-2xl overflow-hidden border border-border shadow-xs mt-2">
              <LocationPickerMap
                latitude={submission.latitude}
                longitude={submission.longitude}
                markerIconId={submission.custom_icon?.iconId}
                markerColor={submission.custom_icon?.color}
                readOnly={true}
                defaultLayer="satellite"
                className="h-[300px] w-full"
              />
            </div>
          </Card>

          {/* Submitted Photos Inspection Gallery */}
          <Card className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-primary" />
                <h2 className="text-lg font-semibold">Submitted Photos</h2>
                <Badge variant="secondary" className="text-xs">
                  {submission.photos?.length || 0} / 6
                </Badge>
              </div>
              {submission.photos && submission.photos.length > 0 && (
                <span className="text-xs text-muted-foreground">Click photo to zoom and inspect</span>
              )}
            </div>

            {submission.photos && submission.photos.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {submission.photos.map((photo: any, idx: number) => {
                  const photoUrl = resolvePhotoUrl(photo.storage_path);
                  return (
                    <button
                      key={photo.id || idx}
                      type="button"
                      onClick={() => setSelectedPhotoIndex(idx)}
                      className="group relative aspect-video rounded-xl overflow-hidden border border-border bg-muted focus:outline-none focus:ring-2 focus:ring-primary hover:border-primary/50 transition-all text-left"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={photoUrl}
                        alt={`Submission photo ${idx + 1}`}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = "/images/irosin-map-placeholder.svg";
                        }}
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                        <span className="p-2 rounded-full bg-white/90 text-slate-900 shadow-md">
                          <Maximize2 className="w-4 h-4" />
                        </span>
                      </div>
                      <span className="absolute bottom-1.5 left-1.5 px-2 py-0.5 rounded-md bg-black/60 text-white text-[11px] font-medium backdrop-blur-xs">
                        Photo #{idx + 1}
                      </span>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="p-8 rounded-2xl border border-dashed border-border bg-muted/20 text-center space-y-2">
                <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center mx-auto text-muted-foreground">
                  <ImageIcon className="w-5 h-5" />
                </div>
                <p className="text-sm font-medium text-foreground">No Photo Attachments</p>
                <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                  The contributor did not attach any photos to this submission. Please verify the coordinates on the satellite map or check with barangay officials before approving.
                </p>
              </div>
            )}
          </Card>
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
                Approving this submission will convert it into an official water resource, copy verified photos, publish it to the public map, and link it to a dedicated group chat.
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

      {/* Photo Inspection Lightbox Modal */}
      {selectedPhotoIndex !== null && submission.photos && submission.photos[selectedPhotoIndex] && (
        <div 
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex flex-col items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setSelectedPhotoIndex(null)}
        >
          <div 
            className="relative max-w-4xl w-full max-h-[90vh] flex flex-col items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top Header Bar */}
            <div className="w-full flex items-center justify-between text-white pb-3 px-1">
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="bg-white/20 text-white hover:bg-white/30 border-0">
                  Photo {selectedPhotoIndex + 1} of {submission.photos.length}
                </Badge>
                <span className="text-xs text-white/70 truncate max-w-[200px] sm:max-w-md">
                  {submission.name}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href={resolvePhotoUrl(submission.photos[selectedPhotoIndex].storage_path)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
                  title="Open original high-res image"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
                <button
                  type="button"
                  onClick={() => setSelectedPhotoIndex(null)}
                  className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
                  title="Close"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Main Image View */}
            <div className="relative w-full aspect-video sm:aspect-[16/10] max-h-[75vh] rounded-2xl overflow-hidden bg-black/60 border border-white/10 flex items-center justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={resolvePhotoUrl(submission.photos[selectedPhotoIndex].storage_path)}
                alt={`Submission photo ${selectedPhotoIndex + 1}`}
                className="max-h-full max-w-full object-contain"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "/images/irosin-map-placeholder.svg";
                }}
              />

              {/* Prev / Next controls */}
              {submission.photos.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedPhotoIndex((prev) => 
                        prev === 0 ? submission.photos!.length - 1 : (prev ?? 0) - 1
                      );
                    }}
                    className="absolute left-3 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-black/60 hover:bg-black/90 text-white transition-colors border border-white/10 cursor-pointer"
                    title="Previous photo"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedPhotoIndex((prev) => 
                        prev === submission.photos!.length - 1 ? 0 : (prev ?? 0) + 1
                      );
                    }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-black/60 hover:bg-black/90 text-white transition-colors border border-white/10 cursor-pointer"
                    title="Next photo"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </>
              )}
            </div>

            {/* Photo caption / details footer */}
            <div className="w-full text-center text-xs text-white/60 pt-3">
              Press ESC or click anywhere outside to close preview
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
