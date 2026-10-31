// src/components/map/map-controls.tsx
"use client";

import React, { useState } from "react";
import { Plus, Minus, Compass, Navigation, Layers, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface MapControlsProps {
  onZoomIn: () => void;
  onZoomOut: () => void;
  onRecenter: () => void;
  onLocateUser: () => void;
  onChangeTileLayer: (layerType: "standard" | "satellite" | "terrain") => void;
  currentLayer: "standard" | "satellite" | "terrain";
  isLocating?: boolean;
}

export function MapControls({
  onZoomIn,
  onZoomOut,
  onRecenter,
  onLocateUser,
  onChangeTileLayer,
  currentLayer,
  isLocating,
}: MapControlsProps) {
  const [layersOpen, setLayersOpen] = useState(false);

  return (
    <div className="absolute bottom-20 sm:bottom-6 right-3 sm:right-6 z-[1000] flex flex-col items-center gap-2">
      {/* Tile Layer Switcher */}
      <div className="relative">
        <button
          onClick={() => setLayersOpen(!layersOpen)}
          className="w-10 h-10 rounded-2xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-md shadow-md hover:shadow-xl border border-slate-200/90 dark:border-slate-800 flex items-center justify-center text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all duration-200 ease-out active:scale-90 cursor-pointer select-none"
          title="Change Map Tiles"
          aria-label="Change Map Tiles"
        >
          <Layers className="h-5 w-5" />
        </button>

        {layersOpen && (
          <div className="absolute bottom-12 right-0 w-36 rounded-2xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl shadow-2xl border border-slate-200/90 dark:border-slate-800 p-2 space-y-1 animate-in fade-in-0 zoom-in-95 slide-in-from-bottom-2 duration-200 ease-out origin-bottom-right">
            {[
              { id: "standard", label: "Street" },
              { id: "satellite", label: "Satellite" },
              { id: "terrain", label: "Terrain" },
            ].map((l) => (
              <button
                key={l.id}
                onClick={() => {
                  onChangeTileLayer(l.id as any);
                  setLayersOpen(false);
                }}
                className={cn(
                  "w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium text-left transition-all duration-150 ease-out active:scale-95 cursor-pointer select-none",
                  currentLayer === l.id
                    ? "bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 font-semibold"
                    : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                )}
              >
                <span>{l.label}</span>
                {currentLayer === l.id && <Check className="h-3.5 w-3.5" />}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Recenter on Irosin */}
      <button
        onClick={onRecenter}
        className="w-10 h-10 rounded-2xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-md shadow-md hover:shadow-xl border border-slate-200/90 dark:border-slate-800 flex items-center justify-center text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all duration-200 ease-out active:scale-90 cursor-pointer select-none"
        title="Center on Irosin"
        aria-label="Center on Irosin"
      >
        <Compass className="h-5 w-5" />
      </button>

      {/* Locate Me */}
      <button
        onClick={onLocateUser}
        disabled={isLocating}
        className="w-10 h-10 rounded-2xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-md shadow-md hover:shadow-xl border border-slate-200/90 dark:border-slate-800 flex items-center justify-center text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all duration-200 ease-out active:scale-90 cursor-pointer select-none disabled:opacity-50"
        title="Find My Location"
        aria-label="Find My Location"
      >
        <Navigation className={cn("h-5 w-5 text-blue-500", isLocating && "animate-pulse")} />
      </button>

      {/* Zoom In & Out */}
      <div className="flex flex-col rounded-2xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-md shadow-md border border-slate-200/90 dark:border-slate-800 overflow-hidden">
        <button
          onClick={onZoomIn}
          className="w-10 h-10 flex items-center justify-center text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-150 ease-out active:scale-90 border-b border-slate-200/90 dark:border-slate-800 cursor-pointer select-none"
          title="Zoom In"
          aria-label="Zoom In"
        >
          <Plus className="h-4 w-4" />
        </button>
        <button
          onClick={onZoomOut}
          className="w-10 h-10 flex items-center justify-center text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-150 ease-out active:scale-90 cursor-pointer select-none"
          title="Zoom Out"
          aria-label="Zoom Out"
        >
          <Minus className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
