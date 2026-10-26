// src/lib/utils/constants.ts

export const APP_NAME = "IroWa";
export const APP_TAGLINE = "Irosin Water Resources Map";
export const IROSIN_COORDINATES = {
  lat: 12.7042,
  lng: 124.0326,
};
export const DEFAULT_MAP_ZOOM = 13;

export const IROSIN_BARANGAYS = [
  "Bacolod",
  "Bagsangan",
  "Batang",
  "Bolos",
  "Buenavista",
  "Bulawan",
  "Carriedo",
  "Casiguran Road",
  "Cogon",
  "Gabao",
  "Gulang-Gulang",
  "Gumapia",
  "Liang",
  "Macawayan",
  "Mapaso",
  "Monbon",
  "Patag",
  "Salvacion",
  "San Agustin",
  "San Isidro",
  "San Julian",
  "San Pedro (Poblacion)",
  "San Roque",
  "Santa Cruz",
  "Santo Domingo",
  "Tabon-Tabon",
  "Tinampo",
  "Tongdol",
] as const;

export const WATER_CATEGORIES = [
  "public_water_source",
  "spring",
  "river",
  "waterfall",
  "resort",
  "water_refilling_station",
  "deep_well",
  "community_water_point",
  "other",
] as const;

export const AVAILABILITY_STATUSES = [
  "available",
  "limited_supply",
  "temporarily_unavailable",
  "seasonal",
  "unknown",
] as const;

export const VERIFICATION_STATUSES = [
  "verified",
  "unverified",
  "stale",
] as const;

export const CATEGORY_LABELS: Record<string, string> = {
  "public_water_source": "Public Water Source",
  "spring": "Spring",
  "river": "River",
  "waterfall": "Waterfall",
  "resort": "Resort",
  "water_refilling_station": "Water Refilling Station",
  "deep_well": "Deep Well",
  "community_water_point": "Community Water Point",
  "other": "Other",
  "Public Water Source": "Public Water Source",
  "Spring": "Spring",
  "River": "River",
  "Waterfall": "Waterfall",
  "Resort": "Resort",
  "Water Refilling Station": "Water Refilling Station",
  "Deep Well": "Deep Well",
  "Community Water Point": "Community Water Point",
  "Other": "Other",
};

export const AVAILABILITY_STATUS_LABELS: Record<string, string> = {
  "available": "Available",
  "limited_supply": "Limited Supply",
  "temporarily_unavailable": "Temporarily Unavailable",
  "seasonal": "Seasonal",
  "unknown": "Unknown",
  "Available": "Available",
  "Limited Supply": "Limited Supply",
  "Temporarily Unavailable": "Temporarily Unavailable",
  "Seasonal": "Seasonal",
  "Unknown": "Unknown",
};

export const REPORT_TYPE_LABELS: Record<string, string> = {
  "incorrect_location": "Incorrect Location",
  "no_longer_exists": "Resource No Longer Exists",
  "incorrect_availability": "Incorrect Availability",
  "duplicate_marker": "Duplicate Marker",
  "incorrect_information": "Incorrect Information",
  "safety_concern": "Potential Safety Concern",
  "inappropriate_photo": "Inappropriate Photo/Content",
  "other": "Other Concern",
  "Incorrect location": "Incorrect Location",
  "Resource no longer exists": "Resource No Longer Exists",
  "Incorrect availability": "Incorrect Availability",
  "Duplicate marker": "Duplicate Marker",
  "Incorrect information": "Incorrect Information",
  "Potential safety concern": "Potential Safety Concern",
  "Inappropriate photo or content": "Inappropriate Photo/Content",
  "Other": "Other",
};

export const CATEGORY_COLORS: Record<string, { bg: string; text: string; border: string; marker: string }> = {
  "Waterfall": { bg: "bg-emerald-500/10 dark:bg-emerald-500/20", text: "text-emerald-700 dark:text-emerald-300", border: "border-emerald-500/30", marker: "#10b981" },
  "Spring": { bg: "bg-teal-500/10 dark:bg-teal-500/20", text: "text-teal-700 dark:text-teal-300", border: "border-teal-500/30", marker: "#14b8a6" },
  "River": { bg: "bg-blue-500/10 dark:bg-blue-500/20", text: "text-blue-700 dark:text-blue-300", border: "border-blue-500/30", marker: "#3b82f6" },
  "Resort": { bg: "bg-purple-500/10 dark:bg-purple-500/20", text: "text-purple-700 dark:text-purple-300", border: "border-purple-500/30", marker: "#a855f7" },
  "Water Refilling Station": { bg: "bg-cyan-500/10 dark:bg-cyan-500/20", text: "text-cyan-700 dark:text-cyan-300", border: "border-cyan-500/30", marker: "#06b6d4" },
  "Deep Well": { bg: "bg-amber-500/10 dark:bg-amber-500/20", text: "text-amber-700 dark:text-amber-300", border: "border-amber-500/30", marker: "#f59e0b" },
  "Community Water Point": { bg: "bg-indigo-500/10 dark:bg-indigo-500/20", text: "text-indigo-700 dark:text-indigo-300", border: "border-indigo-500/30", marker: "#6366f1" },
  "Public Water Source": { bg: "bg-sky-500/10 dark:bg-sky-500/20", text: "text-sky-700 dark:text-sky-300", border: "border-sky-500/30", marker: "#0ea5e9" },
  "Other": { bg: "bg-slate-500/10 dark:bg-slate-500/20", text: "text-slate-700 dark:text-slate-300", border: "border-slate-500/30", marker: "#64748b" },
};

export const AVAILABILITY_BADGES: Record<string, { label: string; bg: string; text: string; dot: string }> = {
  "Available": { label: "Available", bg: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300", text: "text-emerald-600 dark:text-emerald-400", dot: "bg-emerald-500" },
  "Limited Supply": { label: "Limited Supply", bg: "bg-amber-500/10 text-amber-700 dark:text-amber-300", text: "text-amber-600 dark:text-amber-400", dot: "bg-amber-500" },
  "Temporarily Unavailable": { label: "Unavailable", bg: "bg-rose-500/10 text-rose-700 dark:text-rose-300", text: "text-rose-600 dark:text-rose-400", dot: "bg-rose-500" },
  "Seasonal": { label: "Seasonal", bg: "bg-purple-500/10 text-purple-700 dark:text-purple-300", text: "text-purple-600 dark:text-purple-400", dot: "bg-purple-500" },
  "Unknown": { label: "Status Unknown", bg: "bg-slate-500/10 text-slate-700 dark:text-slate-300", text: "text-slate-600 dark:text-slate-400", dot: "bg-slate-500" },
};
