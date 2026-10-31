// src/components/map/directions-panel.tsx
"use client";

import React, { useState } from "react";
import { Navigation, Clock, MapPin, X, ChevronRight, ChevronDown, Compass, AlertCircle, Mountain } from "lucide-react";
import { InAppRoute } from "@/lib/map/map-utils";
import { cn } from "@/lib/utils";

interface DirectionsPanelProps {
  route: InAppRoute;
  onClose: () => void;
  isMobile?: boolean;
}

export function DirectionsPanel({ route, onClose, isMobile = false }: DirectionsPanelProps) {
  const [showSteps, setShowSteps] = useState(false);

  return (
    <div
      className={cn(
        "z-[1000] bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-200 dark:border-slate-800 shadow-2xl transition-all animate-in slide-in-from-bottom-5",
        isMobile
          ? "absolute bottom-20 left-3 right-3 rounded-3xl p-4"
          : "absolute bottom-6 left-6 w-96 max-w-[calc(100vw-3rem)] rounded-3xl p-5"
      )}
    >
      {/* Route Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-md">
            <Navigation className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <span className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider block">
              In-App Directions
            </span>
            <h3 className="font-bold text-base text-slate-900 dark:text-white truncate">
              {route.destinationName}
            </h3>
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          aria-label="Close directions"
        >
          <X className="h-4 w-4" />
        </button>
      </div>


      <div className="grid grid-cols-2 gap-2 bg-slate-50 dark:bg-slate-800/60 rounded-2xl p-3 mb-3 border border-slate-100 dark:border-slate-800 text-xs">
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-emerald-500 shrink-0" />
          <div>
            <div className="text-slate-400 text-[10px] uppercase font-semibold">Estimated Time</div>
            <div className="font-bold text-slate-900 dark:text-white text-sm">
              ~{route.durationMinutes} mins
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Compass className="h-4 w-4 text-blue-500 shrink-0" />
          <div>
            <div className="text-slate-400 text-[10px] uppercase font-semibold">Total Distance</div>
            <div className="font-bold text-slate-900 dark:text-white text-sm">
              {route.distanceKm} km
            </div>
          </div>
        </div>
      </div>

      {/* Origin / Destination Waypoints */}
      <div className="space-y-2 text-xs text-slate-600 dark:text-slate-300 mb-3 px-1 bg-slate-50/70 dark:bg-slate-800/40 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800">
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
        <div className="flex items-center gap-2 px-3 py-2 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-300 font-medium mb-3">
          <Mountain className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
          <span>
            Includes off-road trail (~{route.offRoadDistanceKm && route.offRoadDistanceKm < 1 ? `${Math.round(route.offRoadDistanceKm * 1000)}m` : `${route.offRoadDistanceKm}km`}) from main road to source.
          </span>
        </div>
      )}

      {/* Turn-by-Turn Collapsible Steps */}
      {route.steps && route.steps.length > 0 && (
        <div className="border-t border-slate-100 dark:border-slate-800 pt-2 mb-3">
          <button
            onClick={() => setShowSteps(!showSteps)}
            className="flex items-center justify-between w-full text-xs font-semibold text-slate-700 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 py-1 transition-colors"
          >
            <span>Turn-by-Turn Steps ({route.steps.length})</span>
            {showSteps ? (
              <ChevronDown className="h-4 w-4 text-slate-400" />
            ) : (
              <ChevronRight className="h-4 w-4 text-slate-400" />
            )}
          </button>

          {showSteps && (
            <div className="max-h-48 overflow-y-auto mt-2 space-y-2 pr-1 text-xs">
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

      {/* Clear Action */}
      <button
        onClick={onClose}
        className="w-full h-9 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
      >
        <span>Exit Directions / Clear Route</span>
      </button>
    </div>
  );
}
