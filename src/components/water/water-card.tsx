// src/components/water/water-card.tsx
"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { MapPin, Navigation, MessageSquare, Bookmark, ShieldCheck, AlertCircle, Droplet } from "lucide-react";
import { WaterSourceWithPhotos } from "@/types/water";
import { AVAILABILITY_BADGES, CATEGORY_COLORS } from "@/lib/utils/constants";
import { formatDistance, getDirectionsUrl } from "@/lib/map/map-utils";
import { getPublicStorageUrl } from "@/lib/utils/image-utils";
import { isVerificationStale } from "@/lib/utils/date-utils";
import { useVisitor } from "@/contexts/visitor-context";
import { cn } from "@/lib/utils";

export function WaterCard({ source }: { source: WaterSourceWithPhotos }) {
  const { toggleSavedSource, isSaved } = useVisitor();
  const saved = isSaved(source.id);
  const [imgError, setImgError] = React.useState(false);

  const statusBadge =
    AVAILABILITY_BADGES[source.availability_status] || AVAILABILITY_BADGES["Available"];
  const colorDef =
    CATEGORY_COLORS[source.category] || CATEGORY_COLORS["Other"];

  const primaryPhoto =
    source.photos && source.photos.length > 0
      ? getPublicStorageUrl(source.photos[0].storage_path)
      : "/images/irosin-map-placeholder.svg";

  const directionsUrl = getDirectionsUrl(source.latitude, source.longitude, source.name);
  const isStale = isVerificationStale(source.last_verified_at);

  return (
    <div className="group rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col">
      {/* Image Header */}
      <div className="relative w-full h-48 bg-slate-100 dark:bg-slate-800 overflow-hidden">
        {!imgError && primaryPhoto ? (
          <Image
            src={primaryPhoto}
            alt={source.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            onError={() => setImgError(true)}
            unoptimized
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-blue-600/30 via-slate-800 to-teal-500/20 text-blue-300">
            <Droplet className="h-8 w-8 mb-1 text-blue-400" />
            <span className="text-xs font-semibold text-slate-300">{source.category}</span>
          </div>
        )}

        {/* Category Pill */}
        <div className="absolute top-3 left-3">
          <span
            className={cn(
              "px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-md border shadow-xs flex items-center gap-1.5",
              colorDef.bg,
              colorDef.text,
              colorDef.border
            )}
          >
            {source.category}
          </span>
        </div>

        {/* Save button */}
        <button
          onClick={(e) => {
            e.preventDefault();
            toggleSavedSource(source.id);
          }}
          className="absolute top-3 right-3 p-2 rounded-full bg-slate-900/60 hover:bg-slate-900/80 text-white backdrop-blur-xs transition-colors cursor-pointer"
          aria-label={saved ? "Remove from saved" : "Save location"}
        >
          <Bookmark className={cn("h-4 w-4", saved ? "fill-blue-400 text-blue-400" : "")} />
        </button>
      </div>

      {/* Body */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between gap-2 mb-2">
            <h3 className="font-bold text-base text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-1">
              <Link href={`/water/${source.slug}`}>{source.name}</Link>
            </h3>
            <span
              className={cn(
                "text-[11px] font-semibold px-2 py-0.5 rounded-full inline-flex items-center gap-1 shrink-0",
                statusBadge.bg
              )}
            >
              <span className={cn("w-1.5 h-1.5 rounded-full", statusBadge.dot)} />
              {source.availability_status}
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mb-2">
            <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0" />
            <span className="truncate">
              {source.address || (source.barangay ? `Brgy. ${source.barangay}, Irosin` : "Irosin, Sorsogon")}
            </span>
            {source.distance_km && (
              <span className="shrink-0 text-blue-600 dark:text-blue-400 font-medium">
                • {formatDistance(source.distance_km)}
              </span>
            )}
          </div>

          {source.description && (
            <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed mb-4">
              {source.description}
            </p>
          )}

          {/* Stale Warning if verification > 30 days */}
          {isStale && (
            <div className="flex items-center gap-1.5 text-[11px] text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 px-2 py-1 rounded-lg mb-3">
              <AlertCircle className="h-3 w-3 shrink-0" />
              <span>Needs recent re-verification</span>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
          <Link
            href={`/water/${source.slug}`}
            className="flex-1 py-2 text-center rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition-colors shadow-xs"
          >
            Details
          </Link>

          <a
            href={directionsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            title="Directions"
          >
            <Navigation className="h-4 w-4 text-blue-500" />
          </a>

          <Link
            href={`/chat/${source.id}`}
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            title="Discussion"
          >
            <MessageSquare className="h-4 w-4 text-teal-500" />
          </Link>
        </div>
      </div>
    </div>
  );
}
