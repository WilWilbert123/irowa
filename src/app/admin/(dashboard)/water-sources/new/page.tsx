// src/app/admin/(dashboard)/water-sources/new/page.tsx
"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { AdminHeader } from "@/components/admin/admin-header";
import { createWaterSourceAction } from "@/actions/water-actions";
import { waterCategories, waterAvailabilityStatuses } from "@/lib/validations/water-schema";
import { IROSIN_BARANGAYS, IROSIN_COORDINATES } from "@/lib/utils/constants";
import { Save, ArrowLeft, AlertCircle } from "lucide-react";
import Link from "next/link";

export default function AdminNewWaterSourcePage() {
  const router = useRouter();

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

  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setErrorMsg(null);

    try {
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

      if (res.success) {
        router.push("/admin/water-sources");
      } else {
        setErrorMsg(res.error || "Failed to create water source");
      }
    } catch (err: any) {
      setErrorMsg(err.message || "An unexpected error occurred");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/admin/water-sources"
          className="p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:hover:text-white"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">Create Water Source</h1>
          <p className="text-xs text-slate-500">Publish a new verified municipal water pin.</p>
        </div>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-2xl bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 border border-rose-200 dark:border-rose-900 text-xs flex items-center gap-2">
          <AlertCircle className="h-4 w-4" />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Resource Name <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. San Mateo Cold Springs"
            required
            className="w-full h-11 px-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm focus:outline-none"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as any)}
              className="w-full h-11 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm focus:outline-none"
            >
              {waterCategories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Availability Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as any)}
              className="w-full h-11 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm focus:outline-none"
            >
              {waterAvailabilityStatuses.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Barangay
            </label>
            <select
              value={barangay}
              onChange={(e) => setBarangay(e.target.value)}
              className="w-full h-11 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm focus:outline-none"
            >
              {IROSIN_BARANGAYS.map((b) => (
                <option key={b} value={b}>Barangay {b}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Street / Specific Location
            </label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="e.g. Sitio Bitang"
              className="w-full h-11 px-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm focus:outline-none"
            />
          </div>
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
              className="w-full h-11 px-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-mono focus:outline-none"
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
              className="w-full h-11 px-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-mono focus:outline-none"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            placeholder="Detailed description of water point..."
            className="w-full p-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm focus:outline-none"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Operating Hours
            </label>
            <input
              type="text"
              value={operatingHours}
              onChange={(e) => setOperatingHours(e.target.value)}
              placeholder="e.g. 6:00 AM - 6:00 PM"
              className="w-full h-11 px-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Contact Information
            </label>
            <input
              type="text"
              value={contactInfo}
              onChange={(e) => setContactInfo(e.target.value)}
              placeholder="e.g. 0917-123-4567"
              className="w-full h-11 px-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm focus:outline-none"
            />
          </div>
        </div>

        <div className="pt-2">
          <button
            type="submit"
            disabled={isSaving}
            className="w-full h-12 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-xs shadow-sm transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <Save className="h-4 w-4" />
            <span>{isSaving ? "Saving..." : "Create & Publish Water Source"}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
