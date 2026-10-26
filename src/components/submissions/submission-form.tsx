// src/components/submissions/submission-form.tsx
"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useVisitor } from "@/contexts/visitor-context";
import { submitWaterSourceAction } from "@/actions/submission-actions";
import { uploadWaterImage } from "@/lib/supabase/storage";
import { waterCategories, waterAvailabilityStatuses } from "@/lib/validations/water-schema";
import { IROSIN_BARANGAYS, IROSIN_COORDINATES } from "@/lib/utils/constants";
import { MapPin, Upload, AlertCircle, CheckCircle2, Navigation } from "lucide-react";
import { useGeolocation } from "@/hooks/use-geolocation";

export function SubmissionForm() {
  const router = useRouter();
  const { visitor, setDisplayName } = useVisitor();
  const { location, isLocating, requestLocation } = useGeolocation();

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

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleUseCurrentLocation = async () => {
    const pos = await requestLocation();
    if (pos) {
      setLatitude(Number(pos.lat.toFixed(5)));
      setLongitude(Number(pos.lng.toFixed(5)));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
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

    try {
      // Save display name for visitor
      setDisplayName(submitterName);

      // Upload photo if selected
      let uploadedPhotoPath: string | null = null;
      if (selectedFile) {
        const uploadRes = await uploadWaterImage(selectedFile, "submission-photos");
        if (uploadRes.success && uploadRes.data) {
          uploadedPhotoPath = uploadRes.data.path;
        }
      }

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
      });

      if ("success" in res && res.success) {
        router.push("/submit-water/success");
      } else {
        setErrorMsg((res as any).error || "Failed to submit water source");
      }
    } catch (err: any) {
      setErrorMsg(err.message || "An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {errorMsg && (
        <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-sm flex items-center gap-3">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Submitter details */}
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

      {/* Water Source Information */}
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

      {/* GPS Location Coordinates */}
      <div className="space-y-4 p-5 rounded-3xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
            3. Geographic Coordinates
          </h3>
          <button
            type="button"
            onClick={handleUseCurrentLocation}
            disabled={isLocating}
            className="flex items-center gap-1.5 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
          >
            <Navigation className="h-3.5 w-3.5" />
            <span>{isLocating ? "Locating..." : "Use My Current GPS"}</span>
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Latitude
            </label>
            <input
              type="number"
              step="any"
              value={latitude}
              onChange={(e) => setLatitude(parseFloat(e.target.value))}
              required
              className="w-full h-11 px-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm font-mono focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Longitude
            </label>
            <input
              type="number"
              step="any"
              value={longitude}
              onChange={(e) => setLongitude(parseFloat(e.target.value))}
              required
              className="w-full h-11 px-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm font-mono focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Photo Attachment */}
      <div className="space-y-4 p-5 rounded-3xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
          4. Photo Attachment (Optional)
        </h3>

        <div className="flex flex-col sm:flex-row items-center gap-4">
          <label className="w-full sm:w-auto flex-1 flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors">
            <Upload className="h-6 w-6 text-slate-400 mb-2" />
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Click to upload photo
            </span>
            <span className="text-[11px] text-slate-400 mt-1">PNG, JPG, or WebP up to 5MB</span>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleFileChange}
              className="hidden"
            />
          </label>

          {imagePreview && (
            <div className="relative w-32 h-32 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 shrink-0">
              <img
                src={imagePreview}
                alt="Preview"
                className="w-full h-full object-cover"
              />
            </div>
          )}
        </div>
      </div>

      {/* Additional Notes & Submission Notice */}
      <div className="p-4 rounded-2xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200/60 dark:border-blue-900/40 text-xs text-blue-900 dark:text-blue-200 space-y-1">
        <span className="font-bold">Community Verification Process</span>
        <p className="leading-relaxed">
          Every submission enters an administrative review queue to verify accurate positioning and water safety before being published to the public IroWa map.
        </p>
      </div>

      {/* Submit button */}
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full h-12 rounded-2xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
      >
        {isSubmitting ? (
          <>
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            <span>Submitting Suggestion...</span>
          </>
        ) : (
          <span>Submit for Verification</span>
        )}
      </button>
    </form>
  );
}
