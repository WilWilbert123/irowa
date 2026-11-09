// src/lib/map/map-icons.ts
import L from "leaflet";
import { WaterCategory } from "@/types/database.types";
import { getCircleIconPreset } from "./circle-icons";

export function createCategoryDivIcon(
  category: WaterCategory | string,
  isSelected: boolean = false,
  status: string = "Available",
  customIconId?: string,
  customColor?: string
): L.DivIcon {
  const preset = getCircleIconPreset(customIconId, category as string);
  const isUnavailable = status === "Temporarily Unavailable";
  const markerColor = isUnavailable ? "#e11d48" : (customColor || preset.defaultColor);
  const iconSvg = preset.svgPath;

  const html = `
    <div class="relative flex items-center justify-center transition-transform duration-200 ${
      isSelected ? "scale-125 z-50" : "hover:scale-110"
    }">
      <div class="w-9 h-9 rounded-full flex items-center justify-center shadow-lg border-2 border-white dark:border-slate-800 ring-2 ring-black/10"
           style="background-color: ${markerColor}">
        <svg class="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          ${iconSvg}
        </svg>
      </div>
      <div class="w-2 h-2 rounded-full absolute -bottom-1 transform translate-y-1/2 border border-white/60 shadow-xs" style="background-color: ${markerColor}"></div>
    </div>
  `;

  return L.divIcon({
    html,
    className: "custom-leaflet-marker",
    iconSize: [36, 42],
    iconAnchor: [18, 42],
    popupAnchor: [0, -42],
  });
}

export function createLocationMarkerIcon(): L.DivIcon {
  return L.divIcon({
    html: `
      <div class="relative flex items-center justify-center">
        <div class="w-4 h-4 bg-blue-500 rounded-full border-2 border-white shadow-md"></div>
        <div class="w-8 h-8 bg-blue-500/30 rounded-full animate-ping absolute"></div>
      </div>
    `,
    className: "user-location-marker",
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });
}

export function createStartLocationIcon(isGPS: boolean = true, label?: string): L.DivIcon {
  const displayLabel = label || (isGPS ? "START: You Are Here" : "START: Irosin Proper");
  const badgeBg = isGPS ? "bg-emerald-600" : "bg-blue-600";
  const pinBg = isGPS ? "bg-emerald-500" : "bg-blue-500";
  const pingBg = isGPS ? "bg-emerald-500/40" : "bg-blue-500/40";

  return L.divIcon({
    html: `
      <div class="relative flex flex-col items-center pointer-events-none -translate-y-8 select-none">
        <div class="px-2.5 py-1 rounded-full ${badgeBg} text-white font-bold text-[11px] shadow-xl whitespace-nowrap mb-1.5 flex items-center gap-1.5 border border-white/80 ring-2 ring-black/10">
          <span class="inline-block w-2 h-2 rounded-full bg-white animate-pulse"></span>
          <span>${displayLabel}</span>
        </div>
        <div class="relative flex items-center justify-center">
          <div class="w-7 h-7 ${pinBg} rounded-full border-2 border-white shadow-2xl flex items-center justify-center text-white z-10">
            <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="3"/>
              <path d="M12 2a10 10 0 1 0 10 10"/>
            </svg>
          </div>
          <div class="w-12 h-12 ${pingBg} rounded-full animate-ping absolute"></div>
        </div>
      </div>
    `,
    className: "start-location-marker",
    iconSize: [120, 60],
    iconAnchor: [60, 50],
  });
}

export function createPickerMarkerIcon(
  _label?: string,
  customIconId?: string,
  customColor?: string
): L.DivIcon {
  const preset = getCircleIconPreset(customIconId, "Public Water Source");
  const markerColor = customColor || preset.defaultColor || "#2563eb";
  const iconSvg = customIconId ? preset.svgPath : `
    <path d="M12 2a8 8 0 0 0-8 8c0 5.25 8 12 8 12s8-6.75 8-12a8 8 0 0 0-8-8z"/>
    <circle cx="12" cy="10" r="3"/>
  `;

  return L.divIcon({
    html: `
      <div class="relative flex flex-col items-center select-none cursor-grab active:cursor-grabbing -translate-y-5">
        <div class="relative flex items-center justify-center">
          <div class="w-10 h-10 rounded-full border-2 border-white shadow-2xl flex items-center justify-center ring-4 ring-black/10 transition-transform hover:scale-110 active:scale-95"
               style="background-color: ${markerColor}">
            <svg class="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              ${iconSvg}
            </svg>
          </div>
          <div class="w-14 h-14 rounded-full animate-ping absolute pointer-events-none opacity-25" style="background-color: ${markerColor}"></div>
        </div>
        <div class="w-2.5 h-2.5 rounded-full border border-white/80 shadow-md -mt-1" style="background-color: ${markerColor}"></div>
      </div>
    `,
    className: "location-picker-marker",
    iconSize: [44, 52],
    iconAnchor: [22, 48],
  });
}
