// src/components/submissions/submission-form.tsx
"use client";

import React, { useState, useRef, useEffect } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useVisitor } from "@/contexts/visitor-context";
import { submitWaterSourceAction, attachSubmissionPhotosAction } from "@/actions/submission-actions";
import { uploadWaterImage, ALLOWED_IMAGE_TYPES, MAX_FILE_SIZE } from "@/lib/supabase/storage";
import { waterCategories, waterAvailabilityStatuses } from "@/lib/validations/water-schema";
import { IROSIN_BARANGAYS, IROSIN_COORDINATES } from "@/lib/utils/constants";
import { 
  MapPin, 
  Upload, 
  AlertCircle, 
  CheckCircle2, 
  Navigation, 
  SlidersHorizontal,
  Trash2,
  Image as ImageIcon,
  Loader2,
  X
} from "lucide-react";
import { useGeolocation } from "@/hooks/use-geolocation";
import { cn } from "@/lib/utils";
import { CircleIconPicker } from "@/components/admin/circle-icon-picker";
import { getDefaultCircleIconForCategory } from "@/lib/map/circle-icons";

const LocationPickerMap = dynamic(
  () => import("@/components/map/location-picker-map"),
  {
    ssr: false,
    loading: () => (
      <div className="h-[340px] w-full rounded-2xl bg-slate-100 dark:bg-slate-900 animate-pulse flex flex-col items-center justify-center gap-2 border border-slate-200 dark:border-slate-700">
        <div className="w-8 h-8 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />
        <span className="text-xs font-semibold text-slate-400">Loading map for pin location...</span>
      </div>
    ),
  }
);

interface StagedSubmissionPhoto {
  id: string;
  file: File;
  previewUrl: string;
  sizeFormatted: string;
}

export function SubmissionForm() {
  const router = useRouter();
  const { visitor, setDisplayName } = useVisitor();
  const { isLocating, requestLocation } = useGeolocation();

  const [submitterName, setSubmitterName] = useState(visitor?.displayName || "");
  const [name, setName] = useState("");
  const [category, setCategory] = useState(waterCategories[0]);
  const [barangay, setBarangay] = useState<string>(IROSIN_BARANGAYS[0]);
  const [address, setAddress] = useState("");
  const [description, setDescription] = useState("");
  const [availability, setAvailability] = useState(waterAvailabilityStatuses[0]);
  const [operatingHours, setOperatingHours] = useState("");
  const [contactInfo, setContactInfo] = useState("");
  const [notes, setNotes] = useState("");
  const [latitude, setLatitude] = useState(IROSIN_COORDINATES.lat);
  const [longitude, setLongitude] = useState(IROSIN_COORDINATES.lng);

  // Custom Circle Pin Marker state (smart defaults based on category & name)
  const [customIconId, setCustomIconId] = useState<string>("water_drop");
  const [customColor, setCustomColor] = useState<string>("#2563eb");
  const [hasUserCustomizedIcon, setHasUserCustomizedIcon] = useState(false);

  useEffect(() => {
    if (!hasUserCustomizedIcon) {
      const def = getDefaultCircleIconForCategory(category, name);
      setCustomIconId(def.iconId);
      setCustomColor(def.color);
    }
  }, [category, name, hasUserCustomizedIcon]);

  // Photos State (1 - 6 images allowed)
  const [stagedPhotos, setStagedPhotos] = useState<StagedSubmissionPhoto[]>([]);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const maxPhotosAllowed = 6;
  const totalPhotosCount = stagedPhotos.length;
  const remainingSlots = Math.max(0, maxPhotosAllowed - totalPhotosCount);

  // Upload Progress & Submitting State
  const [isSubmitting, setIsSubmitting] = useState(false);
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

  const handleUseCurrentLocation = async () => {
    const pos = await requestLocation();
    if (pos) {
      setLatitude(Number(pos.lat.toFixed(5)));
      setLongitude(Number(pos.lng.toFixed(5)));
    }
  };

  // Handle Photo File Selection (Cap at 6 images)
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setErrorMsg(null);

    if (totalPhotosCount >= maxPhotosAllowed) {
      setErrorMsg(`Maximum limit reached: You can attach up to ${maxPhotosAllowed} images.`);
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    const filesArray = Array.from(files);
    const validNewPhotos: StagedSubmissionPhoto[] = [];

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
      const sizeKB = Math.round(file.size / 1024);
      const sizeFormatted = sizeKB > 1024 ? `${(sizeKB / 1024).toFixed(1)} MB` : `${sizeKB} KB`;

      validNewPhotos.push({
        id: `photo_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        file,
        previewUrl,
        sizeFormatted,
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
      return prev.filter((p) => p.id !== id);
    });
  };

  // Helper to convert file to Data URL if storage fails
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
    if (!submitterName.trim()) {
      setErrorMsg("Please enter your name or alias.");
      return;
    }
    if (!name.trim()) {
      setErrorMsg("Please provide the name of the water source.");
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);
    setUploadProgress(5);
    setUploadStatusText("Preparing suggestion submission...");

    try {
      // Save display name for visitor
      setDisplayName(submitterName);

      // 1. Upload photos to Supabase storage if any
      const uploadedPhotos: Array<{ storage_path: string }> = [];

      if (stagedPhotos.length > 0) {
        for (let i = 0; i < stagedPhotos.length; i++) {
          const item = stagedPhotos[i];
          const currentPercent = Math.round(10 + (i / stagedPhotos.length) * 65);
          setUploadProgress(currentPercent);
          setUploadStatusText(`Uploading photo ${i + 1} of ${stagedPhotos.length} to Supabase...`);

          let storageUrl = "";
          try {
            const uploadRes = await uploadWaterImage(item.file, "submission-photos");
            if (uploadRes.success && uploadRes.data?.url) {
              storageUrl = uploadRes.data.url;
            } else if (uploadRes.success && uploadRes.data?.path) {
              storageUrl = uploadRes.data.path;
            } else {
              storageUrl = await fileToDataUrl(item.file);
            }
          } catch {
            storageUrl = await fileToDataUrl(item.file);
          }

          uploadedPhotos.push({ storage_path: storageUrl });
        }
      }

      // 2. Submit water source record
      setUploadProgress(80);
      setUploadStatusText("Submitting to municipal verification queue...");

      const res = await submitWaterSourceAction({
        visitor_id: visitor?.visitorId || `v_${Date.now()}`,
        submitter_name: submitterName.trim(),
        name: name.trim(),
        category,
        barangay,
        address: address.trim() || null,
        description: description.trim() || null,
        availability_status: availability,
        operating_hours: operatingHours.trim() || null,
        contact_information: contactInfo.trim() || null,
        notes: notes.trim() || null,
        latitude: Number(latitude),
        longitude: Number(longitude),
        custom_icon_id: customIconId,
        custom_icon_color: customColor,
      });

      if (!res || !("success" in res) || !res.success) {
        throw new Error((res as any)?.error || "Failed to submit water source");
      }

      // 3. Link uploaded photos
      if (uploadedPhotos.length > 0 && res.submissionId) {
        setUploadProgress(92);
        setUploadStatusText("Attaching photos to submission...");
        await attachSubmissionPhotosAction(res.submissionId, uploadedPhotos);
      }

      setUploadProgress(100);
      setUploadStatusText("Complete! Redirecting to confirmation...");
      router.push("/submit-water/success");
    } catch (err: any) {
      setErrorMsg(err.message || "An unexpected error occurred");
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {errorMsg && (
        <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-sm flex items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-2.5">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <span>{errorMsg}</span>
          </div>
          <button type="button" onClick={() => setErrorMsg(null)} className="text-rose-500 hover:text-rose-700">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Upload & Submission Progress Bar */}
      {isSubmitting && (
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

      {/* 1. Submitter details */}
      <div className="space-y-4 p-5 rounded-3xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
          1. Submitter Information
        </h3>
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
            Your Name or Community Alias <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            value={submitterName}
            onChange={(e) => setSubmitterName(e.target.value)}
            placeholder="e.g. Maria Santos"
            required
            className="w-full h-11 px-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm focus:border-blue-500 focus:outline-none"
          />
          <p className="text-[11px] text-slate-400 mt-1">
            Used as the contributor attribution when approved by local administrators.
          </p>
        </div>
      </div>

      {/* 2. Water Source Information */}
      <div className="space-y-4 p-5 rounded-3xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
          2. Water Resource Information
        </h3>

        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
            Water Point Name <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Patag Cold Spring Faucet"
            required
            className="w-full h-11 px-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm focus:border-blue-500 focus:outline-none"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Category <span className="text-rose-500">*</span>
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as any)}
              className="w-full h-11 px-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm focus:outline-none"
            >
              {waterCategories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Current Reported Availability <span className="text-rose-500">*</span>
            </label>
            <select
              value={availability}
              onChange={(e) => setAvailability(e.target.value as any)}
              className="w-full h-11 px-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm focus:outline-none"
            >
              {waterAvailabilityStatuses.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Barangay in Irosin <span className="text-rose-500">*</span>
            </label>
            <select
              value={barangay}
              onChange={(e) => setBarangay(e.target.value)}
              className="w-full h-11 px-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm focus:outline-none"
            >
              {IROSIN_BARANGAYS.map((b) => (
                <option key={b} value={b}>
                  Barangay {b}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Street / Landmark
            </label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="e.g. Near Barangay Hall / Sitio Cogon"
              className="w-full h-11 px-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm focus:outline-none"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
            Description & Quality Notes
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            placeholder="Describe the source flow, accessibility for vehicles, or local usage..."
            className="w-full p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm focus:outline-none"
          />
        </div>
      </div>

      {/* 3. Geographic Location & Pin on Map */}
      <div className="space-y-4 p-5 rounded-3xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
              <MapPin className="h-4 w-4 text-blue-500" />
              <span>3. Pin Location on Map</span>
              <span className="text-rose-500">*</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Tap anywhere on the map or drag the pin to set the exact position.
            </p>
          </div>

          <button
            type="button"
            onClick={handleUseCurrentLocation}
            disabled={isLocating}
            className="self-start sm:self-auto inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/50 hover:bg-blue-100 dark:hover:bg-blue-900/50 border border-blue-200 dark:border-blue-800 text-xs font-bold text-blue-600 dark:text-blue-400 transition-colors cursor-pointer disabled:opacity-50"
          >
            <Navigation className={`h-3.5 w-3.5 ${isLocating ? "animate-spin text-blue-500" : ""}`} />
            <span>{isLocating ? "Detecting GPS..." : "Use My Current GPS"}</span>
          </button>
        </div>

        {/* Custom Circle Pin Marker & Color Customizer */}
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

        {/* Interactive Location Picker Map */}
        <LocationPickerMap
          latitude={latitude}
          longitude={longitude}
          markerIconId={customIconId}
          markerColor={customColor}
          defaultLayer="standard"
          onChange={(newLat, newLng) => {
            setLatitude(newLat);
            setLongitude(newLng);
          }}
        />

        {/* Selected Coordinates Status & Manual Tuning */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1 text-xs">
          <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-emerald-800 dark:text-emerald-300 font-medium shadow-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Pinned Location:</span>
            <span className="font-mono font-bold">{latitude.toFixed(5)}° N, {longitude.toFixed(5)}° E</span>
          </div>

          <details className="text-slate-500 dark:text-slate-400 group cursor-pointer self-start sm:self-auto">
            <summary className="hover:text-blue-600 dark:hover:text-blue-400 list-none flex items-center gap-1.5 font-semibold py-1">
              <SlidersHorizontal className="h-3.5 w-3.5" />
              <span>Fine-tune numbers</span>
            </summary>
            <div className="mt-2 grid grid-cols-2 gap-3 p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-sm">
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-1">Latitude</label>
                <input
                  type="number"
                  step="any"
                  value={latitude}
                  onChange={(e) => setLatitude(parseFloat(e.target.value) || 0)}
                  className="w-full h-9 px-3 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-mono focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-1">Longitude</label>
                <input
                  type="number"
                  step="any"
                  value={longitude}
                  onChange={(e) => setLongitude(parseFloat(e.target.value) || 0)}
                  className="w-full h-9 px-3 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-mono focus:outline-none"
                />
              </div>
            </div>
          </details>
        </div>
      </div>

      {/* 4. Photo Attachment (1 - 6 Images) */}
      <div className="space-y-4 p-5 rounded-3xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
              <ImageIcon className="h-4 w-4 text-emerald-500" />
              <span>4. Photo Attachment (1 - 6 Photos)</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Upload up to 6 photos showing the water flow, faucet, well, or surroundings.
            </p>
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white dark:bg-slate-900 text-xs font-bold text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 self-start sm:self-auto shadow-2xs">
            <span className={cn(
              "w-2 h-2 rounded-full",
              totalPhotosCount >= maxPhotosAllowed ? "bg-amber-500" : "bg-emerald-500"
            )} />
            <span>{totalPhotosCount} of {maxPhotosAllowed} Photos</span>
          </div>
        </div>

        {/* Staged Photos Grid */}
        <div className="space-y-4">
          {stagedPhotos.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {stagedPhotos.map((photo, idx) => (
                <div
                  key={photo.id}
                  className="group relative aspect-video rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-xs"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={photo.previewUrl}
                    alt="Water photo preview"
                    className="w-full h-full object-cover"
                  />

                  {/* Order Tag */}
                  <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-black/60 text-white font-bold text-[10px] backdrop-blur-xs">
                    Photo #{idx + 1}
                  </div>

                  {/* File Size */}
                  <div className="absolute bottom-1.5 left-2 text-[9px] font-mono font-bold text-white/90 bg-black/60 px-1.5 py-0.2 rounded-md backdrop-blur-xs">
                    {photo.sizeFormatted}
                  </div>

                  {/* Remove Button */}
                  <button
                    type="button"
                    onClick={() => handleRemovePhoto(photo.id)}
                    className="absolute top-2 right-2 p-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white shadow-xs transition-transform active:scale-90"
                    title="Remove photo"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Upload Dropzone */}
          {totalPhotosCount < maxPhotosAllowed ? (
            <label className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-blue-300 dark:border-blue-900/60 hover:border-blue-500 dark:hover:border-blue-500 rounded-2xl cursor-pointer bg-blue-50/30 hover:bg-blue-50/60 dark:bg-blue-950/20 dark:hover:bg-blue-950/40 transition-colors group">
              <Upload className="h-6 w-6 text-blue-600 dark:text-blue-400 mb-2 group-hover:scale-110 transition-transform" />
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                Click to choose photos ({remainingSlots} {remainingSlots === 1 ? "slot" : "slots"} left)
              </span>
              <span className="text-[11px] text-slate-400 mt-1">
                PNG, JPG, or WebP up to 5MB (1 to 6 photos total)
              </span>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/jpeg,image/png,image/webp"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>
          ) : (
            <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-400 text-xs font-medium flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>Maximum of 6 photos reached. To change a photo, remove one of the photos above.</span>
            </div>
          )}
        </div>
      </div>

      {/* Additional Notes & Submission Notice */}
      <div className="p-4 rounded-2xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200/60 dark:border-blue-900/40 text-xs text-blue-900 dark:text-blue-200 space-y-1">
        <span className="font-bold flex items-center gap-1.5">
          <CheckCircle2 className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          Community Verification Process
        </span>
        <p className="leading-relaxed text-[11px] text-slate-600 dark:text-slate-300">
          Every submission enters an administrative review queue to verify accurate positioning and water safety before being published to the public IroWa map.
        </p>
      </div>

      {/* Submit button */}
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full h-12 rounded-2xl bg-blue-600 hover:bg-blue-700 active:scale-98 disabled:opacity-50 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin text-white" />
            <span>{uploadStatusText || "Submitting Suggestion..."}</span>
          </>
        ) : (
          <span>Submit for Verification</span>
        )}
      </button>
    </form>
  );
}
