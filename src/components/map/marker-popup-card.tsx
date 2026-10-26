// src/components/map/marker-popup-card.tsx
"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  MapPin,
  Navigation,
  ExternalLink,
  MessageSquare,
  Bookmark,
  Share2,
  AlertTriangle,
  X,
  Droplet,
} from "lucide-react";
import { WaterSourceWithPhotos } from "@/types/water";
import { getDirectionsUrl, formatDistance } from "@/lib/map/map-utils";
import { getPublicStorageUrl } from "@/lib/utils/image-utils";
import { AVAILABILITY_BADGES, CATEGORY_COLORS } from "@/lib/utils/constants";
import { useVisitor } from "@/contexts/visitor-context";
import { cn } from "@/lib/utils";

interface MarkerPopupCardProps {
  source: WaterSourceWithPhotos;
  onClose: () => void;
  onGetDirections?: (source: WaterSourceWithPhotos) => void;
  isMobile?: boolean;
}

export function MarkerPopupCard({
  source,
  onClose,
  onGetDirections,
  isMobile = false,
}: MarkerPopupCardProps) {
  const { toggleSavedSource, isSaved } = useVisitor();
  const saved = isSaved(source.id);
  const [imageError, setImageError] = useState(false);

  const statusBadge =
    AVAILABILITY_BADGES[source.availability_status] || AVAILABILITY_BADGES["Available"];
  const colorDef =
    CATEGORY_COLORS[source.category] || CATEGORY_COLORS["Other"];

  const rawPhoto =
    source.photos && source.photos.length > 0
      ? getPublicStorageUrl(source.photos[0].storage_path)
      : null;

  const handleDirections = (e: React.MouseEvent) => {
    e.preventDefault();
    if (onGetDirections) {
      onGetDirections(source);
    } else {
      window.open(getDirectionsUrl(source.latitude, source.longitude, source.name), "_blank");
    }
  };

  const handleShare = () => {
    if (typeof navigator !== "undefined" && navigator.share) {
      navigator.share({
        title: `${source.name} - IroWa`,
        text: `Check out ${source.name} on the IroWa Irosin Water Resources Map!`,
        url: `${window.location.origin}/water/${source.slug}`,
      }).catch(() => {});
    } else if (typeof navigator !== "undefined") {
      navigator.clipboard.writeText(`${window.location.origin}/water/${source.slug}`);
      alert("Link copied to clipboard!");
    }
  };

  // Mobile Bottom Sheet Presentation (Mockup 2)
  if (isMobile) {
    return (
      <div className="absolute bottom-20 left-3 right-3 z-[1000] bg-white dark:bg-slate-900 rounded-3xl p-4 shadow-2xl border border-slate-200 dark:border-slate-800 transition-all animate-in slide-in-from-bottom-5">
        <div className="flex items-start gap-3.5">
          <div className="relative w-20 h-20 rounded-2xl overflow-hidden shrink-0 bg-gradient-to-br from-blue-600 to-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center">
            {rawPhoto && !imageError ? (
              <Image
                src={rawPhoto}
                alt={source.name}
                fill
                unoptimized
                onError={() => setImageError(true)}
                className="object-cover"
              />
            ) : (
              <Droplet className="h-8 w-8 text-blue-300" />
            )}
          </div>

          <div className="flex-1 min-w-0 pr-6">
            <div className="flex items-center gap-2 mb-1">
              <span className={cn("text-[10px] font-semibold px-2 py-0.5 rounded-full inline-flex items-center gap-1", statusBadge.bg)}>
                <span className={cn("w-1.5 h-1.5 rounded-full", statusBadge.dot)} />
                {source.availability_status === "Available" ? "Open" : source.availability_status}
              </span>
            </div>

            <h3 className="font-bold text-base text-slate-900 dark:text-white truncate">
              {source.name}
            </h3>

            <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mt-1">
              <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0" />
              <span className="truncate">
                {source.category} {source.distance_km ? `• ${formatDistance(source.distance_km)}` : (source.barangay ? `• Brgy. ${source.barangay}` : "")}
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="absolute top-3.5 right-3.5 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            aria-label="Close popup"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-2.5 mt-3 pt-3 border-t border-slate-100 dark:border-slate-800">
          <Link
            href={`/water/${source.slug}`}
            className="flex items-center justify-center gap-1.5 h-9 rounded-xl bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 transition-colors shadow-xs"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            <span>View Details</span>
          </Link>
          <button
            onClick={handleDirections}
            className="flex items-center justify-center gap-1.5 h-9 rounded-xl border border-blue-200 dark:border-blue-900/60 bg-blue-50/70 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 text-xs font-semibold hover:bg-blue-100/70 transition-colors cursor-pointer"
          >
            <Navigation className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
            <span>Directions</span>
          </button>
        </div>
      </div>
    );
  }

  // Desktop Floating Card / Left Card (Mockup 1 & 5)
  return (
    <div className="absolute bottom-6 left-6 z-[1000] w-96 max-w-[calc(100vw-3rem)] rounded-3xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-200 dark:border-slate-800 p-5 shadow-2xl transition-all animate-in zoom-in-95">
      <div className="relative w-full h-44 rounded-2xl overflow-hidden mb-4 bg-gradient-to-br from-blue-600 to-slate-900 border border-slate-100 dark:border-slate-800 flex items-center justify-center">
        {rawPhoto && !imageError ? (
          <Image
            src={rawPhoto}
            alt={source.name}
            fill
            unoptimized
            onError={() => setImageError(true)}
            className="object-cover"
          />
        ) : (
          <div className="flex flex-col items-center justify-center gap-2 text-white/90">
            <Droplet className="h-10 w-10 text-blue-300 animate-pulse" />
            <span className="text-xs font-medium tracking-wide text-blue-100">{source.category}</span>
          </div>
        )}
        <button
          onClick={onClose}
          className="absolute top-2.5 right-2.5 p-1.5 rounded-full bg-slate-900/60 hover:bg-slate-900/80 text-white backdrop-blur-xs transition-colors z-10"
          aria-label="Close details"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between gap-2">
          <h3 className="font-bold text-lg text-slate-900 dark:text-white truncate">
            {source.name}
          </h3>
          <span className={cn("text-xs font-semibold px-2.5 py-1 rounded-full inline-flex items-center gap-1.5 shrink-0", statusBadge.bg)}>
            <span className={cn("w-2 h-2 rounded-full", statusBadge.dot)} />
            {source.availability_status === "Available" ? "Open" : source.availability_status}
          </span>
        </div>

        <div className="space-y-1 text-xs text-slate-600 dark:text-slate-400">
          <div className="flex items-center gap-2">
            <Droplet className="h-3.5 w-3.5 text-blue-500 shrink-0" />
            <span className="font-medium">{source.category}</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0" />
            <span>
              {source.address || (source.barangay ? `Barangay ${source.barangay}` : "Irosin, Sorsogon")}
            </span>
          </div>
        </div>

        {source.description && (
          <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed">
            {source.description}
          </p>
        )}

        {/* Primary Action Buttons (Mockup 1) */}
        <div className="grid grid-cols-2 gap-3 pt-2">
          <Link
            href={`/water/${source.slug}`}
            className="flex items-center justify-center gap-2 h-10 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition-colors shadow-xs"
          >
            <span>View Details</span>
          </Link>
          <button
            onClick={handleDirections}
            className="flex items-center justify-center gap-2 h-10 rounded-xl border border-blue-200 dark:border-blue-900/60 bg-blue-50/60 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 hover:bg-blue-100/70 text-xs font-semibold transition-colors cursor-pointer"
          >
            <Navigation className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
            <span>Get Directions</span>
          </button>
        </div>

        {/* Secondary Tool Actions (Mockup 5) */}
        <div className="flex items-center justify-around pt-3 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400">
          <button
            onClick={() => toggleSavedSource(source.id)}
            className="flex items-center gap-1.5 hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer"
          >
            <Bookmark className={cn("h-4 w-4", saved ? "fill-blue-500 text-blue-500" : "")} />
            <span>{saved ? "Saved" : "Save"}</span>
          </button>
          <button
            onClick={handleShare}
            className="flex items-center gap-1.5 hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer"
          >
            <Share2 className="h-4 w-4" />
            <span>Share</span>
          </button>
          <Link
            href={`/report/${source.id}`}
            className="flex items-center gap-1.5 hover:text-rose-600 dark:hover:text-rose-400 transition-colors"
          >
            <AlertTriangle className="h-4 w-4" />
            <span>Report</span>
          </Link>
          <Link
            href={`/chat/${source.id}`}
            className="flex items-center gap-1.5 hover:text-teal-600 dark:hover:text-teal-400 transition-colors"
          >
            <MessageSquare className="h-4 w-4" />
            <span>Chat</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
