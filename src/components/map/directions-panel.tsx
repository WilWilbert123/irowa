// src/components/map/directions-panel.tsx
"use client";

import React, { useState } from "react";
import {
  Navigation,
  Clock,
  MapPin,
  X,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Compass,
  AlertCircle,
  Mountain,
  Footprints,
  Bike,
  Car,
  Minimize2,
  Maximize2,
  Minus,
  LocateFixed,
  Radio,
} from "lucide-react";
import { InAppRoute, TravelMode, formatDistance, formatDurationMinutes } from "@/lib/map/map-utils";
import { cn } from "@/lib/utils";

interface DirectionsPanelProps {
  route: InAppRoute;
  onClose: () => void;
  isMobile?: boolean;
  currentMode?: TravelMode;
  onModeChange?: (mode: TravelMode) => void;
  onRecenter?: () => void;
  isTrackingLive?: boolean;
}

export function DirectionsPanel({
  route,
  onClose,
  isMobile = false,
  currentMode = "motorcycle",
  onModeChange,
  onRecenter,
  isTrackingLive = true,
}: DirectionsPanelProps) {
  const [isMinimized, setIsMinimized] = useState(false);
  const [showSteps, setShowSteps] = useState(false);

  const activeMode = currentMode || route.travelMode || "motorcycle";

  const getModeIcon = (mode: TravelMode, className = "w-4 h-4") => {
    switch (mode) {
      case "walking":
        return <Footprints className={className} />;
      case "driving":
        return <Car className={className} />;
      case "motorcycle":
      default:
        return <Bike className={className} />;
    }
  };

  const getModeLabel = (mode: TravelMode) => {
    switch (mode) {
      case "walking":
        return "Walking";
      case "driving":
        return "Car";
      case "motorcycle":
      default:
        return "Motor";
    }
  };

  // 1. Minimized Floating Bottom Pill Bar
  if (isMinimized) {
    return (
      <div
        className={cn(
          "z-[1000] bg-slate-900/95 dark:bg-slate-900/95 backdrop-blur-md text-white border border-slate-700/80 shadow-2xl transition-all animate-in fade-in slide-in-from-bottom-3 duration-200",
          isMobile
            ? "absolute bottom-20 left-3 right-3 rounded-2xl p-2.5"
            : "absolute bottom-6 left-6 w-96 rounded-2xl p-3"
        )}
      >
        <div className="flex items-center justify-between gap-2.5">
          {/* Tapping the summary expands the panel back up */}
          <button
            type="button"
            onClick={() => setIsMinimized(false)}
            className="flex-1 min-w-0 flex items-center gap-2.5 text-left cursor-pointer group"
          >
            <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-md group-hover:scale-105 transition-transform">
              {getModeIcon(activeMode, "w-4 h-4")}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-xs truncate max-w-[140px] sm:max-w-[180px]">
                  {route.destinationName}
                </span>
                {isTrackingLive && (
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-400 text-[9px] font-bold border border-emerald-500/30 shrink-0">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    LIVE
                  </span>
                )}
              </div>
              <div className="text-[11px] font-mono text-emerald-400 font-bold flex items-center gap-1.5">
                <span>{formatDurationMinutes(route.durationMinutes)}</span>
                <span className="text-slate-500">•</span>
                <span className="text-slate-300">{formatDistance(route.distanceKm)}</span>
                <span className="text-slate-500">•</span>
                <span className="text-blue-400 uppercase text-[10px]">{getModeLabel(activeMode)}</span>
              </div>
            </div>
          </button>

          {/* Action buttons */}
          <div className="flex items-center gap-1 shrink-0">
            {onRecenter && (
              <button
                type="button"
                onClick={onRecenter}
                title="Recenter on my location"
                className="p-1.5 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <LocateFixed className="w-4 h-4 text-blue-400" />
              </button>
            )}
            <button
              type="button"
              onClick={() => setIsMinimized(false)}
              title="Expand directions panel"
              className="px-2 py-1 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1 transition-all cursor-pointer shadow-xs"
            >
              <ChevronUp className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Details</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              title="Exit directions"
              className="p-1.5 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 2. Full Expanded Directions Card
  return (
    <div
      className={cn(
        "z-[1000] bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-200 dark:border-slate-800 shadow-2xl transition-all animate-in slide-in-from-bottom-5 duration-200 flex flex-col",
        isMobile
          ? "absolute bottom-20 left-3 right-3 rounded-3xl p-4 max-h-[75vh] overflow-hidden"
          : "absolute bottom-6 left-6 w-96 max-w-[calc(100vw-3rem)] rounded-3xl p-5 max-h-[85vh] overflow-hidden"
      )}
    >
      {/* Route Header */}
      <div className="flex items-start justify-between gap-2 mb-3 shrink-0">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-md">
            <Navigation className="h-4 w-4 sm:h-5 sm:w-5" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] sm:text-[11px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider block">
                In-App Navigation
              </span>
              {isTrackingLive && (
                <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 text-[9px] font-bold border border-emerald-200 dark:border-emerald-800">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Live GPS
                </span>
              )}
            </div>
            <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white truncate">
              {route.destinationName}
            </h3>
          </div>
        </div>

        {/* Top Right Controls: Minimize & Close */}
        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            onClick={() => setIsMinimized(true)}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            title="Minimize panel (keeps navigation active)"
            aria-label="Minimize directions"
          >
            <Minus className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors cursor-pointer"
            title="Exit directions"
            aria-label="Close directions"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Travel Mode Selector: Walking, Motor, Car with Estimated Minutes */}
      <div className="shrink-0 mb-3">
        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
          Select Travel Mode
        </label>
        <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-2xl border border-slate-200/80 dark:border-slate-700/60">
          {/* Walking */}
          <button
            type="button"
            onClick={() => onModeChange && onModeChange("walking")}
            className={cn(
              "flex flex-col items-center justify-center py-2 px-1 rounded-xl text-center transition-all cursor-pointer",
              activeMode === "walking"
                ? "bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm font-bold border border-slate-200/60 dark:border-slate-700"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            )}
          >
            <div className="flex items-center gap-1">
              <Footprints className="w-3.5 h-3.5" />
              <span className="text-xs">Walking</span>
            </div>
            <span
              className={cn(
                "text-[10px] font-mono mt-0.5",
                activeMode === "walking" ? "font-bold text-blue-600 dark:text-blue-400" : "text-slate-400"
              )}
            >
              ~{route.modeDurations?.walking ?? route.durationMinutes}m
            </span>
          </button>

          {/* Motorcycle (Motor) */}
          <button
            type="button"
            onClick={() => onModeChange && onModeChange("motorcycle")}
            className={cn(
              "flex flex-col items-center justify-center py-2 px-1 rounded-xl text-center transition-all cursor-pointer",
              activeMode === "motorcycle"
                ? "bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm font-bold border border-slate-200/60 dark:border-slate-700"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            )}
          >
            <div className="flex items-center gap-1">
              <Bike className="w-3.5 h-3.5" />
              <span className="text-xs">Motor</span>
            </div>
            <span
              className={cn(
                "text-[10px] font-mono mt-0.5",
                activeMode === "motorcycle" ? "font-bold text-blue-600 dark:text-blue-400" : "text-slate-400"
              )}
            >
              ~{route.modeDurations?.motorcycle ?? route.durationMinutes}m
            </span>
          </button>

          {/* Car / Driving */}
          <button
            type="button"
            onClick={() => onModeChange && onModeChange("driving")}
            className={cn(
              "flex flex-col items-center justify-center py-2 px-1 rounded-xl text-center transition-all cursor-pointer",
              activeMode === "driving"
                ? "bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm font-bold border border-slate-200/60 dark:border-slate-700"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            )}
          >
            <div className="flex items-center gap-1">
              <Car className="w-3.5 h-3.5" />
              <span className="text-xs">Car</span>
            </div>
            <span
              className={cn(
                "text-[10px] font-mono mt-0.5",
                activeMode === "driving" ? "font-bold text-blue-600 dark:text-blue-400" : "text-slate-400"
              )}
            >
              ~{route.modeDurations?.driving ?? route.durationMinutes}m
            </span>
          </button>
        </div>
      </div>

      {/* Scrollable details container */}
      <div className="flex-1 overflow-y-auto space-y-2.5 pr-0.5 min-h-0">
        {/* Estimated Time & Total Distance KPI cards */}
        <div className="grid grid-cols-2 gap-2 bg-slate-50 dark:bg-slate-800/60 rounded-2xl p-3 border border-slate-100 dark:border-slate-800 text-xs">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-emerald-500 shrink-0" />
            <div>
              <div className="text-slate-400 text-[10px] uppercase font-semibold">
                Est. {getModeLabel(activeMode)} Time
              </div>
              <div className="font-bold text-slate-900 dark:text-white text-sm">
                {formatDurationMinutes(route.durationMinutes)}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Compass className="h-4 w-4 text-blue-500 shrink-0" />
            <div>
              <div className="text-slate-400 text-[10px] uppercase font-semibold">Remaining Distance</div>
              <div className="font-bold text-slate-900 dark:text-white text-sm">
                {formatDistance(route.distanceKm)}
              </div>
            </div>
          </div>
        </div>

        {/* Origin / Destination Waypoints */}
        <div className="space-y-2 text-xs text-slate-600 dark:text-slate-300 px-1 bg-slate-50/70 dark:bg-slate-800/40 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0 ring-4 ring-emerald-100 dark:ring-emerald-950 animate-pulse" />
            <span className="truncate">
              <span className="text-slate-400">Start: </span>
              <strong className="text-emerald-700 dark:text-emerald-400 font-bold">{route.originName}</strong>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-600 shrink-0 ring-4 ring-blue-100 dark:ring-blue-950" />
            <span className="truncate">
              <span className="text-slate-400">Destination: </span>
              <strong className="text-slate-900 dark:text-white font-bold">{route.destinationName}</strong>
            </span>
          </div>
        </div>

        {/* Off-Road / Mountain Trail Alert if Destination is off paved roads */}
        {route.isOffRoad && (
          <div className="flex items-center gap-2 px-3 py-2 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-300 font-medium">
            <Mountain className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
            <span>
              Includes off-road trail (~{route.offRoadDistanceKm && route.offRoadDistanceKm < 1 ? `${Math.round(route.offRoadDistanceKm * 1000)}m` : `${route.offRoadDistanceKm}km`}) from main road to source.
            </span>
          </div>
        )}

        {/* Turn-by-Turn Collapsible Steps */}
        {route.steps && route.steps.length > 0 && (
          <div className="border-t border-slate-100 dark:border-slate-800 pt-2">
            <button
              type="button"
              onClick={() => setShowSteps(!showSteps)}
              className="flex items-center justify-between w-full text-xs font-semibold text-slate-700 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 py-1 transition-colors cursor-pointer"
            >
              <span>Turn-by-Turn Steps ({route.steps.length})</span>
              {showSteps ? (
                <ChevronDown className="h-4 w-4 text-slate-400" />
              ) : (
                <ChevronRight className="h-4 w-4 text-slate-400" />
              )}
            </button>

            {showSteps && (
              <div className="max-h-44 overflow-y-auto mt-2 space-y-2 pr-1 text-xs">
                {route.steps.map((step, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-slate-600 dark:text-slate-400">
                    <span className="font-bold text-blue-600 dark:text-blue-400 shrink-0 text-[11px] w-4">
                      {idx + 1}.
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-slate-800 dark:text-slate-200 leading-snug">{step.instruction}</p>
                      {step.distanceMeters > 0 && (
                        <span className="text-[10px] text-slate-400">
                          {step.distanceMeters >= 1000
                            ? `${(step.distanceMeters / 1000).toFixed(1)} km`
                            : `${step.distanceMeters} m`}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer Actions: Recenter & Clear */}
      <div className="shrink-0 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2">
        {onRecenter && (
          <button
            type="button"
            onClick={onRecenter}
            className="h-9 px-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            title="Center map on your current location"
          >
            <LocateFixed className="w-3.5 h-3.5 text-blue-500" />
            <span className="hidden sm:inline">My GPS</span>
          </button>
        )}
        <button
          type="button"
          onClick={onClose}
          className="flex-1 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <span>Exit Directions / Clear Route</span>
        </button>
      </div>
    </div>
  );
}
