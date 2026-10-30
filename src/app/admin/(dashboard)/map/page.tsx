// src/app/admin/(dashboard)/map/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import { AdminHeader } from "@/components/admin/admin-header";
import { MapContainer } from "@/components/map/map-container";
import { useWaterSources } from "@/hooks/use-water-sources";
import { useAdminRealtime } from "@/hooks/use-admin-realtime";
import { createWaterSourceAction } from "@/actions/water-actions";
import { waterCategories, waterAvailabilityStatuses } from "@/lib/validations/water-schema";
import { IROSIN_BARANGAYS, IROSIN_COORDINATES } from "@/lib/utils/constants";
import {
  MapPin,
  Save,
  Plus,
  Check,
  AlertCircle,
  X,
  ArrowRight,
  Crosshair,
  Layers,
  CheckCircle2,
  FileEdit,
} from "lucide-react";
import { cn } from "@/lib/utils";

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

  // Mobile View Tab: "map" or "form"
  const [mobileTab, setMobileTab] = useState<"map" | "form">("map");

  const [isSaving, setIsSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Real-time synchronization hook
  const { isLive, lastSync, isRefreshing, triggerRefresh } = useAdminRealtime({
    tables: ["water_sources"],
    onSync: refetch,
  });

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
        setFeedback({ type: "success", text: `"${name.trim()}" published to the live map!` });
        setName("");
        setDescription("");
        setEditorMarker(null);
        refetch();
        // Optional return to map on mobile to see the new marker
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
            "lg:col-span-4 xl:col-span-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs flex flex-col min-h-0 overflow-hidden",
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
            <div className="flex-1 overflow-y-auto p-3.5 space-y-2.5 text-xs">
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

              {/* Category & Status */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Category
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
                    Availability
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
              </div>

              {/* Barangay */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Barangay
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

              {/* Description */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Description / Notes
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={2}
                  placeholder="Water quality, hours, or equipment notes..."
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
                />
              </div>

              {/* Publish Toggle */}
              <div className="flex items-center gap-2 pt-0.5">
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

            {/* Form Footer Action */}
            <div className="shrink-0 p-3 bg-slate-50/80 dark:bg-slate-850/80 border-t border-slate-100 dark:border-slate-800">
              <button
                type="submit"
                disabled={isSaving || !editorMarker}
                className="w-full h-9 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-xs shadow-2xs transition-all flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed"
              >
                <Save className="h-3.5 w-3.5" />
                <span>{isSaving ? "Saving Pin..." : "Save Water Source"}</span>
              </button>
            </div>
          </form>
        </div>

        {/* Right Map Canvas Panel */}
        <div
          className={cn(
            "lg:col-span-8 xl:col-span-8 rounded-2xl overflow-hidden border border-slate-200/80 dark:border-slate-800 shadow-2xs relative flex flex-col min-h-0",
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
            editorMarker={editorMarker}
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
