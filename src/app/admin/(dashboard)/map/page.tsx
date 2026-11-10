// src/app/admin/(dashboard)/map/page.tsx
"use client";

import React, { useState, useEffect, useRef } from "react";
import { AdminHeader } from "@/components/admin/admin-header";
import { MapContainer } from "@/components/map/map-container";
import { useWaterSources } from "@/hooks/use-water-sources";
import { useAdminRealtime } from "@/hooks/use-admin-realtime";
import { createWaterSourceAction } from "@/actions/water-actions";
import { uploadWaterImage, ALLOWED_IMAGE_TYPES, MAX_FILE_SIZE } from "@/lib/supabase/storage";
import { compressImage } from "@/lib/utils/image-compression";
import { waterCategories, waterAvailabilityStatuses } from "@/lib/validations/water-schema";
import { invalidateAdminCache } from "@/lib/cache/admin-cache";
import { IROSIN_BARANGAYS, IROSIN_COORDINATES } from "@/lib/utils/constants";
import { CircleIconPicker } from "@/components/admin/circle-icon-picker";
import { getDefaultCircleIconForCategory } from "@/lib/map/circle-icons";
import {
  MapPin,
  Save,
  AlertCircle,
  X,
  ArrowRight,
  Crosshair,
  CheckCircle2,
  FileEdit,
  Upload,
  Trash2,
  Star,
  Image as ImageIcon,
  Loader2,
  Clock,
  Phone,
  Compass,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface StagedPhoto {
  id: string;
  file: File;
  previewUrl: string;
  sizeFormatted: string;
  caption: string;
  is_primary: boolean;
}

export default function AdminMapEditorPage() {
  const { sources, refetch } = useWaterSources();
  const [editorMarker, setEditorMarker] = useState<{ lat: number; lng: number } | null>(null);

  // Form State - Basic Information
  const [name, setName] = useState("");
  const [category, setCategory] = useState(waterCategories[0]);
  const [barangay, setBarangay] = useState<string>(IROSIN_BARANGAYS[0]);
  const [address, setAddress] = useState("");
  const [description, setDescription] = useState("");

  // Circle Icon Marker State
  const [customIconId, setCustomIconId] = useState<string>("water_drop");
  const [customColor, setCustomColor] = useState<string>("#2563eb");
  const [hasUserCustomizedIcon, setHasUserCustomizedIcon] = useState(false);

  // Photos State (1 - 6 images allowed)
  const [stagedPhotos, setStagedPhotos] = useState<StagedPhoto[]>([]);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const maxPhotosAllowed = 6;
  const remainingSlots = Math.max(0, maxPhotosAllowed - stagedPhotos.length);

  // Operational Details State
  const [status, setStatus] = useState(waterAvailabilityStatuses[0]);
  const [operatingHours, setOperatingHours] = useState("");
  const [contactInfo, setContactInfo] = useState("");
  const [isPublished, setIsPublished] = useState(true);

  // Mobile View Tab: "map" or "form"
  const [mobileTab, setMobileTab] = useState<"map" | "form">("map");

  // Submission & Progress State
  const [isSaving, setIsSaving] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatusText, setUploadStatusText] = useState("");
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Real-time synchronization hook
  const { isLive, lastSync, isRefreshing, triggerRefresh } = useAdminRealtime({
    tables: ["water_sources"],
    onSync: refetch,
  });

  // Smart Circle Icon Auto-Detection based on Category & Name
  useEffect(() => {
    if (!hasUserCustomizedIcon) {
      const def = getDefaultCircleIconForCategory(category, name);
      setCustomIconId(def.iconId);
      setCustomColor(def.color);
    }
  }, [category, name, hasUserCustomizedIcon]);

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

  // Re-render Leaflet tiles smoothly when mobile tab switches
  useEffect(() => {
    const timer = setTimeout(() => {
      window.dispatchEvent(new Event("resize"));
    }, 120);
    return () => clearTimeout(timer);
  }, [mobileTab]);

  const handleMapClick = (lat: number, lng: number) => {
    setEditorMarker({
      lat: Number(lat.toFixed(5)),
      lng: Number(lng.toFixed(5)),
    });
    setFeedback(null);
  };

  // Handle Photo File Selection with client-side compression
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setFeedback(null);

    if (stagedPhotos.length >= maxPhotosAllowed) {
      setFeedback({
        type: "error",
        text: `Maximum limit reached: You can upload up to ${maxPhotosAllowed} images per water source.`,
      });
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    const filesArray = Array.from(files);
    const validNewPhotos: StagedPhoto[] = [];

    for (const rawFile of filesArray) {
      if (validNewPhotos.length + stagedPhotos.length >= maxPhotosAllowed) {
        break;
      }

      if (!ALLOWED_IMAGE_TYPES.includes(rawFile.type)) {
        setFeedback({
          type: "error",
          text: "Only JPG, PNG, and WebP image formats are supported.",
        });
        continue;
      }

      let file = rawFile;
      try {
        file = await compressImage(rawFile, { maxWidth: 1600, maxHeight: 1600, quality: 0.85 });
      } catch {
        // Fallback to raw file
      }

      if (file.size > MAX_FILE_SIZE) {
        setFeedback({
          type: "error",
          text: `"${file.name}" exceeds the 10MB size limit.`,
        });
        continue;
      }

      const previewUrl = URL.createObjectURL(file);
      const isFirstEver = stagedPhotos.length === 0 && validNewPhotos.length === 0;
      const sizeKB = Math.round(file.size / 1024);
      const sizeFormatted = sizeKB > 1024 ? `${(sizeKB / 1024).toFixed(1)} MB` : `${sizeKB} KB`;

      validNewPhotos.push({
        id: `photo_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
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
      if (target?.is_primary && filtered.length > 0) {
        filtered[0].is_primary = true;
      }
      return filtered;
    });
  };

  const handleSetPrimary = (targetId: string) => {
    setStagedPhotos((prev) =>
      prev.map((p) => ({ ...p, is_primary: p.id === targetId }))
    );
  };

  const handleSaveMarker = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editorMarker) {
      setFeedback({ type: "error", text: "Please click on the map to place the marker pin." });
      setMobileTab("map");
      return;
    }
    if (!name.trim()) {
      setFeedback({ type: "error", text: "Please provide a name for this water source." });
      return;
    }

    setIsSaving(true);
    setUploadProgress(10);
    setUploadStatusText("Uploading photos and validating details...");
    setFeedback(null);

    try {
      // 1. Upload staged photos to Supabase Storage
      const uploadedPhotosPayload: Array<{
        storage_path: string;
        caption?: string | null;
        is_primary: boolean;
      }> = [];

      if (stagedPhotos.length > 0) {
        for (let i = 0; i < stagedPhotos.length; i++) {
          const item = stagedPhotos[i];
          const currentPercent = Math.round(15 + (i / stagedPhotos.length) * 60);
          setUploadProgress(currentPercent);
          setUploadStatusText(`Uploading photo ${i + 1} of ${stagedPhotos.length} to storage...`);

          const uploadRes = await uploadWaterImage(item.file, "water-photos");
          if (!uploadRes.success || !uploadRes.data?.url) {
            throw new Error(uploadRes.error || `Failed to upload image "${item.file.name}".`);
          }

          uploadedPhotosPayload.push({
            storage_path: uploadRes.data.url,
            caption: item.caption || null,
            is_primary: item.is_primary,
          });
        }
      }

      setUploadProgress(80);
      setUploadStatusText("Publishing water source to live map...");

      if (uploadedPhotosPayload.length > 0 && !uploadedPhotosPayload.some((p) => p.is_primary)) {
        uploadedPhotosPayload[0].is_primary = true;
      }

      // 2. Create water source record with custom circle pin icon and color
      const res = await createWaterSourceAction({
        name: name.trim(),
        category,
        barangay,
        address: address.trim() || null,
        description: description.trim() || null,
        availability_status: status,
        operating_hours: operatingHours.trim() || null,
        contact_information: contactInfo.trim() || null,
        latitude: editorMarker.lat,
        longitude: editorMarker.lng,
        is_published: isPublished,
        photos: uploadedPhotosPayload,
        custom_icon_id: customIconId,
        custom_icon_color: customColor,
      });

      if (res.success) {
        setUploadProgress(100);
        setUploadStatusText("Saved successfully!");
        setFeedback({ type: "success", text: `"${name.trim()}" published to the live map with photos!` });

        // Reset form fields
        setName("");
        setDescription("");
        setAddress("");
        setOperatingHours("");
        setContactInfo("");
        setStagedPhotos([]);
        setEditorMarker(null);
        setHasUserCustomizedIcon(false);

        invalidateAdminCache();
        refetch();

        setTimeout(() => {
          setMobileTab("map");
        }, 1500);
      } else {
        setFeedback({ type: "error", text: res.error || "Failed to save water source." });
      }
    } catch (err: any) {
      setFeedback({ type: "error", text: err.message || "Failed to save marker." });
    } finally {
      setIsSaving(false);
      setUploadProgress(0);
      setUploadStatusText("");
    }
  };

  return (
    <div className="flex flex-col lg:h-[calc(100dvh-4.5rem)] space-y-2.5 min-w-0">
      {/* Compact Top Header */}
      <AdminHeader
        title="Map Editor"
        subtitle="Click anywhere on the map of Irosin to place or reposition water resources."
        isLive={isLive}
        lastSync={lastSync}
        isRefreshing={isRefreshing}
        onRefresh={triggerRefresh}
        badgeCount={sources.length}
        compact={true}
        className="shrink-0 mb-0 pb-2.5"
      />

      {/* Mobile Tab Switcher (Visible only on < lg screens) */}
      <div className="lg:hidden shrink-0 flex items-center p-1 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xs">
        <button
          type="button"
          onClick={() => setMobileTab("map")}
          className={cn(
            "flex-1 py-1.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer",
            mobileTab === "map"
              ? "bg-blue-600 text-white shadow-2xs"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
          )}
        >
          <MapPin className="w-3.5 h-3.5" />
          <span>Interactive Map</span>
          {editorMarker && <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />}
        </button>
        <button
          type="button"
          onClick={() => setMobileTab("form")}
          className={cn(
            "flex-1 py-1.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer",
            mobileTab === "form"
              ? "bg-blue-600 text-white shadow-2xs"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
          )}
        >
          <FileEdit className="w-3.5 h-3.5" />
          <span>Resource Form</span>
          {editorMarker ? (
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-bold">
              Pin Ready
            </span>
          ) : (
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
          )}
        </button>
      </div>

      {/* Main Container: 12-column Grid on Desktop, Swappable Views on Mobile */}
      <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-12 gap-3 overflow-hidden">
        {/* Left Form Panel */}
        <div
          className={cn(
            "lg:col-span-5 xl:col-span-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs flex flex-col min-h-0 overflow-hidden",
            mobileTab === "form" ? "flex" : "hidden lg:flex"
          )}
        >
          {/* Form Header */}
          <div className="shrink-0 px-4 py-2.5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                <MapPin className="h-4 w-4" />
              </div>
              <div>
                <h3 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white leading-tight">
                  Place New Resource
                </h3>
                <p className="text-[11px] text-slate-400">Add verified marker to Irosin map</p>
              </div>
            </div>

            {editorMarker ? (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Pin Active
              </span>
            ) : (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                Pin Required
              </span>
            )}
          </div>

          {/* Form Body (Scrollable) */}
          <form onSubmit={handleSaveMarker} className="flex-1 flex flex-col min-h-0">
            <div className="flex-1 overflow-y-auto p-3.5 space-y-3.5 text-xs">
              {/* Feedback Alert */}
              {feedback && (
                <div
                  className={`p-2.5 rounded-xl text-xs flex items-center gap-2 ${
                    feedback.type === "success"
                      ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"
                      : "bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 border border-rose-200 dark:border-rose-800"
                  }`}
                >
                  {feedback.type === "success" ? (
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
                  ) : (
                    <AlertCircle className="h-4 w-4 shrink-0 text-rose-500" />
                  )}
                  <span className="font-medium">{feedback.text}</span>
                </div>
              )}

              {/* Upload Progress Indicator */}
              {isSaving && (
                <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-blue-700 dark:text-blue-300 flex items-center gap-1.5">
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      {uploadStatusText}
                    </span>
                    <span className="font-mono font-bold text-blue-700 dark:text-blue-300">
                      {uploadProgress}%
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-blue-100 dark:bg-blue-900 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-600 transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Coordinates Indicator */}
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                    Selected Coordinates
                  </span>
                  {editorMarker && (
                    <button
                      type="button"
                      onClick={() => setEditorMarker(null)}
                      className="text-[10px] text-slate-400 hover:text-rose-500 flex items-center gap-0.5 cursor-pointer"
                    >
                      <X className="w-3 h-3" />
                      <span>Clear Pin</span>
                    </button>
                  )}
                </div>

                {editorMarker ? (
                  <div className="flex items-center justify-between">
                    <div className="font-mono text-xs font-bold text-blue-600 dark:text-blue-400">
                      {editorMarker.lat}° N, {editorMarker.lng}° E
                    </div>
                    <button
                      type="button"
                      onClick={() => setMobileTab("map")}
                      className="lg:hidden text-[11px] text-blue-500 font-semibold underline"
                    >
                      Reposition
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-amber-500 dark:text-amber-400 font-medium flex items-center gap-1.5">
                      <Crosshair className="w-3.5 h-3.5 animate-spin text-amber-500" />
                      Click on map to drop a pin
                    </span>
                    <button
                      type="button"
                      onClick={() => setMobileTab("map")}
                      className="lg:hidden text-[11px] text-blue-600 dark:text-blue-400 font-bold underline"
                    >
                      Open Map
                    </button>
                  </div>
                )}
              </div>

              {/* Section 1: Basic Information */}
              <div className="space-y-2.5 pt-1">
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Basic Information
                </div>

                {/* Resource Name */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Resource Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. San Roque Community Well"
                    required
                    className="w-full h-8.5 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                {/* Category & Barangay */}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Category <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value as any)}
                      className="w-full h-8.5 px-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                    >
                      {waterCategories.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Barangay <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={barangay}
                      onChange={(e) => setBarangay(e.target.value)}
                      className="w-full h-8.5 px-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                    >
                      {IROSIN_BARANGAYS.map((b) => (
                        <option key={b} value={b}>
                          Barangay {b}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Description
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={2}
                    placeholder="Detailed description of water point, water quality, and community access..."
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
                  />
                </div>
              </div>

              {/* Section 2: Location & Geographic Details */}
              <div className="space-y-2.5 pt-2 border-t border-slate-100 dark:border-slate-800">
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Location & Coordinates
                </div>

                {/* Numerical Lat/Lng Inputs */}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Latitude <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="number"
                      step="0.00001"
                      value={editorMarker?.lat ?? ""}
                      placeholder="e.g. 12.7042"
                      onChange={(e) => {
                        const val = parseFloat(e.target.value);
                        if (!isNaN(val)) {
                          setEditorMarker((prev) => ({
                            lat: val,
                            lng: prev?.lng ?? IROSIN_COORDINATES.lng,
                          }));
                        }
                      }}
                      className="w-full h-8.5 px-2.5 rounded-xl font-mono bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Longitude <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="number"
                      step="0.00001"
                      value={editorMarker?.lng ?? ""}
                      placeholder="e.g. 124.0326"
                      onChange={(e) => {
                        const val = parseFloat(e.target.value);
                        if (!isNaN(val)) {
                          setEditorMarker((prev) => ({
                            lat: prev?.lat ?? IROSIN_COORDINATES.lat,
                            lng: val,
                          }));
                        }
                      }}
                      className="w-full h-8.5 px-2.5 rounded-xl font-mono bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                </div>

                {/* Street / Specific Location */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Street / Specific Location
                  </label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="e.g. Sitio Bitang / Near Barangay Hall"
                    className="w-full h-8.5 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Section 3: Map Circle Marker Icon Picker */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                <CircleIconPicker
                  selectedIconId={customIconId}
                  selectedColor={customColor}
                  category={category}
                  resourceName={name}
                  onChange={(iconId, color) => {
                    setCustomIconId(iconId);
                    setCustomColor(color);
                    setHasUserCustomizedIcon(true);
                  }}
                />
              </div>

              {/* Section 4: Resource Photos & Gallery (1 - 6 Images) */}
              <div className="space-y-2.5 pt-2 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center justify-between">
                  <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Resource Photos ({stagedPhotos.length} of {maxPhotosAllowed})
                  </div>
                  <span className="text-[10px] text-slate-400">
                    {remainingSlots} slots remaining
                  </span>
                </div>

                {/* Upload Button / Zone */}
                {remainingSlots > 0 && (
                  <div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      multiple
                      onChange={handleFileSelect}
                      className="hidden"
                      id="map-editor-photo-upload"
                    />
                    <label
                      htmlFor="map-editor-photo-upload"
                      className="flex flex-col items-center justify-center p-3 rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-700 hover:border-blue-500 dark:hover:border-blue-500 bg-slate-50/50 dark:bg-slate-800/30 cursor-pointer transition-all group"
                    >
                      <div className="w-8 h-8 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-1 group-hover:scale-110 transition-transform">
                        <Upload className="w-4 h-4" />
                      </div>
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-200">
                        Click to select photos
                      </span>
                      <span className="text-[10px] text-slate-400">
                        JPG, PNG, WebP up to 10MB
                      </span>
                    </label>
                  </div>
                )}

                {/* Staged Photo Previews */}
                {stagedPhotos.length > 0 && (
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    {stagedPhotos.map((photo) => (
                      <div
                        key={photo.id}
                        className={cn(
                          "relative rounded-xl overflow-hidden border bg-slate-50 dark:bg-slate-800 p-1 group flex flex-col gap-1",
                          photo.is_primary
                            ? "border-amber-400 ring-1 ring-amber-400/50"
                            : "border-slate-200 dark:border-slate-700"
                        )}
                      >
                        <div className="relative h-20 w-full rounded-lg overflow-hidden bg-slate-900">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={photo.previewUrl}
                            alt="Staged water source"
                            className="w-full h-full object-cover"
                          />
                          {photo.is_primary && (
                            <span className="absolute top-1 left-1 px-1.5 py-0.5 rounded-md bg-amber-500 text-white font-bold text-[9px] flex items-center gap-0.5 shadow-sm">
                              <Star className="w-2.5 h-2.5 fill-current" />
                              Primary
                            </span>
                          )}
                          <div className="absolute top-1 right-1 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            {!photo.is_primary && (
                              <button
                                type="button"
                                onClick={() => handleSetPrimary(photo.id)}
                                title="Set as Cover"
                                className="w-5 h-5 rounded-md bg-black/60 hover:bg-black/90 text-white flex items-center justify-center cursor-pointer"
                              >
                                <Star className="w-3 h-3" />
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => handleRemovePhoto(photo.id)}
                              title="Delete photo"
                              className="w-5 h-5 rounded-md bg-rose-600/80 hover:bg-rose-600 text-white flex items-center justify-center cursor-pointer"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                        <div className="flex items-center justify-between px-1 text-[10px] text-slate-400">
                          <span className="truncate max-w-[80px]">{photo.file.name}</span>
                          <span>{photo.sizeFormatted}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Section 5: Operational Status & Contacts */}
              <div className="space-y-2.5 pt-2 border-t border-slate-100 dark:border-slate-800">
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Operational Status & Contacts
                </div>

                {/* Status */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Availability Status
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                    className="w-full h-8.5 px-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    {waterAvailabilityStatuses.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Operating Hours */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Operating Hours
                  </label>
                  <div className="relative">
                    <Clock className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                    <input
                      type="text"
                      value={operatingHours}
                      onChange={(e) => setOperatingHours(e.target.value)}
                      placeholder="e.g. 6:00 AM - 6:00 PM or 24 Hours"
                      className="w-full h-8.5 pl-8 pr-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                </div>

                {/* Contact Information */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Contact Information
                  </label>
                  <div className="relative">
                    <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                    <input
                      type="text"
                      value={contactInfo}
                      onChange={(e) => setContactInfo(e.target.value)}
                      placeholder="e.g. 0917-123-4567 / Barangay Water Committee"
                      className="w-full h-8.5 pl-8 pr-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                </div>

                {/* Publish Toggle */}
                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="isPub"
                    checked={isPublished}
                    onChange={(e) => setIsPublished(e.target.checked)}
                    className="rounded text-blue-600 focus:ring-blue-500 w-3.5 h-3.5 cursor-pointer"
                  />
                  <label
                    htmlFor="isPub"
                    className="text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer select-none"
                  >
                    Publish immediately on public map
                  </label>
                </div>
              </div>
            </div>

            {/* Form Footer Action */}
            <div className="shrink-0 p-3 bg-slate-50/80 dark:bg-slate-850/80 border-t border-slate-100 dark:border-slate-800">
              <button
                type="submit"
                disabled={isSaving || !editorMarker}
                className="w-full h-9 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-xs shadow-2xs transition-all flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    <span>Saving Water Source...</span>
                  </>
                ) : (
                  <>
                    <Save className="h-3.5 w-3.5" />
                    <span>Save Water Source</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Right Map Canvas Panel */}
        <div
          className={cn(
            "lg:col-span-7 xl:col-span-7 rounded-2xl overflow-hidden border border-slate-200/80 dark:border-slate-800 shadow-2xs relative flex flex-col min-h-0",
            mobileTab === "map" ? "flex h-[calc(100dvh-175px)] lg:h-auto" : "hidden lg:flex"
          )}
        >
          {/* Floating Instructions Helper at Top */}
          <div className="absolute top-3 left-3 z-[1000] bg-slate-900/90 dark:bg-slate-900/95 backdrop-blur-md px-3 py-1.5 rounded-xl text-xs text-white border border-slate-700/80 shadow-lg flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-400 animate-ping" />
            <span className="font-medium text-[11px] sm:text-xs">
              Click anywhere on Irosin map to drop or move marker pin
            </span>
          </div>

          {/* Floating Active Pin Coordinates Chip */}
          {editorMarker && (
            <div className="absolute top-3 right-3 z-[1000] hidden sm:flex items-center gap-1.5 bg-emerald-950/90 backdrop-blur-md px-3 py-1.5 rounded-xl text-xs text-emerald-300 border border-emerald-700/80 shadow-lg font-mono font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>{editorMarker.lat}° N, {editorMarker.lng}° E</span>
            </div>
          )}

          {/* Interactive Map Component */}
          <MapContainer
            sources={sources}
            selectedSource={null}
            onSelectSource={() => {}}
            selectedCategory="All"
            onSelectCategory={() => {}}
            isEditorMode={true}
            onMapClickCoordinates={handleMapClick}
            editorMarker={
              editorMarker
                ? {
                    lat: editorMarker.lat,
                    lng: editorMarker.lng,
                    iconId: customIconId,
                    color: customColor,
                    category,
                    status,
                  }
                : null
            }
            className="w-full h-full"
          />

          {/* Mobile Bottom Quick-Action Banner (Shown when pin is placed on mobile map) */}
          {editorMarker && (
            <div className="lg:hidden absolute bottom-4 left-3 right-3 z-[1000] p-3 rounded-2xl bg-slate-900/95 backdrop-blur-md border border-slate-700/80 text-white shadow-xl flex items-center justify-between gap-3 animate-in fade-in slide-in-from-bottom-2 duration-200">
              <div className="min-w-0">
                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                  Marker Position Dropped
                </p>
                <p className="text-xs font-mono font-bold text-emerald-400 truncate">
                  {editorMarker.lat}° N, {editorMarker.lng}° E
                </p>
              </div>
              <button
                type="button"
                onClick={() => setMobileTab("form")}
                className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs shrink-0 cursor-pointer"
              >
                <span>Fill Details</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
