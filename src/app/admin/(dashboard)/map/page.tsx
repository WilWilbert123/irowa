// src/app/admin/(dashboard)/map/page.tsx
"use client";

import React, { useState } from "react";
import { AdminHeader } from "@/components/admin/admin-header";
import { MapContainer } from "@/components/map/map-container";
import { useWaterSources } from "@/hooks/use-water-sources";
import { createWaterSourceAction } from "@/actions/water-actions";
import { waterCategories, waterAvailabilityStatuses } from "@/lib/validations/water-schema";
import { IROSIN_BARANGAYS, IROSIN_COORDINATES } from "@/lib/utils/constants";
import { MapPin, Save, Plus, Check, AlertCircle } from "lucide-react";

export default function AdminMapEditorPage() {
  const { sources, refetch } = useWaterSources();
  const [editorMarker, setEditorMarker] = useState<{ lat: number; lng: number } | null>(null);

  // Form State
  const [name, setName] = useState("");
  const [category, setCategory] = useState(waterCategories[0]);
  const [barangay, setBarangay] = useState<string>(IROSIN_BARANGAYS[0]);
  const [status, setStatus] = useState(waterAvailabilityStatuses[0]);
  const [description, setDescription] = useState("");
  const [isPublished, setIsPublished] = useState(true);

  const [isSaving, setIsSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleMapClick = (lat: number, lng: number) => {
    setEditorMarker({
      lat: Number(lat.toFixed(5)),
      lng: Number(lng.toFixed(5)),
    });
  };

  const handleSaveMarker = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editorMarker) {
      setFeedback({ type: "error", text: "Please click on the map to place the marker." });
      return;
    }
    if (!name.trim()) {
      setFeedback({ type: "error", text: "Please provide a name for this water source." });
      return;
    }

    setIsSaving(true);
    setFeedback(null);

    try {
      const res = await createWaterSourceAction({
        name: name.trim(),
        category,
        barangay,
        description: description.trim() || null,
        availability_status: status,
        latitude: editorMarker.lat,
        longitude: editorMarker.lng,
        is_published: isPublished,
      });

      if (res.success) {
        setFeedback({ type: "success", text: "Water source created and placed on map!" });
        setName("");
        setDescription("");
        setEditorMarker(null);
        refetch();
      } else {
        setFeedback({ type: "error", text: res.error || "Failed to save water source" });
      }
    } catch (err: any) {
      setFeedback({ type: "error", text: err.message || "Failed to save marker" });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <AdminHeader
        title="Map Editor"
        subtitle="Click anywhere on the map of Irosin to place or reposition water resources."
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[720px]">
        {/* Left Form Panel */}
        <div className="lg:col-span-1 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-5 shadow-xs flex flex-col justify-between overflow-y-auto">
          <form onSubmit={handleSaveMarker} className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
              <MapPin className="h-4 w-4 text-blue-500" />
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                Place New Marker
              </h3>
            </div>

            {feedback && (
              <div
                className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                  feedback.type === "success"
                    ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200"
                    : "bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 border border-rose-200"
                }`}
              >
                {feedback.type === "success" ? <Check className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
                <span>{feedback.text}</span>
              </div>
            )}

            {/* Coordinates Indicator */}
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 space-y-1">
              <span className="text-[11px] font-semibold text-slate-400 block">Selected Coordinates</span>
              {editorMarker ? (
                <div className="font-mono text-xs font-bold text-blue-600 dark:text-blue-400">
                  Lat: {editorMarker.lat}° N, Lng: {editorMarker.lng}° E
                </div>
              ) : (
                <span className="text-xs text-amber-500 font-medium">
                  Click on map to drop a pin
                </span>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Resource Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. San Roque Community Well"
                required
                className="w-full h-10 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="w-full h-10 px-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs focus:outline-none"
                >
                  {waterCategories.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Availability
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as any)}
                  className="w-full h-10 px-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs focus:outline-none"
                >
                  {waterAvailabilityStatuses.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Barangay
              </label>
              <select
                value={barangay}
                onChange={(e) => setBarangay(e.target.value)}
                className="w-full h-10 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs focus:outline-none"
              >
                {IROSIN_BARANGAYS.map((b) => (
                  <option key={b} value={b}>
                    Barangay {b}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Description / Notes
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                placeholder="Water quality, hours, or equipment notes..."
                className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="isPub"
                checked={isPublished}
                onChange={(e) => setIsPublished(e.target.checked)}
                className="rounded text-blue-600"
              />
              <label htmlFor="isPub" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Publish immediately on public map
              </label>
            </div>

            <button
              type="submit"
              disabled={isSaving || !editorMarker}
              className="w-full h-11 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-xs shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer mt-4"
            >
              <Save className="h-4 w-4" />
              <span>{isSaving ? "Saving Pin..." : "Save Water Source"}</span>
            </button>
          </form>
        </div>

        {/* Right Map Canvas */}
        <div className="lg:col-span-2 rounded-3xl overflow-hidden border border-slate-200/80 dark:border-slate-800 shadow-md relative">
          <MapContainer
            sources={sources}
            selectedSource={null}
            onSelectSource={() => {}}
            selectedCategory="All"
            onSelectCategory={() => {}}
            isEditorMode={true}
            onMapClickCoordinates={handleMapClick}
            editorMarker={editorMarker}
            className="w-full h-full"
          />

          <div className="absolute top-4 left-4 z-[1000] bg-slate-900/90 backdrop-blur-md px-3.5 py-2 rounded-xl text-xs text-white border border-slate-700 shadow-lg">
            Tip: Click anywhere to drop a marker pin
          </div>
        </div>
      </div>
    </div>
  );
}
