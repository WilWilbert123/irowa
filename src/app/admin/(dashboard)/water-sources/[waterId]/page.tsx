"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { 
  ArrowLeft, Edit3, Trash2, MapPin, Clock, Phone, AlertCircle, 
  CheckCircle2, ShieldCheck, Calendar, ExternalLink 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getWaterSourceByIdAction, archiveWaterSourceAction } from "@/actions/water-actions";
import { WaterSource } from "@/types/water";
import { AVAILABILITY_STATUS_LABELS, CATEGORY_LABELS } from "@/lib/utils/constants";
import { formatDate } from "@/lib/utils/date-utils";
import { getDirectionsUrl } from "@/lib/map/map-utils";

export default function AdminWaterSourceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const waterId = params?.waterId as string;

  const [source, setSource] = useState<WaterSource | null>(null);
  const [loading, setLoading] = useState(true);
  const [isArchiving, setIsArchiving] = useState(false);

  useEffect(() => {
    async function loadData() {
      if (!waterId) return;
      try {
        const data = await getWaterSourceByIdAction(waterId);
        setSource(data);
      } catch (err) {
        console.error("Failed to load water source", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [waterId]);

  const handleArchive = async () => {
    if (!confirm("Are you sure you want to archive this water source? It will no longer appear on the public map.")) {
      return;
    }
    setIsArchiving(true);
    try {
      await archiveWaterSourceAction(waterId);
      router.push("/admin/water-sources");
    } catch (err) {
      alert("Failed to archive resource: " + (err as Error).message);
    } finally {
      setIsArchiving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center text-muted-foreground animate-pulse">
        Loading water resource details...
      </div>
    );
  }

  if (!source) {
    return (
      <div className="p-8 text-center space-y-4">
        <h2 className="text-xl font-bold">Water Source Not Found</h2>
        <Button asChild variant="outline">
          <Link href="/admin/water-sources">Back to Water Sources</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button asChild variant="ghost" size="icon">
            <Link href="/admin/water-sources">
              <ArrowLeft className="w-5 h-5" />
            </Link>
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight text-foreground">{source.name}</h1>
              <Badge variant={source.is_published ? "default" : "secondary"}>
                {source.is_published ? "Published" : "Draft"}
              </Badge>
              {source.archived_at && <Badge variant="destructive">Archived</Badge>}
            </div>
            <p className="text-sm text-muted-foreground">ID: {source.id}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button asChild variant="outline">
            <a 
              href={getDirectionsUrl(source.latitude, source.longitude)} 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-1.5"
            >
              <ExternalLink className="w-4 h-4" />
              View on Map
            </a>
          </Button>
          <Button asChild variant="outline">
            <Link href={`/admin/water-sources/${source.id}/edit`} className="flex items-center gap-1.5">
              <Edit3 className="w-4 h-4" />
              Edit
            </Link>
          </Button>
          <Button 
            variant="destructive" 
            onClick={handleArchive} 
            disabled={isArchiving || !!source.archived_at}
            className="flex items-center gap-1.5"
          >
            <Trash2 className="w-4 h-4" />
            {source.archived_at ? "Archived" : "Archive"}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <Card className="p-6 space-y-4">
            <h2 className="text-lg font-semibold">Overview</h2>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">{source.description}</p>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-4 border-t border-border">
              <div>
                <span className="text-xs text-muted-foreground block">Category</span>
                <span className="text-sm font-medium">{CATEGORY_LABELS[source.category] || source.category}</span>
              </div>
              <div>
                <span className="text-xs text-muted-foreground block">Availability</span>
                <span className="text-sm font-medium">{AVAILABILITY_STATUS_LABELS[source.availability_status]}</span>
              </div>
              <div>
                <span className="text-xs text-muted-foreground block">Verification Status</span>
                <span className="text-sm font-medium capitalize">{source.verification_status}</span>
              </div>
            </div>
          </Card>

          <Card className="p-6 space-y-4">
            <h2 className="text-lg font-semibold">Location & Contact</h2>
            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium">{source.address || "No street address provided"}</p>
                  <p className="text-muted-foreground">Barangay: {source.barangay || "Unspecified"}, Irosin, Sorsogon</p>
                  <p className="text-xs text-muted-foreground font-mono mt-1">
                    Coordinates: {source.latitude.toFixed(6)}, {source.longitude.toFixed(6)}
                  </p>
                </div>
              </div>

              {source.operating_hours && (
                <div className="flex items-center gap-2.5">
                  <Clock className="w-4 h-4 text-primary shrink-0" />
                  <span>{source.operating_hours}</span>
                </div>
              )}

              {source.contact_information && (
                <div className="flex items-center gap-2.5">
                  <Phone className="w-4 h-4 text-primary shrink-0" />
                  <span>{source.contact_information}</span>
                </div>
              )}
            </div>
          </Card>

          {source.photos && source.photos.length > 0 && (
            <Card className="p-6 space-y-4">
              <h2 className="text-lg font-semibold">Attached Photos ({source.photos.length})</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {source.photos.map((photo: any) => (
                  <div key={photo.id} className="relative aspect-video rounded-lg overflow-hidden border border-border bg-muted">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={photo.storage_path} alt={photo.caption || "Resource photo"} className="w-full h-full object-cover" />
                    {photo.caption && (
                      <div className="absolute inset-x-0 bottom-0 bg-black/60 p-1 text-[11px] text-white truncate">
                        {photo.caption}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          <Card className="p-6 space-y-4">
            <h2 className="text-lg font-semibold">Verification & Audit</h2>
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between py-2 border-b border-border">
                <span className="text-muted-foreground flex items-center gap-1.5">
                  <Calendar className="w-4 h-4" /> Created
                </span>
                <span className="font-medium">{formatDate(source.created_at)}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-border">
                <span className="text-muted-foreground flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4" /> Last Verified
                </span>
                <span className="font-medium">{formatDate(source.last_verified_at)}</span>
              </div>
              {source.reverify_at && (
                <div className="flex items-center justify-between py-2 border-b border-border">
                  <span className="text-muted-foreground flex items-center gap-1.5">
                    <AlertCircle className="w-4 h-4" /> Re-verify By
                  </span>
                  <span className="font-medium">{formatDate(source.reverify_at)}</span>
                </div>
              )}
            </div>
          </Card>

          <Card className="p-6 space-y-4">
            <h2 className="text-lg font-semibold">Actions</h2>
            <div className="space-y-2">
              <Button asChild className="w-full" variant="outline">
                <Link href={`/admin/chat/${source.id}`}>Open Admin Chat Room</Link>
              </Button>
              <Button asChild className="w-full" variant="outline">
                <Link href={`/water/${source.id}`} target="_blank">View Public Page</Link>
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
