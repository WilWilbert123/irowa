"use client";

import React, { useEffect, useState, useRef } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { useParams, useRouter } from "next/navigation";
import { 
  ArrowLeft, 
  Save, 
  MapPin, 
  Upload, 
  Trash2, 
  Star, 
  Image as ImageIcon, 
  AlertCircle, 
  CheckCircle2, 
  Loader2, 
  Plus, 
  Compass,
  Layers,
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  getWaterSourceByIdAction, 
  updateWaterSourceAction, 
  syncWaterSourcePhotosAction 
} from "@/actions/water-actions";
import { uploadWaterImage, ALLOWED_IMAGE_TYPES, MAX_FILE_SIZE } from "@/lib/supabase/storage";
import { getPublicStorageUrl } from "@/lib/utils/image-utils";
import { invalidateAdminCache, ADMIN_CACHE_KEYS } from "@/lib/cache/admin-cache";
import { 
  WATER_CATEGORIES, 
  AVAILABILITY_STATUSES, 
  VERIFICATION_STATUSES, 
  IROSIN_BARANGAYS,
  CATEGORY_LABELS,
  AVAILABILITY_STATUS_LABELS,
  IROSIN_COORDINATES
} from "@/lib/utils/constants";
import { WaterCategory, WaterAvailabilityStatus, WaterVerificationStatus } from "@/types/water";
import { cn } from "@/lib/utils";

// Dynamically import LocationPickerMap with SSR disabled for Leaflet compatibility
const LocationPickerMap = dynamic(
  () => import("@/components/map/location-picker-map"),
  {
    ssr: false,
    loading: () => (
      <div className="h-[340px] sm:h-[380px] w-full rounded-2xl bg-muted/40 animate-pulse flex flex-col items-center justify-center gap-2.5 border border-border">
        <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
        <span className="text-xs font-semibold text-muted-foreground">Loading interactive map for pin location...</span>
      </div>
    ),
  }
);

interface ExistingPhoto {
  id: string;
  storage_path: string;
  caption: string | null;
  is_primary: boolean;
}

interface StagedPhoto {
  id: string;
  file: File;
  previewUrl: string;
  caption: string;
  is_primary: boolean;
}

export default function EditWaterSourcePage() {
  const params = useParams();
  const router = useRouter();
  const waterId = params?.waterId as string;

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitStatusText, setSubmitStatusText] = useState("");
  const [error, setError] = useState<string | null>(null);

  // Form Fields
  const [name, setName] = useState("");
  const [category, setCategory] = useState<string>("Public Water Source");
  const [description, setDescription] = useState("");
  const [latitude, setLatitude] = useState(IROSIN_COORDINATES.lat);
  const [longitude, setLongitude] = useState(IROSIN_COORDINATES.lng);
  const [address, setAddress] = useState("");
  const [barangay, setBarangay] = useState("San Julian");
  const [availabilityStatus, setAvailabilityStatus] = useState<string>("Available");
  const [verificationStatus, setVerificationStatus] = useState<string>("Verified");
  const [operatingHours, setOperatingHours] = useState("");
  const [contactInformation, setContactInformation] = useState("");
  const [isPublished, setIsPublished] = useState(true);

  // Photos State (1 - 6 images allowed)
  const [existingPhotos, setExistingPhotos] = useState<ExistingPhoto[]>([]);
  const [stagedPhotos, setStagedPhotos] = useState<StagedPhoto[]>([]);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const totalPhotosCount = existingPhotos.length + stagedPhotos.length;
  const maxPhotosAllowed = 6;
  const remainingSlots = Math.max(0, maxPhotosAllowed - totalPhotosCount);

  // Clean up object URLs on unmount
  useEffect(() => {
    return () => {
      stagedPhotos.forEach((photo) => {
        try {
          URL.revokeObjectURL(photo.previewUrl);
        } catch {
          // ignore
        }
      });
    };
  }, [stagedPhotos]);

  useEffect(() => {
    async function loadData() {
      if (!waterId) return;
      try {
        const source = await getWaterSourceByIdAction(waterId);
        if (source) {
          setName(source.name);
          setCategory(source.category);
          setDescription(source.description || "");
          setLatitude(source.latitude);
          setLongitude(source.longitude);
          setAddress(source.address || "");
          setBarangay(source.barangay || "San Julian");
          setAvailabilityStatus(source.availability_status);
          setVerificationStatus(source.verification_status);
          setOperatingHours(source.operating_hours || "");
          setContactInformation(source.contact_information || "");
          setIsPublished(source.is_published);

          if (source.photos && Array.isArray(source.photos)) {
            setExistingPhotos(
              source.photos.map((p) => ({
                id: p.id,
                storage_path: p.storage_path,
                caption: p.caption,
                is_primary: Boolean(p.is_primary),
              }))
            );
          }
        }
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [waterId]);

  // Handle Photo File Selection (Cap at 6 images)
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setError(null);

    if (totalPhotosCount >= maxPhotosAllowed) {
      setError(`Maximum limit reached: You can upload up to ${maxPhotosAllowed} images per water source.`);
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    const filesArray = Array.from(files);
    const validNewPhotos: StagedPhoto[] = [];

    for (const file of filesArray) {
      if (validNewPhotos.length >= remainingSlots) {
        break;
      }

      if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
        setError("Only JPG, PNG, and WebP image formats are supported.");
        continue;
      }

      if (file.size > MAX_FILE_SIZE) {
        setError(`"${file.name}" exceeds the 5MB size limit.`);
        continue;
      }

      const previewUrl = URL.createObjectURL(file);
      const isFirstEver = totalPhotosCount === 0 && validNewPhotos.length === 0;

      validNewPhotos.push({
        id: `new_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        file,
        previewUrl,
        caption: "",
        is_primary: isFirstEver,
      });
    }

    if (validNewPhotos.length > 0) {
      setStagedPhotos((prev) => [...prev, ...validNewPhotos]);
    }

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Remove an existing photo
  const handleRemoveExistingPhoto = (id: string) => {
    setExistingPhotos((prev) => {
      const filtered = prev.filter((p) => p.id !== id);
      // If we removed the primary photo, set the first available photo as primary
      if (prev.find((p) => p.id === id)?.is_primary && filtered.length > 0) {
        filtered[0].is_primary = true;
      } else if (filtered.length === 0 && stagedPhotos.length > 0) {
        setStagedPhotos((staged) =>
          staged.map((sp, idx) => ({ ...sp, is_primary: idx === 0 }))
        );
      }
      return filtered;
    });
  };

  // Remove a staged new photo
  const handleRemoveStagedPhoto = (id: string) => {
    setStagedPhotos((prev) => {
      const target = prev.find((p) => p.id === id);
      if (target?.previewUrl) {
        try {
          URL.revokeObjectURL(target.previewUrl);
        } catch {
          // ignore
        }
      }
      const filtered = prev.filter((p) => p.id !== id);
      // Ensure one photo remains primary if existing photos has none
      const hasExistingPrimary = existingPhotos.some((p) => p.is_primary);
      if (!hasExistingPrimary && filtered.length > 0) {
        filtered[0].is_primary = true;
      }
      return filtered;
    });
  };

  // Set a photo as Primary Cover
  const handleSetPrimary = (targetId: string, isExisting: boolean) => {
    if (isExisting) {
      setExistingPhotos((prev) =>
        prev.map((p) => ({ ...p, is_primary: p.id === targetId }))
      );
      setStagedPhotos((prev) =>
        prev.map((p) => ({ ...p, is_primary: false }))
      );
    } else {
      setStagedPhotos((prev) =>
        prev.map((p) => ({ ...p, is_primary: p.id === targetId }))
      );
      setExistingPhotos((prev) =>
        prev.map((p) => ({ ...p, is_primary: false }))
      );
    }
  };

  // Helper to convert file to Data URL if storage bucket fails
  const fileToDataUrl = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmitStatusText("Saving basic resource details...");
    setError(null);

    try {
      // 1. Update water source basic attributes
      const updateRes = await updateWaterSourceAction(waterId, {
        name,
        category,
        description,
        latitude,
        longitude,
        address,
        barangay,
        availability_status: availabilityStatus,
        verification_status: verificationStatus,
        operating_hours: operatingHours || undefined,
        contact_information: contactInformation || undefined,
        is_published: isPublished,
      });

      if (updateRes && (updateRes as any).error) {
        throw new Error((updateRes as any).error);
      }

      // 2. Upload any staged new images
      const uploadedNewPhotos: Array<{
        id?: string;
        storage_path: string;
        caption?: string | null;
        is_primary: boolean;
      }> = [];

      for (let i = 0; i < stagedPhotos.length; i++) {
        const item = stagedPhotos[i];
        setSubmitStatusText(`Uploading photo ${i + 1} of ${stagedPhotos.length}...`);

        let storageUrl = "";
        try {
          const uploadRes = await uploadWaterImage(item.file, "water-photos");
          if (uploadRes.success && uploadRes.data?.url) {
            storageUrl = uploadRes.data.url;
          } else {
            // Fallback to data URL
            storageUrl = await fileToDataUrl(item.file);
          }
        } catch {
          storageUrl = await fileToDataUrl(item.file);
        }

        uploadedNewPhotos.push({
          storage_path: storageUrl,
          caption: item.caption || null,
          is_primary: item.is_primary,
        });
      }

      // 3. Sync all photos (existing kept + newly uploaded)
      setSubmitStatusText("Finalizing photos and gallery...");
      const finalPhotosPayload = [
        ...existingPhotos.map((p) => ({
          id: p.id,
          storage_path: p.storage_path,
          caption: p.caption,
          is_primary: p.is_primary,
        })),
        ...uploadedNewPhotos,
      ];

      // Ensure at least one is primary if photos exist
      if (finalPhotosPayload.length > 0 && !finalPhotosPayload.some((p) => p.is_primary)) {
        finalPhotosPayload[0].is_primary = true;
      }

      await syncWaterSourcePhotosAction(waterId, finalPhotosPayload);

      invalidateAdminCache(ADMIN_CACHE_KEYS.WATER_SOURCES);
      invalidateAdminCache(ADMIN_CACHE_KEYS.OVERVIEW_METRICS);
      invalidateAdminCache(ADMIN_CACHE_KEYS.ANALYTICS);

      router.push(`/admin/water-sources/${waterId}`);
    } catch (err) {
      setError((err as Error).message || "Failed to update water resource");
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="p-12 text-center text-muted-foreground flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <span className="text-sm font-medium">Loading water source editor...</span>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button asChild variant="ghost" size="icon" className="rounded-xl">
          <Link href={`/admin/water-sources/${waterId}`}>
            <ArrowLeft className="w-5 h-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-foreground">Edit Water Source</h1>
          <p className="text-sm text-muted-foreground">
            Modify details, re-pin location coordinates on the map, or update gallery photos
          </p>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm flex items-start gap-2.5 shadow-2xs">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <div className="flex-1 font-medium">{error}</div>
          <button onClick={() => setError(null)} className="text-destructive/70 hover:text-destructive">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information Card */}
        <Card className="p-6 space-y-4 rounded-2xl shadow-2xs border-border">
          <h2 className="text-lg font-bold text-foreground">Basic Information</h2>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-semibold block mb-1 text-foreground">Resource Name *</label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Masacrot Spring Resort"
                className="h-10 rounded-xl"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-semibold block mb-1 text-foreground">Category *</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as WaterCategory)}
                  className="w-full h-10 px-3 rounded-xl border border-input bg-background text-sm font-medium focus:ring-2 focus:ring-primary/20 focus:outline-none"
                  required
                >
                  {WATER_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {CATEGORY_LABELS[cat]}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm font-semibold block mb-1 text-foreground">Barangay *</label>
                <select
                  value={barangay}
                  onChange={(e) => setBarangay(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl border border-input bg-background text-sm font-medium focus:ring-2 focus:ring-primary/20 focus:outline-none"
                  required
                >
                  {IROSIN_BARANGAYS.map((b) => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="text-sm font-semibold block mb-1 text-foreground">Description</label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                placeholder="Describe current water flow, source type, accessibility, and community usage..."
                className="rounded-xl"
              />
            </div>
          </div>
        </Card>

        {/* Location & Coordinates Card with Interactive Leaflet Map */}
        <Card className="p-6 space-y-5 rounded-2xl shadow-2xs border-border">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/80 pb-3">
            <div>
              <h2 className="text-lg font-bold flex items-center gap-2 text-foreground">
                <MapPin className="w-5 h-5 text-blue-600 dark:text-blue-400" /> Location & Geographic Pin
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Drag the marker or click anywhere on the map to set the exact position
              </p>
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200/60 dark:border-blue-900/40 text-xs font-mono font-bold text-blue-700 dark:text-blue-300 self-start sm:self-auto">
              <Compass className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              <span>{latitude.toFixed(5)}° N, {longitude.toFixed(5)}° E</span>
            </div>
          </div>

          {/* Leaflet Map Component */}
          <div className="space-y-3">
            <div className="overflow-hidden rounded-2xl border border-border shadow-sm">
              <LocationPickerMap
                latitude={latitude}
                longitude={longitude}
                onChange={(newLat, newLng) => {
                  setLatitude(newLat);
                  setLongitude(newLng);
                }}
                className="h-[340px] sm:h-[400px] w-full"
                defaultLayer="standard"
              />
            </div>

            <p className="text-[11px] text-muted-foreground italic flex items-center gap-1.5">
              <span>Tip: Use the layer button on the map to toggle satellite view for identifying trees, rivers, and rooftops.</span>
            </p>
          </div>

          {/* Coordinate numerical inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="text-sm font-semibold block mb-1 text-foreground">Latitude *</label>
              <Input
                type="number"
                step="0.000001"
                value={latitude}
                onChange={(e) => setLatitude(parseFloat(e.target.value) || 0)}
                className="h-10 rounded-xl font-mono text-sm"
                required
              />
            </div>
            <div>
              <label className="text-sm font-semibold block mb-1 text-foreground">Longitude *</label>
              <Input
                type="number"
                step="0.000001"
                value={longitude}
                onChange={(e) => setLongitude(parseFloat(e.target.value) || 0)}
                className="h-10 rounded-xl font-mono text-sm"
                required
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-semibold block mb-1 text-foreground">Address / Landmark</label>
            <Input
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="e.g. Near San Julian Barangay Hall, along Maharlika Highway"
              className="h-10 rounded-xl"
            />
          </div>
        </Card>

        {/* Photo Upload & Gallery Card (1 - 6 Images) */}
        <Card className="p-6 space-y-5 rounded-2xl shadow-2xs border-border">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/80 pb-3">
            <div>
              <h2 className="text-lg font-bold flex items-center gap-2 text-foreground">
                <ImageIcon className="w-5 h-5 text-emerald-600 dark:text-emerald-400" /> 
                Resource Photos & Gallery
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Upload 1 to 6 photos showing water flow, access point, or surrounding area
              </p>
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-xs font-bold text-foreground border border-border self-start sm:self-auto">
              <span className={cn(
                "w-2 h-2 rounded-full",
                totalPhotosCount >= maxPhotosAllowed ? "bg-amber-500" : "bg-emerald-500"
              )} />
              <span>{totalPhotosCount} of {maxPhotosAllowed} Photos</span>
            </div>
          </div>

          {/* Photos Grid */}
          <div className="space-y-4">
            {totalPhotosCount > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5">
                {/* Existing Photos */}
                {existingPhotos.map((photo) => (
                  <div
                    key={photo.id}
                    className={cn(
                      "group relative aspect-video rounded-xl overflow-hidden border bg-muted/30 shadow-2xs transition-all",
                      photo.is_primary
                        ? "border-amber-400 ring-2 ring-amber-400/30"
                        : "border-border hover:border-slate-400"
                    )}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={getPublicStorageUrl(photo.storage_path)}
                      alt={photo.caption || "Water resource"}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "/images/irosin-map-placeholder.svg";
                      }}
                    />

                    {/* Primary Badge */}
                    {photo.is_primary && (
                      <div className="absolute top-2 left-2 flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500 text-white font-bold text-[10px] shadow-sm">
                        <Star className="w-3 h-3 fill-white" />
                        <span>Cover</span>
                      </div>
                    )}

                    {/* Overlay Actions */}
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      {!photo.is_primary && (
                        <button
                          type="button"
                          onClick={() => handleSetPrimary(photo.id, true)}
                          className="p-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-white shadow-xs transition-transform active:scale-90"
                          title="Set as primary cover photo"
                        >
                          <Star className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => handleRemoveExistingPhoto(photo.id)}
                        className="p-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white shadow-xs transition-transform active:scale-90"
                        title="Delete photo"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="absolute bottom-1 right-2 text-[9px] font-bold text-white/90 bg-black/60 px-1.5 py-0.2 rounded-md backdrop-blur-xs">
                      Existing
                    </div>
                  </div>
                ))}

                {/* Staged New Photos */}
                {stagedPhotos.map((photo) => (
                  <div
                    key={photo.id}
                    className={cn(
                      "group relative aspect-video rounded-xl overflow-hidden border bg-muted/30 shadow-2xs transition-all",
                      photo.is_primary
                        ? "border-amber-400 ring-2 ring-amber-400/30"
                        : "border-blue-400/80 ring-2 ring-blue-400/20"
                    )}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={photo.previewUrl}
                      alt="New upload"
                      className="w-full h-full object-cover"
                    />

                    {/* Primary Badge */}
                    {photo.is_primary && (
                      <div className="absolute top-2 left-2 flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500 text-white font-bold text-[10px] shadow-sm">
                        <Star className="w-3 h-3 fill-white" />
                        <span>Cover</span>
                      </div>
                    )}

                    {/* Overlay Actions */}
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      {!photo.is_primary && (
                        <button
                          type="button"
                          onClick={() => handleSetPrimary(photo.id, false)}
                          className="p-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-white shadow-xs transition-transform active:scale-90"
                          title="Set as primary cover photo"
                        >
                          <Star className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => handleRemoveStagedPhoto(photo.id)}
                        className="p-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white shadow-xs transition-transform active:scale-90"
                        title="Remove photo"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="absolute bottom-1 right-2 text-[9px] font-bold text-white bg-blue-600 px-1.5 py-0.2 rounded-md shadow-xs">
                      New
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-6 rounded-xl border border-dashed border-border text-center text-muted-foreground text-xs">
                No photos attached yet. Upload 1 to 6 photos below.
              </div>
            )}

            {/* Upload Dropzone */}
            {totalPhotosCount < maxPhotosAllowed ? (
              <label className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-primary/30 hover:border-primary/60 dark:border-slate-700 dark:hover:border-primary rounded-2xl cursor-pointer bg-primary/5 hover:bg-primary/10 transition-colors group">
                <Upload className="w-6 h-6 text-primary mb-2 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-bold text-foreground">
                  Click to choose photos ({remainingSlots} {remainingSlots === 1 ? "slot" : "slots"} left)
                </span>
                <span className="text-[11px] text-muted-foreground mt-1">
                  PNG, JPG, or WebP up to 5MB (1 to 6 photos total)
                </span>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </label>
            ) : (
              <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-400 text-xs font-medium flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>Maximum limit of 6 photos reached. To upload new images, remove an existing photo above.</span>
              </div>
            )}
          </div>
        </Card>

        {/* Status & Verification Card */}
        <Card className="p-6 space-y-4 rounded-2xl shadow-2xs border-border">
          <h2 className="text-lg font-bold text-foreground">Status & Verification</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-semibold block mb-1 text-foreground">Availability Status</label>
              <select
                value={availabilityStatus}
                onChange={(e) => setAvailabilityStatus(e.target.value as WaterAvailabilityStatus)}
                className="w-full h-10 px-3 rounded-xl border border-input bg-background text-sm font-medium focus:ring-2 focus:ring-primary/20 focus:outline-none"
              >
                {AVAILABILITY_STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {AVAILABILITY_STATUS_LABELS[status]}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm font-semibold block mb-1 text-foreground">Verification Status</label>
              <select
                value={verificationStatus}
                onChange={(e) => setVerificationStatus(e.target.value as WaterVerificationStatus)}
                className="w-full h-10 px-3 rounded-xl border border-input bg-background text-sm font-medium focus:ring-2 focus:ring-primary/20 focus:outline-none"
              >
                {VERIFICATION_STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm font-semibold block mb-1 text-foreground">Operating Hours</label>
              <Input
                value={operatingHours}
                onChange={(e) => setOperatingHours(e.target.value)}
                placeholder="e.g. 24 Hours or 7:00 AM - 6:00 PM"
                className="h-10 rounded-xl"
              />
            </div>

            <div>
              <label className="text-sm font-semibold block mb-1 text-foreground">Contact Information</label>
              <Input
                value={contactInformation}
                onChange={(e) => setContactInformation(e.target.value)}
                placeholder="e.g. 0912-345-6789"
                className="h-10 rounded-xl"
              />
            </div>
          </div>

          <div className="pt-2">
            <label className="flex items-center gap-2.5 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={isPublished}
                onChange={(e) => setIsPublished(e.target.checked)}
                className="rounded-md border-input text-primary focus:ring-primary w-4 h-4"
              />
              <span className="text-sm font-semibold text-foreground">
                Publish this water source on the public map
              </span>
            </label>
          </div>
        </Card>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Button asChild variant="outline" className="rounded-xl">
            <Link href={`/admin/water-sources/${waterId}`}>Cancel</Link>
          </Button>
          <Button
            type="submit"
            disabled={submitting}
            className="flex items-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-xs active:scale-95 transition-all"
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>{submitStatusText || "Saving Changes..."}</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Save Changes</span>
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
