// src/lib/map/circle-icons.ts

export interface CircleIconPreset {
  id: string;
  label: string;
  category: string;
  group: "nature" | "rivers" | "recreation" | "infrastructure" | "drinking" | "advisory";
  defaultColor: string;
  description: string;
  keywords: string[];
  svgPath: string;
}

export const CIRCLE_COLOR_SWATCHES = [
  { label: "Resort Purple", value: "#a855f7" },
  { label: "Deep Violet", value: "#7c3aed" },
  { label: "Magenta / Berry", value: "#ec4899" },
  { label: "Royal Blue", value: "#2563eb" },
  { label: "Deep Ocean Blue", value: "#1d4ed8" },
  { label: "Sky Blue", value: "#0284c7" },
  { label: "Cold Ice Blue", value: "#0ea5e9" },
  { label: "Beach Cyan", value: "#06b6d4" },
  { label: "Teal Green", value: "#0d9488" },
  { label: "Waterfall Emerald", value: "#10b981" },
  { label: "Forest Green", value: "#059669" },
  { label: "Lime / Spring Green", value: "#84cc16" },
  { label: "Amber / Golden", value: "#f59e0b" },
  { label: "Hot Thermal Orange", value: "#f97316" },
  { label: "Crimson Red", value: "#ef4444" },
  { label: "Rose Coral", value: "#e11d48" },
  { label: "Steel Slate", value: "#475569" },
  { label: "Charcoal Dark", value: "#1e293b" },
];

export const CIRCLE_ICON_PRESETS: CircleIconPreset[] = [
  // 1. Resort / Leisure
  {
    id: "resort",
    label: "Resort & Leisure",
    category: "Resort",
    group: "recreation",
    defaultColor: "#a855f7",
    description: "Beach umbrella / resort recreation dome",
    keywords: ["resort", "hotel", "cottage", "leisure", "vacation"],
    svgPath: '<path d="M18 10h-1.26A8 8 0 1 0 9 20h9a4 4 0 0 0 0-8z"/>',
  },
  // 2. Beach & Coastline
  {
    id: "beach",
    label: "Beach & Coast",
    category: "Resort",
    group: "recreation",
    defaultColor: "#06b6d4",
    description: "Palm tree and tropical coast waves",
    keywords: ["beach", "coast", "baybay", "seaside", "shore", "sand"],
    svgPath: '<path d="M13 8c0-2.76-2.24-5-5-5-1.5 0-2.83.66-3.74 1.71M3 13c1.5-1 3.5-1 5 0 1.5 1 3.5 1 5 0 1.5-1 3.5-1 5 0M2 17c1.5-1 3.5-1 5 0 1.5 1 3.5 1 5 0 1.5-1 3.5-1 5 0M12 3v14"/>',
  },
  // 3. Swimming Pool
  {
    id: "swimming_pool",
    label: "Swimming Pool",
    category: "Resort",
    group: "recreation",
    defaultColor: "#8b5cf6",
    description: "Swimming pool with ladder and water ripples",
    keywords: ["pool", "swimming", "bath", "dip", "waterpark"],
    svgPath: '<path d="M2 12h20M2 16h20M7 4v8M11 4v8M7 8h4M2 20c2 0 3-1 5-1s3 1 5 1 3-1 5-1 3 1 5 1"/>',
  },
  // 4. Tulay / River Bridge
  {
    id: "bridge",
    label: "Tulay / River Bridge",
    category: "River",
    group: "rivers",
    defaultColor: "#3b82f6",
    description: "River bridge deck with arches and water underneath",
    keywords: ["tulay", "bridge", "crossing", "overpass", "viaduct"],
    svgPath: '<path d="M3 14h18M3 10h18M6 10v4M18 10v4M6 14a6 6 0 0 1 12 0M2 18c2.5-1 5.5-1 8 0s5.5 1 8 0 3.5-1 4-1"/>',
  },
  // 5. River / Stream
  {
    id: "river",
    label: "River / Stream",
    category: "River",
    group: "rivers",
    defaultColor: "#2563eb",
    description: "Three parallel smooth flowing river waves",
    keywords: ["river", "salog", "stream", "cadacan", "creek", "tributary"],
    svgPath: '<path d="M2 6c4-2 6 2 10 0s6 2 10 0M2 12c4-2 6 2 10 0s6 2 10 0M2 18c4-2 6 2 10 0s6 2 10 0"/>',
  },
  // 6. Waterfall / Falls
  {
    id: "waterfall",
    label: "Waterfall / Falls",
    category: "Waterfall",
    group: "nature",
    defaultColor: "#10b981",
    description: "Cascading waterfall currents falling into basin",
    keywords: ["waterfall", "falls", "busay", "bitang", "cascade"],
    svgPath: '<path d="M12 2v20M8 6c0 4-2 7-6 8M16 6c0 4 2 7 6 8M8 14c0 3-1 5-4 6M16 14c0 3 1 5 4 6"/>',
  },
  // 7. Natural Spring (Sunburst rays)
  {
    id: "spring",
    label: "Natural Spring",
    category: "Spring",
    group: "nature",
    defaultColor: "#0284c7",
    description: "8-pointed sparkling sunburst spring water source",
    keywords: ["spring", "natural spring", "tubod", "batis", "source"],
    svgPath: '<path d="M12 2v6M12 16v6M4.93 4.93l4.24 4.24M14.83 14.83l4.24 4.24M2 12h6M16 12h6M4.93 19.07l4.24-4.24M14.83 9.17l4.24-4.24"/>',
  },
  // 8. Cold Spring / Batis
  {
    id: "cold_spring",
    label: "Cold Spring / Batis",
    category: "Spring",
    group: "nature",
    defaultColor: "#0ea5e9",
    description: "Crystal cool mountain aquifer with crisp water",
    keywords: ["cold", "cold spring", "san mateo", "chilled", "refreshing"],
    svgPath: '<path d="m10 4 4 16M4 10l16 4M14 4l-4 16M20 10 4 14M12 2v20M2 12h20"/>',
  },
  // 9. Hot Thermal Spring
  {
    id: "hot_spring",
    label: "Hot Spring / Thermal",
    category: "Spring",
    group: "nature",
    defaultColor: "#f97316",
    description: "Geothermal sulfuric hot pool with rising steam",
    keywords: ["hot", "hot spring", "mapaso", "thermal", "sulfur", "volcanic"],
    svgPath: '<path d="M7 6c0-2 2-3 2-5M12 6c0-2 2-3 2-5M17 6c0-2 2-3 2-5M2 14c2-1 4-1 6 0s4 1 6 0 4-1 6 0M3 18c2-1 4-1 6 0s4 1 6 0 4-1 6 0M4 22h16"/>',
  },
  // 10. Cave Spring
  {
    id: "cave_spring",
    label: "Cave Spring",
    category: "Spring",
    group: "nature",
    defaultColor: "#7c3aed",
    description: "Underground cavern pool and spring grotto",
    keywords: ["cave", "cavern", "kuweba", "underground", "grotto"],
    svgPath: '<path d="M3 21h18M3 21c0-8 4-15 9-15s9 7 9 15M7 21a5 5 0 0 1 10 0M10 14h4"/>',
  },
  // 11. Lake / Reservoir
  {
    id: "lake",
    label: "Lake / Reservoir",
    category: "River",
    group: "rivers",
    defaultColor: "#0369a1",
    description: "Calm inland lake, pond or water basin",
    keywords: ["lake", "reservoir", "dam", "lagoon", "danaw", "pond"],
    svgPath: '<path d="m3 14 4-6 4 4 4-8 6 10H3zM2 18c3-1 6-1 9 0s6 1 9 0M4 21c3-1 6-1 9 0s6 1 7 0"/>',
  },
  // 12. Deep Well / Artesian
  {
    id: "deep_well",
    label: "Deep Well / Artesian",
    category: "Deep Well",
    group: "infrastructure",
    defaultColor: "#6366f1",
    description: "Circular artesian borehole and well column",
    keywords: ["deep well", "artesian", "borehole", "well", "submersible"],
    svgPath: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="4"/><path d="M12 3v5M12 16v5M3 12h5M16 12h5"/>',
  },
  // 13. Hand Pump / Posohan
  {
    id: "well_pump",
    label: "Hand Pump (Posohan)",
    category: "Public Water Source",
    group: "infrastructure",
    defaultColor: "#059669",
    description: "Traditional manual cast-iron lever pump (posohan)",
    keywords: ["poso", "posohan", "hand pump", "manual pump", "lever pump"],
    svgPath: '<path d="M7 21h10M10 21V9h4v12M14 11h6l2 3M8 9H4l-2 3M12 9V4M9 4h6"/>',
  },
  // 14. Water Tap / Gripo
  {
    id: "water_tap",
    label: "Water Tap / Gripo",
    category: "Community Water Point",
    group: "infrastructure",
    defaultColor: "#0284c7",
    description: "Communal standpipe faucet dispensing fresh water",
    keywords: ["tap", "gripo", "faucet", "standpipe", "communal"],
    svgPath: '<path d="M4 12h8a4 4 0 0 1 4 4v2M16 18h-4M7 8V4h6v4M5 8h10M12 21a1.5 1.5 0 0 0 0-3 1.5 1.5 0 0 0 0 3z"/>',
  },
  // 15. Water Refilling Station
  {
    id: "water_refilling",
    label: "Water Refilling Station",
    category: "Water Refilling Station",
    group: "infrastructure",
    defaultColor: "#06b6d4",
    description: "Commercial purified 5-gallon water dispenser jug",
    keywords: ["refilling", "mineral", "purified", "alkaline", "station", "station", "dispenser"],
    svgPath: '<path d="M6 2h12v4H6zM4 6h16v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6z"/><path d="M10 12h4M12 10v4"/>',
  },
  // 16. Overhead Water Tank / Tower
  {
    id: "water_tank",
    label: "Water Tank / Tower",
    category: "Community Water Point",
    group: "infrastructure",
    defaultColor: "#475569",
    description: "Elevated municipal water reservoir tank on stilts",
    keywords: ["tank", "tower", "overhead", "storage", "cistern"],
    svgPath: '<rect x="5" y="3" width="14" height="10" rx="3"/><path d="M7 13v8M17 13v8M10 13l4 8M14 13l-4 8M5 8h14"/>',
  },
  // 17. Drinking Fountain
  {
    id: "drinking_fountain",
    label: "Drinking Fountain",
    category: "Public Water Source",
    group: "drinking",
    defaultColor: "#14b8a6",
    description: "Sanitary bubbler drinking water fountain",
    keywords: ["drinking", "fountain", "bubbler", "potable", "drink"],
    svgPath: '<path d="M6 12a6 6 0 0 0 12 0v-2H6v2zM12 12v9M8 21h8M12 6a3 3 0 0 1 3-3c1.5 0 2.5 1 2.5 2.5S16.5 8 15 8"/>',
  },
  // 18. Ornamental Fountain
  {
    id: "fountain",
    label: "Plaza Fountain",
    category: "Public Water Source",
    group: "nature",
    defaultColor: "#10b981",
    description: "Multi-tier water spray fountain with rising plumes",
    keywords: ["fountain", "plaza", "spray", "waterwork", "display"],
    svgPath: '<path d="M12 3v6M9 6a3 3 0 0 0-6 3v2h6M15 6a3 3 0 0 1 6 3v2h-6M4 17a8 8 0 0 0 16 0v-3H4v3zM12 17v4M8 21h8"/>',
  },
  // 19. Fire Hydrant
  {
    id: "hydrant",
    label: "Fire Hydrant",
    category: "Public Water Source",
    group: "infrastructure",
    defaultColor: "#ef4444",
    description: "Emergency fire hydrant water hookup point",
    keywords: ["hydrant", "emergency", "fire", "valve", "high pressure"],
    svgPath: '<path d="M8 6h8M10 3h4v3h-4zM6 10h12v11H6zM4 13h2M18 13h2M9 16h6"/>',
  },
  // 20. Rainwater Catchment
  {
    id: "rainwater",
    label: "Rainwater Collector",
    category: "Community Water Point",
    group: "infrastructure",
    defaultColor: "#3b82f6",
    description: "Rain cloud and filtered rooftop water catchment",
    keywords: ["rain", "rainwater", "catchment", "harvesting", "barrel"],
    svgPath: '<path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242M8 19v2M12 18v3M16 19v2"/>',
  },
  // 21. Main Pipeline / Valve
  {
    id: "pipe_valve",
    label: "Pipeline / Valve",
    category: "Community Water Point",
    group: "infrastructure",
    defaultColor: "#64748b",
    description: "Municipal water main pipeline and control wheel",
    keywords: ["pipe", "pipeline", "valve", "main", "junction", "distribution"],
    svgPath: '<path d="M2 13h20M2 9h20M12 5a3 3 0 1 0 0 6 3 3 0 0 0 0-6zM12 2v3M12 11v6"/>',
  },
  // 22. Water Advisory / Alert
  {
    id: "alert_notice",
    label: "Advisory / Caution",
    category: "Other",
    group: "advisory",
    defaultColor: "#f59e0b",
    description: "Official advisory, boiling notice, or restricted point",
    keywords: ["alert", "advisory", "warning", "caution", "notice", "maintenance"],
    svgPath: '<circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>',
  },
  // 23. Geographic Pin / Landmark
  {
    id: "map_pin",
    label: "Geographic Pin",
    category: "Other",
    group: "advisory",
    defaultColor: "#0d9488",
    description: "Clean round geographic location pin with inner dot",
    keywords: ["pin", "location", "point", "landmark", "marker"],
    svgPath: '<path d="M12 2a7 7 0 0 0-7 7c0 5 7 13 7 13s7-8 7-13a7 7 0 0 0-7-7z"/><circle cx="12" cy="9" r="2.5"/>',
  },
  // 24. Clean Water Droplet
  {
    id: "water_drop",
    label: "Water Droplet",
    category: "Public Water Source",
    group: "drinking",
    defaultColor: "#2563eb",
    description: "Pristine natural teardrop water droplet",
    keywords: ["water", "droplet", "drop", "clean", "fresh", "mineral"],
    svgPath: '<path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/>',
  },
  // 25. Mountain Creek / Stream
  {
    id: "creek",
    label: "Mountain Creek",
    category: "River",
    group: "rivers",
    defaultColor: "#0284c7",
    description: "Winding highland brook surrounded by mountain slopes",
    keywords: ["creek", "brook", "sapa", "mountain", "valley"],
    svgPath: '<path d="m3 19 6-12 5 8 7-11M3 21c3-1 6-1 9 0s6 1 9 0"/>',
  },
  // 26. Mineral Wellness Spring
  {
    id: "mineral_spring",
    label: "Mineral Bath Spring",
    category: "Spring",
    group: "nature",
    defaultColor: "#0d9488",
    description: "Therapeutic mineral bath with mineral crystal flakes",
    keywords: ["mineral", "bath", "therapeutic", "spa", "wellness"],
    svgPath: '<circle cx="12" cy="12" r="8"/><path d="M12 8v8M8 12h8M9 9l6 6M15 9l-6 6"/>',
  },
];

/**
 * Automatically determine the smartest matching default circle icon
 * based on Category and optional Name keywords.
 */
export function getDefaultCircleIconForCategory(
  category?: string,
  name?: string
): { iconId: string; color: string } {
  const cleanName = (name || "").toLowerCase();

  // 1. Keyword based auto-detection (takes highest precision priority)
  if (cleanName.includes("resort") || cleanName.includes("hotel") || cleanName.includes("cottage")) {
    return { iconId: "resort", color: "#a855f7" };
  }
  if (cleanName.includes("beach") || cleanName.includes("baybay") || cleanName.includes("playa")) {
    return { iconId: "beach", color: "#06b6d4" };
  }
  if (cleanName.includes("tulay") || cleanName.includes("bridge") || cleanName.includes("crossing")) {
    return { iconId: "bridge", color: "#3b82f6" };
  }
  if (cleanName.includes("river") || cleanName.includes("salog") || cleanName.includes("cadacan")) {
    return { iconId: "river", color: "#2563eb" };
  }
  if (cleanName.includes("falls") || cleanName.includes("waterfall") || cleanName.includes("busay") || cleanName.includes("bitang")) {
    return { iconId: "waterfall", color: "#10b981" };
  }
  if (cleanName.includes("hot spring") || cleanName.includes("mapaso") || cleanName.includes("thermal")) {
    return { iconId: "hot_spring", color: "#f97316" };
  }
  if (cleanName.includes("cold spring") || cleanName.includes("san mateo") || cleanName.includes("batis")) {
    return { iconId: "cold_spring", color: "#0ea5e9" };
  }
  if (cleanName.includes("pool") || cleanName.includes("swimming")) {
    return { iconId: "swimming_pool", color: "#8b5cf6" };
  }
  if (cleanName.includes("poso") || cleanName.includes("hand pump") || cleanName.includes("posohan")) {
    return { iconId: "well_pump", color: "#059669" };
  }
  if (cleanName.includes("refill") || cleanName.includes("water station") || cleanName.includes("purified")) {
    return { iconId: "water_refilling", color: "#06b6d4" };
  }
  if (cleanName.includes("tank") || cleanName.includes("overhead") || cleanName.includes("tower")) {
    return { iconId: "water_tank", color: "#475569" };
  }
  if (cleanName.includes("lake") || cleanName.includes("dam") || cleanName.includes("danaw")) {
    return { iconId: "lake", color: "#0369a1" };
  }
  if (cleanName.includes("fountain") || cleanName.includes("bubbler")) {
    return { iconId: "fountain", color: "#10b981" };
  }
  if (cleanName.includes("advisory") || cleanName.includes("warning") || cleanName.includes("caution")) {
    return { iconId: "alert_notice", color: "#f59e0b" };
  }

  // 2. Category based fallback
  switch (category) {
    case "Resort":
      return { iconId: "resort", color: "#a855f7" };
    case "River":
      return { iconId: "river", color: "#2563eb" };
    case "Waterfall":
      return { iconId: "waterfall", color: "#10b981" };
    case "Spring":
      return { iconId: "spring", color: "#0284c7" };
    case "Deep Well":
      return { iconId: "deep_well", color: "#6366f1" };
    case "Water Refilling Station":
      return { iconId: "water_refilling", color: "#06b6d4" };
    case "Community Water Point":
      return { iconId: "water_tap", color: "#0284c7" };
    case "Public Water Source":
      return { iconId: "water_drop", color: "#2563eb" };
    default:
      return { iconId: "map_pin", color: "#0d9488" };
  }
}

/**
 * Retrieves the full preset object by ID, falling back to a category or default.
 */
export function getCircleIconPreset(
  iconId?: string,
  category?: string,
  name?: string
): CircleIconPreset {
  if (iconId) {
    const found = CIRCLE_ICON_PRESETS.find((p) => p.id === iconId);
    if (found) return found;
  }

  const def = getDefaultCircleIconForCategory(category, name);
  const matched = CIRCLE_ICON_PRESETS.find((p) => p.id === def.iconId);
  return matched || CIRCLE_ICON_PRESETS[0];
}
