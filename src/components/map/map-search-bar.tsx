// src/components/map/map-search-bar.tsx
"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import { Search, X, MapPin, Droplets, Compass, ChevronRight } from "lucide-react";
import { WaterSourceWithPhotos } from "@/types/water";
import { useLanguage } from "@/contexts/language-context";
import { CATEGORY_LABELS } from "@/lib/utils/constants";
import { cn } from "@/lib/utils";

export interface BarangayLocation {
  id: string;
  name: string;
  type: "barangay";
  latitude: number;
  longitude: number;
  zoom: number;
  aliases: string[];
}

export const IROSIN_BARANGAYS_DATA: BarangayLocation[] = [
  { id: "b-bacolod", name: "Bacolod", type: "barangay", latitude: 12.7090, longitude: 124.0385, zoom: 15, aliases: ["bacolod", "brgy bacolod", "barangay bacolod"] },
  { id: "b-bagsangan", name: "Bagsangan", type: "barangay", latitude: 12.6850, longitude: 124.0150, zoom: 15, aliases: ["bagsangan", "brgy bagsangan", "barangay bagsangan"] },
  { id: "b-batang", name: "Batang", type: "barangay", latitude: 12.7210, longitude: 124.0410, zoom: 15, aliases: ["batang", "brgy batang", "barangay batang"] },
  { id: "b-bolos", name: "Bolos", type: "barangay", latitude: 12.6950, longitude: 124.0200, zoom: 15, aliases: ["bolos", "bolor", "bolod", "brgy bolos", "barangay bolos", "brgy bolor"] },
  { id: "b-buenavista", name: "Buenavista", type: "barangay", latitude: 12.6780, longitude: 124.0350, zoom: 15, aliases: ["buenavista", "brgy buenavista", "barangay buenavista"] },
  { id: "b-bulawan", name: "Bulawan", type: "barangay", latitude: 12.7150, longitude: 124.0450, zoom: 15, aliases: ["bulawan", "brgy bulawan", "barangay bulawan"] },
  { id: "b-carriedo", name: "Carriedo", type: "barangay", latitude: 12.7100, longitude: 124.0500, zoom: 15, aliases: ["carriedo", "brgy carriedo", "barangay carriedo"] },
  { id: "b-casiguran-road", name: "Casiguran Road", type: "barangay", latitude: 12.7300, longitude: 124.0350, zoom: 15, aliases: ["casiguran road", "casiguran"] },
  { id: "b-cogon", name: "Cogon", type: "barangay", latitude: 12.7020, longitude: 124.0180, zoom: 15, aliases: ["cogon", "sitio cogon", "brgy cogon"] },
  { id: "b-gabao", name: "Gabao", type: "barangay", latitude: 12.7190, longitude: 124.0280, zoom: 15, aliases: ["gabao", "brgy gabao", "barangay gabao", "maasim"] },
  { id: "b-gulang-gulang", name: "Gulang-Gulang", type: "barangay", latitude: 12.6920, longitude: 124.0100, zoom: 15, aliases: ["gulang-gulang", "gulang gulang", "gulang"] },
  { id: "b-gumapia", name: "Gumapia", type: "barangay", latitude: 12.7250, longitude: 124.0320, zoom: 15, aliases: ["gumapia", "brgy gumapia", "barangay gumapia"] },
  { id: "b-liang", name: "Liang", type: "barangay", latitude: 12.7125, longitude: 124.0150, zoom: 15, aliases: ["liang", "brgy liang", "bitang", "barangay liang"] },
  { id: "b-macawayan", name: "Macawayan", type: "barangay", latitude: 12.6880, longitude: 124.0250, zoom: 15, aliases: ["macawayan", "brgy macawayan", "barangay macawayan"] },
  { id: "b-mapaso", name: "Mapaso", type: "barangay", latitude: 12.6980, longitude: 124.0480, zoom: 15, aliases: ["mapaso", "brgy mapaso", "hot spring", "mapaso spring"] },
  { id: "b-monbon", name: "Monbon", type: "barangay", latitude: 12.6910, longitude: 124.0530, zoom: 15, aliases: ["monbon", "mumbon", "brgy monbon", "barangay monbon", "san mateo"] },
  { id: "b-patag", name: "Patag", type: "barangay", latitude: 12.7250, longitude: 124.0090, zoom: 15, aliases: ["patag", "brgy patag", "barangay patag"] },
  { id: "b-salvacion", name: "Salvacion", type: "barangay", latitude: 12.7080, longitude: 124.0280, zoom: 15, aliases: ["salvacion", "brgy salvacion", "barangay salvacion"] },
  { id: "b-san-agustin", name: "San Agustin", type: "barangay", latitude: 12.7060, longitude: 124.0350, zoom: 15, aliases: ["san agustin", "agustin", "brgy san agustin"] },
  { id: "b-san-isidro", name: "San Isidro", type: "barangay", latitude: 12.7000, longitude: 124.0400, zoom: 15, aliases: ["san isidro", "isidro", "brgy san isidro"] },
  { id: "b-san-julian", name: "San Julian", type: "barangay", latitude: 12.7015, longitude: 124.0250, zoom: 15, aliases: ["san julian", "julian", "cadacan", "brgy san julian"] },
  { id: "b-san-pedro", name: "San Pedro (Poblacion)", type: "barangay", latitude: 12.7045, longitude: 124.0320, zoom: 16, aliases: ["san pedro", "poblacion", "town proper", "town center", "irosin center"] },
  { id: "b-san-roque", name: "San Roque", type: "barangay", latitude: 12.7030, longitude: 124.0340, zoom: 16, aliases: ["san roque", "roque", "brgy san roque"] },
  { id: "b-santa-cruz", name: "Santa Cruz", type: "barangay", latitude: 12.7050, longitude: 124.0290, zoom: 16, aliases: ["santa cruz", "sta cruz", "brgy santa cruz"] },
  { id: "b-santo-domingo", name: "Santo Domingo", type: "barangay", latitude: 12.6960, longitude: 124.0380, zoom: 15, aliases: ["santo domingo", "sto domingo", "brgy santo domingo"] },
  { id: "b-tabon-tabon", name: "Tabon-Tabon", type: "barangay", latitude: 12.7180, longitude: 124.0380, zoom: 15, aliases: ["tabon-tabon", "tabon tabon", "tabon", "brgy tabon-tabon"] },
  { id: "b-tinampo", name: "Tinampo", type: "barangay", latitude: 12.7070, longitude: 124.0310, zoom: 16, aliases: ["tinampo", "brgy tinampo", "barangay tinampo"] },
  { id: "b-tongdol", name: "Tongdol", type: "barangay", latitude: 12.7350, longitude: 124.0200, zoom: 15, aliases: ["tongdol", "brgy tongdol", "barangay tongdol"] },
];

const POPULAR_SUGGESTIONS = ["Monbon", "Gabao", "Bolos", "Patag", "Bacolod", "San Julian"];

interface MapSearchBarProps {
  sources: WaterSourceWithPhotos[];
  onFlyToLocation: (item: {
    lat: number;
    lng: number;
    name: string;
    zoom?: number;
    source?: WaterSourceWithPhotos;
  }) => void;
  className?: string;
}

export function MapSearchBar({
  sources,
  onFlyToLocation,
  className,
}: MapSearchBarProps) {
  const { isTagalog } = useLanguage();
  const [isExpanded, setIsExpanded] = useState(false);
  const [query, setQuery] = useState("");
  const [isOpenDropdown, setIsOpenDropdown] = useState(false);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpenDropdown(false);
        if (!query.trim()) {
          setIsExpanded(false);
        }
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [query]);

  // Focus input when expanded
  useEffect(() => {
    if (isExpanded) {
      const timer = setTimeout(() => {
        inputRef.current?.focus();
        setIsOpenDropdown(true);
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [isExpanded]);

  // Match barangays and water sources
  const results = useMemo(() => {
    const trimmed = query.trim().toLowerCase();
    if (!trimmed) {
      return { barangays: [], sources: [] };
    }

    const matchedBarangays = IROSIN_BARANGAYS_DATA.filter((b) => {
      if (b.name.toLowerCase().includes(trimmed)) return true;
      return b.aliases.some((alias) => alias.includes(trimmed) || trimmed.includes(alias));
    });

    const matchedSources = sources.filter((s) => {
      const nameMatch = s.name.toLowerCase().includes(trimmed);
      const brgyMatch = s.barangay?.toLowerCase().includes(trimmed);
      const catMatch = s.category?.toLowerCase().includes(trimmed);
      const addrMatch = s.address?.toLowerCase().includes(trimmed);
      return nameMatch || brgyMatch || catMatch || addrMatch;
    });

    return {
      barangays: matchedBarangays,
      sources: matchedSources.slice(0, 6),
    };
  }, [query, sources]);

  const hasMatches = results.barangays.length > 0 || results.sources.length > 0;

  const handleOpenSearch = () => {
    setIsExpanded(true);
  };

  const handleCollapse = () => {
    setQuery("");
    setIsOpenDropdown(false);
    setIsExpanded(false);
  };

  const handleSelectBarangay = (b: BarangayLocation) => {
    onFlyToLocation({
      lat: b.latitude,
      lng: b.longitude,
      name: b.name,
      zoom: b.zoom,
    });
    setIsOpenDropdown(false);
    setQuery(b.name);
  };

  const handleSelectSource = (s: WaterSourceWithPhotos) => {
    onFlyToLocation({
      lat: s.latitude,
      lng: s.longitude,
      name: s.name,
      zoom: 16,
      source: s,
    });
    setIsOpenDropdown(false);
    setQuery(s.name);
  };

  return (
    <div
      ref={containerRef}
      className={cn(
        "absolute top-3 sm:top-4 left-3 sm:left-4 z-[1000] select-none",
        className
      )}
    >
      {/* Search Input Bar or Collapsed Icon Button */}
      {!isExpanded ? (
        <button
          type="button"
          onClick={handleOpenSearch}
          className="flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-md shadow-md border border-slate-200/90 dark:border-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/80 active:scale-95 transition-all duration-200 cursor-pointer"
          aria-label={isTagalog ? "Maghanap sa mapa" : "Search map locations"}
          title={isTagalog ? "Maghanap ng barangay o tubig" : "Search barangay or water point"}
        >
          <Search className="h-4 w-4 text-blue-600 dark:text-blue-400" />
        </button>
      ) : (
        <div
          className={cn(
            "flex items-center gap-2 px-3 py-2 rounded-xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-slate-200/90 dark:border-slate-800 shadow-xl transition-all duration-300 ease-out",
            "w-[calc(100vw-6.5rem)] max-w-[260px] sm:max-w-xs md:max-w-sm"
          )}
        >
          <Search className="h-4 w-4 text-blue-600 dark:text-blue-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setIsOpenDropdown(true);
            }}
            onFocus={() => setIsOpenDropdown(true)}
            placeholder={
              isTagalog
                ? "Hanapin ang Monbon, Gabao, Bolor..."
                : "Search Monbon, Gabao, Bolor..."
            }
            className="w-full bg-transparent border-none text-xs sm:text-sm text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none"
          />
          <button
            type="button"
            onClick={handleCollapse}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shrink-0 active:scale-90 cursor-pointer"
            aria-label="Clear and close search"
            title="Close search"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Real-time Search Dropdown Results Popover */}
      {isExpanded && isOpenDropdown && (
        <div className="absolute top-11 sm:top-12 left-0 w-[calc(100vw-6.5rem)] max-w-[260px] sm:max-w-xs md:max-w-sm rounded-2xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl border border-slate-200/90 dark:border-slate-800 p-2 sm:p-2.5 shadow-2xl z-[1001] max-h-72 overflow-y-auto animate-in fade-in-0 zoom-in-95 slide-in-from-top-1 duration-200 origin-top-left">
          {/* 1. If user hasn't typed anything yet: Show quick suggestions */}
          {!query.trim() ? (
            <div className="space-y-2 p-1">
              <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider px-1">
                <Compass className="h-3 w-3 text-blue-500" />
                <span>{isTagalog ? "Mga Kilalang Barangay" : "Popular Locations"}</span>
              </div>
              <div className="flex flex-wrap gap-1.5 pt-0.5">
                {POPULAR_SUGGESTIONS.map((name) => {
                  const b = IROSIN_BARANGAYS_DATA.find((item) => item.name.toLowerCase() === name.toLowerCase());
                  if (!b) return null;
                  return (
                    <button
                      key={name}
                      type="button"
                      onClick={() => handleSelectBarangay(b)}
                      className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/80 hover:bg-blue-50 dark:hover:bg-blue-950/60 hover:text-blue-600 dark:hover:text-blue-400 text-xs font-medium text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
                    >
                      {name}
                    </button>
                  );
                })}
              </div>
            </div>
          ) : hasMatches ? (
            <div className="space-y-2">
              {/* Matched Barangays */}
              {results.barangays.length > 0 && (
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 py-0.5 block">
                    {isTagalog ? "Mga Barangay sa Irosin" : "Irosin Barangays"}
                  </span>
                  <div className="space-y-0.5 mt-1">
                    {results.barangays.map((b) => (
                      <button
                        key={b.id}
                        type="button"
                        onClick={() => handleSelectBarangay(b)}
                        className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-blue-50 dark:hover:bg-blue-950/50 text-left transition-colors group cursor-pointer"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-7 h-7 rounded-lg bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                            <MapPin className="h-3.5 w-3.5" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-semibold text-slate-800 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 truncate">
                              Barangay {b.name}
                            </p>
                            <p className="text-[10px] text-slate-400 truncate">
                              Irosin, Sorsogon
                            </p>
                          </div>
                        </div>
                        <ChevronRight className="h-3.5 w-3.5 text-slate-300 group-hover:text-blue-500 transition-transform group-hover:translate-x-0.5 shrink-0" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Matched Water Sources */}
              {results.sources.length > 0 && (
                <div className={results.barangays.length > 0 ? "pt-2 border-t border-slate-100 dark:border-slate-800/80" : ""}>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 py-0.5 block">
                    {isTagalog ? "Mga Pinagkukunang Tubig" : "Water Sources"}
                  </span>
                  <div className="space-y-0.5 mt-1">
                    {results.sources.map((s) => (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => handleSelectSource(s)}
                        className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-blue-50 dark:hover:bg-blue-950/50 text-left transition-colors group cursor-pointer"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-7 h-7 rounded-lg bg-teal-100 dark:bg-teal-900/40 text-teal-600 dark:text-teal-400 flex items-center justify-center shrink-0">
                            <Droplets className="h-3.5 w-3.5" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-semibold text-slate-800 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 truncate">
                              {s.name}
                            </p>
                            <p className="text-[10px] text-slate-400 truncate">
                              {CATEGORY_LABELS[s.category] || s.category} • Brgy. {s.barangay || "Irosin"}
                            </p>
                          </div>
                        </div>
                        <ChevronRight className="h-3.5 w-3.5 text-slate-300 group-hover:text-blue-500 transition-transform group-hover:translate-x-0.5 shrink-0" />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="p-4 text-center">
              <p className="text-xs font-medium text-slate-600 dark:text-slate-300">
                {isTagalog ? "Walang nahanap na lokasyon" : "No matching location found"}
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                {isTagalog
                  ? `Subukan hanapin ang Monbon, Gabao, o Bolos.`
                  : `Try searching for Monbon, Gabao, or Bolor.`}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
