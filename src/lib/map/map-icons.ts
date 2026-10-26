// src/lib/map/map-icons.ts
import L from "leaflet";
import { CATEGORY_COLORS } from "../utils/constants";
import { WaterCategory } from "@/types/database.types";

export function createCategoryDivIcon(
  category: WaterCategory | string,
  isSelected: boolean = false,
  status: string = "Available"
): L.DivIcon {
  const colorDef = CATEGORY_COLORS[category] || CATEGORY_COLORS["Other"];
  const isUnavailable = status === "Temporarily Unavailable";
  const markerColor = isUnavailable ? "#e11d48" : colorDef.marker;

  const iconSvg = getCategorySvgPath(category);

  const html = `
    <div class="relative flex items-center justify-center transition-transform duration-200 ${
      isSelected ? "scale-125 z-50" : "hover:scale-110"
    }">
      <div class="w-9 h-9 rounded-full flex items-center justify-center shadow-lg border-2 border-white dark:border-slate-800"
           style="background-color: ${markerColor}">
        <svg class="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          ${iconSvg}
        </svg>
      </div>
      <div class="w-2 h-2 rounded-full absolute -bottom-1 transform translate-y-1/2" style="background-color: ${markerColor}"></div>
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

function getCategorySvgPath(category: string): string {
  switch (category) {
    case "Waterfall":
      return '<path d="M12 2v20M8 6c0 4-2 7-6 8M16 6c0 4 2 7 6 8M8 14c0 3-1 5-4 6M16 14c0 3 1 5 4 6"/>';
    case "Spring":
      return '<path d="M12 2a7 7 0 0 0-7 7c0 5 7 13 7 13s7-8 7-13a7 7 0 0 0-7-7z"/><circle cx="12" cy="9" r="2.5"/>';
    case "River":
      return '<path d="M2 6c4-2 6 2 10 0s6 2 10 0M2 12c4-2 6 2 10 0s6 2 10 0M2 18c4-2 6 2 10 0s6 2 10 0"/>';
    case "Resort":
      return '<path d="M18 10h-1.26A8 8 0 1 0 9 20h9a4 4 0 0 0 0-8z"/>';
    case "Water Refilling Station":
      return '<path d="M6 2h12v4H6zM4 6h16v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6z"/><path d="M10 12h4M12 10v4"/>';
    case "Deep Well":
      return '<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>';
    case "Community Water Point":
    case "Public Water Source":
      return '<path d="M12 2v6M12 18v4M4.93 4.93l4.24 4.24M14.83 14.83l4.24 4.24M2 12h6M18 12h4M4.93 19.07l4.24-4.24M14.83 9.17l4.24-4.24"/>';
    default:
      return '<circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>';
  }
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
