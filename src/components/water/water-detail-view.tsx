// src/components/water/water-detail-view.tsx
"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  MapPin,
  Clock,
  Phone,
  Navigation,
  MessageSquare,
  Bookmark,
  Share2,
  AlertTriangle,
  ShieldCheck,
  AlertCircle,
  ArrowLeft,
  Calendar,
  CheckCircle2,
} from "lucide-react";
import { WaterSourceWithPhotos } from "@/types/water";
import { PhotoGallery } from "./photo-gallery";
import { AVAILABILITY_BADGES, CATEGORY_COLORS } from "@/lib/utils/constants";
import { getDirectionsUrl } from "@/lib/map/map-utils";
import { formatDate, isVerificationStale } from "@/lib/utils/date-utils";
import { useVisitor } from "@/contexts/visitor-context";
import { cn } from "@/lib/utils";

interface WaterDetailViewProps {
  source: WaterSourceWithPhotos;
}

export function WaterDetailView({ source }: WaterDetailViewProps) {
  const { toggleSavedSource, isSaved } = useVisitor();
  const saved = isSaved(source.id);
  const [copied, setCopied] = useState(false);

  const statusBadge =
    AVAILABILITY_BADGES[source.availability_status] || AVAILABILITY_BADGES["Available"];
  const colorDef =
    CATEGORY_COLORS[source.category] || CATEGORY_COLORS["Other"];

  const directionsUrl = getDirectionsUrl(source.latitude, source.longitude, source.name);
  const isStale = isVerificationStale(source.last_verified_at);

  const handleShare = () => {
    if (typeof navigator !== "undefined" && navigator.share) {
      navigator.share({
        title: `${source.name} - IroWa`,
        text: `Check out ${source.name} on the IroWa Irosin Water Resources Map!`,
        url: window.location.href,
      }).catch(() => {});
    } else if (typeof navigator !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20">
      {/* Top Navigation */}
      <div className="flex items-center justify-between">
        <Link
          href="/water"
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Resources</span>
        </Link>

        <div className="flex items-center gap-2">
          <button
            onClick={() => toggleSavedSource(source.id)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <Bookmark className={cn("h-4 w-4", saved ? "fill-blue-500 text-blue-500" : "")} />
            <span>{saved ? "Saved" : "Save"}</span>
          </button>
          <button
            onClick={handleShare}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <Share2 className="h-4 w-4" />
            <span>{copied ? "Copied!" : "Share"}</span>
          </button>
        </div>
      </div>

      {/* Photo Gallery */}
      <PhotoGallery photos={source.photos} name={source.name} />

      {/* Main Info Card */}
      <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2.5 mb-2">
              <span
                className={cn(
                  "px-3 py-1 rounded-full text-xs font-semibold border",
                  colorDef.bg,
                  colorDef.text,
                  colorDef.border
                )}
              >
                {source.category}
              </span>

              <span
                className={cn(
                  "text-xs font-semibold px-2.5 py-1 rounded-full inline-flex items-center gap-1.5",
                  statusBadge.bg
                )}
              >
                <span className={cn("w-2 h-2 rounded-full", statusBadge.dot)} />
                {source.availability_status}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              {source.name}
            </h1>

            <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 mt-2">
              <MapPin className="h-4 w-4 text-slate-400 shrink-0" />
              <span>
                {source.address || (source.barangay ? `Barangay ${source.barangay}, Irosin, Sorsogon` : "Irosin, Sorsogon")}
              </span>
            </div>
          </div>

          {/* Quick Action Links */}
          <div className="flex items-center gap-3 shrink-0">
            <Link
              href={`/home?selected=${source.id}`}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm transition-colors shadow-sm"
            >
              <Navigation className="h-4 w-4" />
              <span>In-App Directions</span>
            </Link>
            <Link
              href={`/chat/${source.id}`}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800 font-semibold text-sm hover:bg-teal-100 dark:hover:bg-teal-900/40 transition-colors"
            >
              <MessageSquare className="h-4 w-4" />
              <span>Group Chat</span>
            </Link>
          </div>
        </div>

        {/* Description */}
        {source.description && (
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-2">
              About This Water Source
            </h2>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed text-sm">
              {source.description}
            </p>
          </div>
        )}

        {/* Essential Operational Details Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-start gap-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
            <Clock className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />
            <div>
              <span className="text-xs font-semibold text-slate-400 block">Operating Hours</span>
              <span className="text-sm font-medium text-slate-800 dark:text-slate-200">
                {source.operating_hours || "Open to community / Check locally"}
              </span>
            </div>
          </div>

          <div className="flex items-start gap-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
            <Phone className="h-5 w-5 text-teal-500 shrink-0 mt-0.5" />
            <div>
              <span className="text-xs font-semibold text-slate-400 block">Contact & Tourism Desk</span>
              <span className="text-sm font-medium text-slate-800 dark:text-slate-200">
                {source.contact_information || "MDRRMO / Barangay Local Committee"}
              </span>
            </div>
          </div>

          <div className="flex items-start gap-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
            <Calendar className="h-5 w-5 text-indigo-500 shrink-0 mt-0.5" />
            <div>
              <span className="text-xs font-semibold text-slate-400 block">Last Field Verification</span>
              <span className="text-sm font-medium text-slate-800 dark:text-slate-200">
                {formatDate(source.last_verified_at)}
              </span>
            </div>
          </div>

          <div className="flex items-start gap-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
            <MapPin className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
            <div>
              <span className="text-xs font-semibold text-slate-400 block">GPS Coordinates</span>
              <span className="text-sm font-mono font-medium text-slate-800 dark:text-slate-200">
                {source.latitude.toFixed(4)}° N, {source.longitude.toFixed(4)}° E
              </span>
            </div>
          </div>
        </div>

        {/* Safety & Potability Disclaimer (Required in Prompt 7) */}
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-900 dark:text-amber-200 space-y-1">
          <div className="flex items-center gap-2 font-bold text-amber-800 dark:text-amber-300">
            <AlertCircle className="h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
            <span>Water Safety & Potability Notice</span>
          </div>
          <p className="leading-relaxed">
            Reported water availability does not certify that natural river, spring, or well water is potable or safe for direct consumption without boiling or filtration. Always verify safety with the Municipal Health Office before drinking untreated water.
          </p>
        </div>

        {/* Report Inaccuracy Footer Action */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <span>Noticed inaccurate coordinates or dry conditions?</span>
          <Link
            href={`/report/${source.id}`}
            className="inline-flex items-center gap-1.5 text-rose-600 dark:text-rose-400 font-semibold hover:underline"
          >
            <AlertTriangle className="h-3.5 w-3.5" />
            <span>Submit a community report</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
