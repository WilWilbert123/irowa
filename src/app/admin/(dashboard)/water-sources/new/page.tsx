// src/app/admin/(dashboard)/water-sources/new/page.tsx
"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { 
  createWaterSourceAction, 
  syncWaterSourcePhotosAction 
} from "@/actions/water-actions";
import { uploadWaterImage, ALLOWED_IMAGE_TYPES, MAX_FILE_SIZE } from "@/lib/supabase/storage";
import { waterCategories, waterAvailabilityStatuses } from "@/lib/validations/water-schema";
import { 
  IROSIN_BARANGAYS, 
  IROSIN_COORDINATES, 
  CATEGORY_LABELS, 
  AVAILABILITY_STATUS_LABELS 
} from "@/lib/utils/constants";
import { 
  Save, 
  ArrowLeft, 
  AlertCircle, 
  MapPin, 
  Upload, 
  Trash2, 
  Star, 
  Image as ImageIcon, 
  Loader2, 
  Compass, 
  X,
  CheckCircle2
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
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

interface StagedPhoto {
  id: string;
  file: File;
  previewUrl: string;
  sizeFormatted: string;
  caption: string;
  is_primary: boolean;
}

export default function AdminNewWaterSourcePage() {
  const router = useRouter();

  // Form Fields
  const [name, setName] = useState("");
  const [category, setCategory] = useState(waterCategories[0]);
  const [barangay, setBarangay] = useState<string>(IROSIN_BARANGAYS[0]);
  const [address, setAddress] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState(waterAvailabilityStatuses[0]);
  const [operatingHours, setOperatingHours] = useState("");
  const [contactInfo, setContactInfo] = useState("");
  const [latitude, setLatitude] = useState(IROSIN_COORDINATES.lat);
  const [longitude, setLongitude] = useState(IROSIN_COORDINATES.lng);
  const [isPublished, setIsPublished] = useState(true);

  // Photos State (1 - 6 images allowed)
  const [stagedPhotos, setStagedPhotos] = useState<StagedPhoto[]>([]);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const maxPhotosAllowed = 6;
  const totalPhotosCount = stagedPhotos.length;
  const remainingSlots = Math.max(0, maxPhotosAllowed - totalPhotosCount);

  // Upload Progress & Submitting State
  const [isSaving, setIsSaving] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatusText, setUploadStatusText] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

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

  // Handle Photo File Selection (Cap at 6 images)
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setErrorMsg(null);

    if (totalPhotosCount >= maxPhotosAllowed) {
      setErrorMsg(`Maximum limit reached: You can upload up to ${maxPhotosAllowed} images per water source.`);
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
        setErrorMsg("Only JPG, PNG, and WebP image formats are supported.");
        continue;
      }

      if (file.size > MAX_FILE_SIZE) {
        setErrorMsg(`"${file.name}" exceeds the 5MB size limit.`);
        continue;
      }

      const previewUrl = URL.createObjectURL(file);
      const isFirstEver = stagedPhotos.length === 0 && validNewPhotos.length === 0;
      const sizeKB = Math.round(file.size / 1024);
      const sizeFormatted = sizeKB > 1024 ? `${(sizeKB / 1024).toFixed(1)} MB` : `${sizeKB} KB`;

      validNewPhotos.push({
        id: `new_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        file,
        previewUrl,
        sizeFormatted,
        caption: "",
        is_primary: isFirstEver,
      });
    }

    if (validNewPhotos.length > 0) {
      setStagedPhotos((prev) => [...prev, ...validNewPhotos]);
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Remove a staged photo
  const handleRemovePhoto = (id: string) => {
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
      // Ensure one photo remains primary if there are photos left
      if (target?.is_primary && filtered.length > 0) {
        filtered[0].is_primary = true;
      }
      return filtered;
    });
  };

  // Set a photo as Primary Cover
  const handleSetPrimary = (targetId: string) => {
    setStagedPhotos((prev) =>
      prev.map((p) => ({ ...p, is_primary: p.id === targetId }))
    );
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
    setIsSaving(true);
    setErrorMsg(null);
    setUploadProgress(5);
    setUploadStatusText("Validating water source information...");

    try {
      // 1. Upload staged photos direct to Supabase
      const uploadedPhotosPayload: Array<{
        storage_path: string;
        caption?: string | null;
        is_primary: boolean;
      }> = [];

      if (stagedPhotos.length > 0) {
        for (let i = 0; i < stagedPhotos.length; i++) {
          const item = stagedPhotos[i];
          const currentPercent = Math.round(10 + (i / stagedPhotos.length) * 65);
          setUploadProgress(currentPercent);
          setUploadStatusText(`Uploading photo ${i + 1} of ${stagedPhotos.length} to Supabase...`);

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

          uploadedPhotosPayload.push({
            storage_path: storageUrl,
            caption: item.caption || null,
            is_primary: item.is_primary,
          });
        }
      }

      // 2. Create water source record in Supabase
      setUploadProgress(80);
      setUploadStatusText("Publishing water source to municipal directory...");

      const res = await createWaterSourceAction({
        name: name.trim(),
        category,
        barangay,
        address: address.trim() || null,
        description: description.trim() || null,
        availability_status: status,
        operating_hours: operatingHours.trim() || null,
        contact_information: contactInfo.trim() || null,
        latitude: Number(latitude),
        longitude: Number(longitude),
        is_published: isPublished,
      });

      if (!res.success || !res.id) {
        throw new Error(res.error || "Failed to create water source");
      }

      // 3. Link uploaded photos in water_photos table
      if (uploadedPhotosPayload.length > 0) {
        setUploadProgress(92);
        setUploadStatusText("Linking gallery photos & cover image...");

        if (!uploadedPhotosPayload.some((p) => p.is_primary)) {
          uploadedPhotosPayload[0].is_primary = true;
        }

        await syncWaterSourcePhotosAction(res.id, uploadedPhotosPayload);
      }

      setUploadProgress(100);
      setUploadStatusText("Complete! Redirecting...");
      router.push("/admin/water-sources");
    } catch (err: any) {
      setErrorMsg(err.message || "An unexpected error occurred while creating water source");
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button asChild variant="ghost" size="icon" className="rounded-xl">
          <Link href="/admin/water-sources">
            <ArrowLeft className="w-5 h-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-foreground">Create Water Source</h1>
          <p className="text-sm text-muted-foreground">
            Pin and publish a new verified municipal water resource with photos
          </p>
        </div>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm flex items-start gap-2.5 shadow-2xs">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <div className="flex-1 font-medium">{errorMsg}</div>
          <button onClick={() => setErrorMsg(null)} className="text-destructive/70 hover:text-destructive">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Upload & Publishing Progress Bar */}
      {isSaving && (
        <div className="p-4 rounded-2xl bg-blue-50/90 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-900/60 shadow-sm space-y-2.5 animate-in fade-in duration-200">
          <div className="flex items-center justify-between text-xs font-bold text-blue-700 dark:text-blue-300">
            <span className="flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-blue-600 dark:text-blue-400" />
              <span>{uploadStatusText}</span>
            </span>
            <span className="font-mono text-sm">{uploadProgress}%</span>
          </div>
          <div className="w-full h-2.5 rounded-full bg-blue-100 dark:bg-blue-900/60 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-600 to-teal-500 rounded-full transition-all duration-300 ease-out shadow-xs"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Card 1: Basic Information */}
        <Card className="p-6 space-y-4 rounded-2xl shadow-2xs border-border">
          <h2 className="text-lg font-bold text-foreground">Basic Information</h2>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-semibold block mb-1 text-foreground">
                Resource Name <span className="text-rose-500">*</span>
              </label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. San Mateo Cold Springs"
                className="h-10 rounded-xl"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-semibold block mb-1 text-foreground">Category *</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="w-full h-10 px-3 rounded-xl border border-input bg-background text-sm font-medium focus:ring-2 focus:ring-primary/20 focus:outline-none"
                  required
                >
                  {waterCategories.map((c) => (
                    <option key={c} value={c}>
                      {CATEGORY_LABELS[c] || c}
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
                      Barangay {b}
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
                placeholder="Detailed description of water point, water quality, and community access..."
                className="rounded-xl"
              />
            </div>
          </div>
        </Card>

        {/* Card 2: Location & Geographic Pin with Leaflet Map */}
        <Card className="p-6 space-y-5 rounded-2xl shadow-2xs border-border">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/80 pb-3">
            <div>
              <h2 className="text-lg font-bold flex items-center gap-2 text-foreground">
                <MapPin className="w-5 h-5 text-blue-600 dark:text-blue-400" /> Location & Geographic Pin
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Drag the marker or tap anywhere on the map to set the exact coordinates
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
              <span>Tip: Drag the pin or click on the map to pinpoint. You can also switch to Satellite view or click 'My GPS' to detect your current location.</span>
            </p>
          </div>

          {/* Numerical Coordinate Inputs */}
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
            <label className="text-sm font-semibold block mb-1 text-foreground">Street / Specific Location</label>
            <Input
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="e.g. Sitio Bitang / Near Barangay Hall"
              className="h-10 rounded-xl"
            />
          </div>
        </Card>

        {/* Card 3: Photo Upload & Gallery (1 - 6 Images) */}
        <Card className="p-6 space-y-5 rounded-2xl shadow-2xs border-border">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/80 pb-3">
            <div>
              <h2 className="text-lg font-bold flex items-center gap-2 text-foreground">
                <ImageIcon className="w-5 h-5 text-emerald-600 dark:text-emerald-400" /> 
                Resource Photos & Gallery (1 - 6 Images)
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Upload up to 6 high-quality photos directly to Supabase storage
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

          {/* Staged Photos Grid */}
          <div className="space-y-4">
            {stagedPhotos.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5">
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
                      alt="Water photo preview"
                      className="w-full h-full object-cover"
                    />

                    {/* Primary Cover Badge */}
                    {photo.is_primary && (
                      <div className="absolute top-2 left-2 flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500 text-white font-bold text-[10px] shadow-sm">
                        <Star className="w-3 h-3 fill-white" />
                        <span>Cover</span>
                      </div>
                    )}

                    {/* File Size Indicator */}
                    <div className="absolute bottom-1.5 left-2 text-[9px] font-mono font-bold text-white/90 bg-black/60 px-1.5 py-0.2 rounded-md backdrop-blur-xs">
                      {photo.sizeFormatted}
                    </div>

                    {/* Overlay Actions */}
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      {!photo.is_primary && (
                        <button
                          type="button"
                          onClick={() => handleSetPrimary(photo.id)}
                          className="p-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-white shadow-xs transition-transform active:scale-90"
                          title="Set as primary cover photo"
                        >
                          <Star className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => handleRemovePhoto(photo.id)}
                        className="p-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white shadow-xs transition-transform active:scale-90"
                        title="Remove photo"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-6 rounded-xl border border-dashed border-border text-center text-muted-foreground text-xs">
                No photos selected yet. You can attach 1 to 6 photos for this water source.
              </div>
            )}

            {/* Upload Dropzone */}
            {totalPhotosCount < maxPhotosAllowed ? (
              <label className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-primary/30 hover:border-primary/60 dark:border-slate-700 dark:hover:border-primary rounded-2xl cursor-pointer bg-primary/5 hover:bg-primary/10 transition-colors group">
                <Upload className="w-6 h-6 text-primary mb-2 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-bold text-foreground">
                  Click to select photos ({remainingSlots} {remainingSlots === 1 ? "slot" : "slots"} remaining)
                </span>
                <span className="text-[11px] text-muted-foreground mt-1">
                  JPG, PNG, or WebP up to 5MB (1 to 6 photos maximum)
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
                <span>Maximum limit of 6 photos reached. To upload a different image, remove one of the photos above.</span>
              </div>
            )}
          </div>
        </Card>

        {/* Card 4: Operational Status & Contacts */}
        <Card className="p-6 space-y-4 rounded-2xl shadow-2xs border-border">
          <h2 className="text-lg font-bold text-foreground">Operational Status & Contacts</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-semibold block mb-1 text-foreground">Availability Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full h-10 px-3 rounded-xl border border-input bg-background text-sm font-medium focus:ring-2 focus:ring-primary/20 focus:outline-none"
              >
                {waterAvailabilityStatuses.map((s) => (
                  <option key={s} value={s}>
                    {AVAILABILITY_STATUS_LABELS[s] || s}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm font-semibold block mb-1 text-foreground">Operating Hours</label>
              <Input
                value={operatingHours}
                onChange={(e) => setOperatingHours(e.target.value)}
                placeholder="e.g. 6:00 AM - 6:00 PM or 24 Hours"
                className="h-10 rounded-xl"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="text-sm font-semibold block mb-1 text-foreground">Contact Information</label>
              <Input
                value={contactInfo}
                onChange={(e) => setContactInfo(e.target.value)}
                placeholder="e.g. 0917-123-4567 / Barangay Water Committee"
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
                Publish this water source on the public map immediately
              </span>
            </label>
          </div>
        </Card>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Button asChild variant="outline" className="rounded-xl">
            <Link href="/admin/water-sources">Cancel</Link>
          </Button>
          <Button
            type="submit"
            disabled={isSaving}
            className="flex items-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-xs active:scale-95 transition-all"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>{uploadStatusText || "Publishing..."}</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Create & Publish Water Source</span>
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
