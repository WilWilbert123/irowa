// src/components/map/location-picker-map.tsx
"use client";

import React, { useEffect, useRef, useState, useMemo } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { MAP_CONFIG } from "@/lib/map/map-config";
import { createPickerMarkerIcon } from "@/lib/map/map-icons";
import { IROSIN_COORDINATES } from "@/lib/utils/constants";
import { 
  Navigation, 
  Layers, 
  Compass, 
  Search, 
  X, 
  MapPin, 
  ChevronRight 
} from "lucide-react";
import { useGeolocation } from "@/hooks/use-geolocation";
import { useSystemSettings } from "@/hooks/use-system-settings";
import { IROSIN_BARANGAYS_DATA, BarangayLocation } from "@/components/map/map-search-bar";

interface LocationPickerMapProps {
  latitude: number;
  longitude: number;
  onChange?: (lat: number, lng: number, barangay?: string) => void;
  className?: string;
  defaultLayer?: "standard" | "satellite";
  readOnly?: boolean;
  markerIconId?: string;
  markerColor?: string;
}

const TILE_LAYERS = {
  standard: {
    name: "Street",
    url: MAP_CONFIG.tileUrl,
    attribution: MAP_CONFIG.attribution,
    maxNativeZoom: 18,
    subdomains: "abc",
  },
  satellite: {
    name: "Satellite",
    url: "https://mt{s}.google.com/vt/lyrs=y&x={x}&y={y}&z={z}",
    attribution: "&copy; Google Maps",
    subdomains: ["0", "1", "2", "3"],
    maxNativeZoom: 20,
  },
};

function getPickerTileConfig(layer: "standard" | "satellite", hidePoiMarkers?: boolean) {
  if (layer === "satellite") {
    return {
      name: "Satellite",
      url: hidePoiMarkers
        ? "https://mt{s}.google.com/vt/lyrs=y&apistyle=s.e:l.i|p.v:off,s.t:2|p.v:off&x={x}&y={y}&z={z}"
        : "https://mt{s}.google.com/vt/lyrs=y&x={x}&y={y}&z={z}",
      attribution: "&copy; Google Maps",
      subdomains: ["0", "1", "2", "3"],
      maxNativeZoom: 20,
    };
  }
  return TILE_LAYERS.standard;
}

/**
 * Calculates the nearest Irosin barangay and returns both badge display label and clean barangay name.
 */
function findNearestBarangayInfo(lat: number, lng: number): { label: string; barangay: string } {
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    return { label: "Irosin", barangay: "San Pedro (Poblacion)" };
  }
  let closestBarangay = "San Pedro (Poblacion)";
  let minDistance = Infinity;

  for (const b of IROSIN_BARANGAYS_DATA) {
    const dLat = b.latitude - lat;
    const dLng = b.longitude - lng;
    const dist = Math.sqrt(dLat * dLat + dLng * dLng);
    if (dist < minDistance) {
      minDistance = dist;
      closestBarangay = b.name;
    }
  }

  const label = closestBarangay.startsWith("Brgy.") ? closestBarangay : `Brgy. ${closestBarangay}`;
  return { label, barangay: closestBarangay };
}

function findNearestBarangayName(lat: number, lng: number): string {
  return findNearestBarangayInfo(lat, lng).label;
}

function normalizeLocationName(name: string): string {
  if (!name) return name;
  return name.replace(/tinampa/gi, "Tinampo");
}

export default function LocationPickerMap({
  latitude,
  longitude,
  onChange,
  className = "h-[340px]",
  defaultLayer = "satellite",
  readOnly = false,
  markerIconId,
  markerColor,
}: LocationPickerMapProps) {
  const { settings: sysSettings } = useSystemSettings();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);

  const [activeLayer, setActiveLayer] = useState<"standard" | "satellite">(defaultLayer);
  const { isLocating, requestLocation } = useGeolocation();

  // Current location name for marker badge and map preview
  const [locationName, setLocationName] = useState<string>(() =>
    findNearestBarangayName(latitude, longitude)
  );

  // Search state
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement | null>(null);
  const searchInputRef = useRef<HTMLInputElement | null>(null);
  const reverseGeocodeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Keep a ref to the latest onChange to avoid re-binding handlers
  const onChangeRef = useRef(onChange);
  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  // Resolves the location name accurately: instant nearest calculation + debounced OSM reverse lookup
  const resolveLocation = (lat: number, lng: number, marker: L.Marker) => {
    const { label, barangay } = findNearestBarangayInfo(lat, lng);
    setLocationName(label);
    marker.setIcon(createPickerMarkerIcon(label, markerIconId, markerColor));

    if (onChangeRef.current) {
      onChangeRef.current(lat, lng, barangay);
    }

    if (reverseGeocodeTimerRef.current) {
      clearTimeout(reverseGeocodeTimerRef.current);
    }
    reverseGeocodeTimerRef.current = setTimeout(async () => {
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`,
          { headers: { Accept: "application/json" } }
        );
        if (res.ok) {
          const json = await res.json();
          const addr = json?.address;
          let village = addr?.village || addr?.quarter || addr?.suburb || addr?.neighbourhood;
          if (village) {
            village = normalizeLocationName(village);
            const formatted = village.startsWith("Brgy.") ? village : `Brgy. ${village}`;
            setLocationName(formatted);
            marker.setIcon(createPickerMarkerIcon(formatted, markerIconId, markerColor));
          }
        }
      } catch {
        // Safe fallback
      }
    }, 350);
  };

  // Live reactivity when admin picks a custom icon or color
  useEffect(() => {
    if (markerRef.current) {
      markerRef.current.setIcon(createPickerMarkerIcon(locationName, markerIconId, markerColor));
    }
  }, [markerIconId, markerColor, locationName]);

  // Click outside to close search dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false);
        if (!searchQuery.trim()) {
          setIsSearchExpanded(false);
        }
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [searchQuery]);

  // Focus input when search bar expands
  useEffect(() => {
    if (isSearchExpanded) {
      const timer = setTimeout(() => {
        searchInputRef.current?.focus();
        setIsDropdownOpen(true);
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [isSearchExpanded]);

  // Filtered barangay search results
  const filteredLocations = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) {
      return IROSIN_BARANGAYS_DATA.slice(0, 6);
    }
    return IROSIN_BARANGAYS_DATA.filter(
      (loc) =>
        loc.name.toLowerCase().includes(q) ||
        loc.aliases.some((alias) => alias.toLowerCase().includes(q))
    );
  }, [searchQuery]);

  // 1. Initialize map
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    if (mapInstanceRef.current) {
      try {
        mapInstanceRef.current.remove();
      } catch {
        // safe ignore
      }
      mapInstanceRef.current = null;
    }

    if ((container as any)._leaflet_id) {
      try {
        delete (container as any)._leaflet_id;
      } catch {
        // safe ignore
      }
    }

    const initialLat = Number.isFinite(latitude) ? latitude : IROSIN_COORDINATES.lat;
    const initialLng = Number.isFinite(longitude) ? longitude : IROSIN_COORDINATES.lng;
    const initialName = findNearestBarangayName(initialLat, initialLng);
    setLocationName(initialName);

    const map = L.map(container, {
      center: [initialLat, initialLng],
      zoom: 15,
      minZoom: 11,
      maxZoom: 19,
      zoomControl: false,
      attributionControl: false,
    });

    const config = getPickerTileConfig(activeLayer, sysSettings?.hideMapPoiMarkers);
    const tileLayer = L.tileLayer(config.url, {
      attribution: config.attribution,
      maxNativeZoom: config.maxNativeZoom,
      maxZoom: 19,
      subdomains: (config as any).subdomains || "abc",
      keepBuffer: 6,
      updateWhenIdle: true,
    }).addTo(map);

    tileLayerRef.current = tileLayer;

    // Add marker with dynamic location badge (draggable only if not readOnly)
    const marker = L.marker([initialLat, initialLng], {
      icon: createPickerMarkerIcon(initialName, markerIconId, markerColor),
      draggable: !readOnly,
      autoPan: !readOnly,
    }).addTo(map);

    if (!readOnly) {
      marker.on("dragend", (e: any) => {
        const pos = e.target.getLatLng();
        const newLat = Number(pos.lat.toFixed(6));
        const newLng = Number(pos.lng.toFixed(6));
        resolveLocation(newLat, newLng, marker);

        if (onChangeRef.current) {
          onChangeRef.current(newLat, newLng);
        }
      });

      // Click anywhere on map to reposition pin
      map.on("click", (e: L.LeafletMouseEvent) => {
        const newLat = Number(e.latlng.lat.toFixed(6));
        const newLng = Number(e.latlng.lng.toFixed(6));
        marker.setLatLng([newLat, newLng]);
        resolveLocation(newLat, newLng, marker);

        if (onChangeRef.current) {
          onChangeRef.current(newLat, newLng);
        }
      });
    }

    markerRef.current = marker;
    mapInstanceRef.current = map;

    // Trigger resize calculation
    const timer = setTimeout(() => {
      try {
        map.invalidateSize();
      } catch {
        // safe ignore
      }
    }, 150);

    return () => {
      clearTimeout(timer);
      try {
        map.remove();
      } catch {
        // safe ignore
      }
      mapInstanceRef.current = null;
      markerRef.current = null;
      tileLayerRef.current = null;
      if (container) {
        try {
          delete (container as any)._leaflet_id;
        } catch {
          // safe ignore
        }
      }
    };
  }, []);

  // 2. Synchronize marker when latitude or longitude changes from outside
  useEffect(() => {
    const marker = markerRef.current;
    const map = mapInstanceRef.current;
    if (!marker || !map || !Number.isFinite(latitude) || !Number.isFinite(longitude)) return;

    const currentPos = marker.getLatLng();
    const dist = Math.abs(currentPos.lat - latitude) + Math.abs(currentPos.lng - longitude);

    const resolvedName = findNearestBarangayName(latitude, longitude);
    setLocationName(resolvedName);
    marker.setIcon(createPickerMarkerIcon(resolvedName));

    if (dist > 0.00005) {
      marker.setLatLng([latitude, longitude]);
      map.panTo([latitude, longitude], { animate: true });
    }
  }, [latitude, longitude]);

  // 3. Switch tile layer (Street vs. Satellite)
  const toggleLayer = () => {
    const map = mapInstanceRef.current;
    if (!map) return;
    const nextLayer = activeLayer === "satellite" ? "standard" : "satellite";
    const config = getPickerTileConfig(nextLayer, sysSettings?.hideMapPoiMarkers);

    if (tileLayerRef.current) {
      try {
        map.removeLayer(tileLayerRef.current);
      } catch {
        // safe ignore
      }
    }

    const newTile = L.tileLayer(config.url, {
      attribution: config.attribution,
      maxNativeZoom: config.maxNativeZoom,
      maxZoom: 19,
      subdomains: (config as any).subdomains || "abc",
      keepBuffer: 6,
      updateWhenIdle: true,
    }).addTo(map);

    tileLayerRef.current = newTile;
    setActiveLayer(nextLayer);
  };

  // Live reactivity when admin toggles POI balloon marker visibility
  useEffect(() => {
    if (activeLayer === "satellite" && tileLayerRef.current) {
      const config = getPickerTileConfig("satellite", sysSettings?.hideMapPoiMarkers);
      tileLayerRef.current.setUrl(config.url);
    }
  }, [sysSettings?.hideMapPoiMarkers, activeLayer]);

  // 4. Center on user GPS
  const handleLocateMe = async () => {
    const pos = await requestLocation();
    if (pos) {
      const newLat = Number(pos.lat.toFixed(6));
      const newLng = Number(pos.lng.toFixed(6));

      if (markerRef.current) {
        markerRef.current.setLatLng([newLat, newLng]);
        resolveLocation(newLat, newLng, markerRef.current);
      }

      onChange?.(newLat, newLng);

      if (mapInstanceRef.current) {
        mapInstanceRef.current.flyTo([newLat, newLng], 16, { duration: 1.2 });
      }
    }
  };

  // 5. Center on Irosin or Pinned location
  const handleResetCenter = () => {
    const targetLat = readOnly ? (Number.isFinite(latitude) ? latitude : IROSIN_COORDINATES.lat) : IROSIN_COORDINATES.lat;
    const targetLng = readOnly ? (Number.isFinite(longitude) ? longitude : IROSIN_COORDINATES.lng) : IROSIN_COORDINATES.lng;

    if (markerRef.current) {
      markerRef.current.setLatLng([targetLat, targetLng]);
      resolveLocation(targetLat, targetLng, markerRef.current);
    }

    if (!readOnly && onChange) {
      onChange(targetLat, targetLng);
    }

    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([targetLat, targetLng], readOnly ? 16 : 14, { duration: 1 });
    }
  };

  // 6. Handle search selection
  const handleSelectLocation = (loc: BarangayLocation) => {
    const newLat = Number(loc.latitude.toFixed(6));
    const newLng = Number(loc.longitude.toFixed(6));
    const resolvedName = loc.name.startsWith("Brgy.") ? loc.name : `Brgy. ${loc.name}`;

    setLocationName(resolvedName);
    setSearchQuery(loc.name);
    setIsDropdownOpen(false);

    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([newLat, newLng], 16, { duration: 1.2 });
    }

    if (markerRef.current) {
      markerRef.current.setLatLng([newLat, newLng]);
      markerRef.current.setIcon(createPickerMarkerIcon(resolvedName));
    }

    if (!readOnly && onChangeRef.current) {
      onChangeRef.current(newLat, newLng, loc.name.replace(/^Brgy\.\s*/, ""));
    }
  };

  // 7. Clear or collapse search
  const handleClearOrCloseSearch = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (searchQuery) {
      setSearchQuery("");
      searchInputRef.current?.focus();
    } else {
      setIsSearchExpanded(false);
      setIsDropdownOpen(false);
    }
  };

  return (
    <div className="relative w-full rounded-2xl overflow-hidden border border-slate-300 dark:border-slate-700 shadow-inner group">
      {/* Map rendering container */}
      <div ref={containerRef} className={`w-full ${className} bg-slate-100 dark:bg-slate-900 z-0`} />

      {/* Expandable Search Control on top-left */}
      <div ref={searchContainerRef} className="absolute top-3 left-3 z-[400]">
        {!isSearchExpanded ? (
          <button
            type="button"
            onClick={() => {
              setIsSearchExpanded(true);
              setIsDropdownOpen(true);
            }}
            className="h-9 w-9 rounded-xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-200 dark:border-slate-700 shadow-md text-slate-700 dark:text-slate-200 flex items-center justify-center hover:bg-slate-50 dark:hover:bg-slate-800 transition-all cursor-pointer"
            title="Search Irosin location or barangay..."
          >
            <Search className="h-4 w-4 text-blue-500" />
          </button>
        ) : (
          <div className="relative flex flex-col">
            <div className="h-9 w-[220px] sm:w-[280px] rounded-xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-200 dark:border-slate-700 shadow-lg flex items-center px-2.5 gap-2 transition-all">
              <Search className="h-4 w-4 text-blue-500 shrink-0" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setIsDropdownOpen(true);
                }}
                onFocus={() => setIsDropdownOpen(true)}
                placeholder="Search barangay (e.g. Monbon, Gabao)..."
                className="w-full bg-transparent text-xs text-foreground placeholder:text-muted-foreground outline-none font-medium"
              />
              <button
                type="button"
                onClick={handleClearOrCloseSearch}
                className="w-5 h-5 flex items-center justify-center rounded-md text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shrink-0"
                title={searchQuery ? "Clear search" : "Close search"}
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>

            {/* Dropdown search results */}
            {isDropdownOpen && (
              <div className="absolute top-10 left-0 w-full bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xl overflow-hidden py-1 z-50 max-h-56 overflow-y-auto">
                <div className="px-3 py-1 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                  {searchQuery ? "Matching Locations" : "Quick Barangay Locations"}
                </div>
                {filteredLocations.length > 0 ? (
                  filteredLocations.map((loc) => (
                    <button
                      key={loc.id}
                      type="button"
                      onClick={() => handleSelectLocation(loc)}
                      className="w-full px-3 py-2 text-left hover:bg-blue-50 dark:hover:bg-blue-950/40 flex items-center justify-between text-xs transition-colors cursor-pointer group/item"
                    >
                      <div className="flex items-center gap-2">
                        <MapPin className="h-3.5 w-3.5 text-blue-500 shrink-0" />
                        <div>
                          <div className="font-semibold text-slate-800 dark:text-slate-100">
                            {loc.name.startsWith("Brgy.") ? loc.name : `Brgy. ${loc.name}`}
                          </div>
                          <div className="text-[10px] text-slate-400 dark:text-slate-500">
                            {loc.latitude.toFixed(4)}, {loc.longitude.toFixed(4)}
                          </div>
                        </div>
                      </div>
                      <ChevronRight className="h-3.5 w-3.5 text-slate-300 dark:text-slate-600 group-hover/item:text-blue-500 transition-colors" />
                    </button>
                  ))
                ) : (
                  <div className="px-3 py-3 text-xs text-center text-slate-400 dark:text-slate-500">
                    No matching Irosin location found
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Floating control buttons on top-right */}
      <div className="absolute top-3 right-3 z-[400] flex flex-col gap-2">
        {/* Layer toggle button */}
        <button
          type="button"
          onClick={toggleLayer}
          className="h-9 px-3 rounded-xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-200 dark:border-slate-700 shadow-md text-xs font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-1.5 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          title="Toggle Satellite / Street view"
        >
          <Layers className="h-4 w-4 text-blue-500" />
          <span>{TILE_LAYERS[activeLayer].name}</span>
        </button>

        {/* Locate me button (only in interactive mode) */}
        {!readOnly && (
          <button
            type="button"
            onClick={handleLocateMe}
            disabled={isLocating}
            className="h-9 px-3 rounded-xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-200 dark:border-slate-700 shadow-md text-xs font-semibold text-blue-600 dark:text-blue-400 flex items-center gap-1.5 hover:bg-blue-50 dark:hover:bg-blue-950/40 transition-colors cursor-pointer disabled:opacity-60"
            title="Use My Current GPS Location"
          >
            <Navigation className={`h-4 w-4 ${isLocating ? "animate-spin text-blue-500" : ""}`} />
            <span>{isLocating ? "Locating..." : "My GPS"}</span>
          </button>
        )}

        {/* Center button */}
        <button
          type="button"
          onClick={handleResetCenter}
          className="h-9 w-9 rounded-xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-200 dark:border-slate-700 shadow-md text-slate-600 dark:text-slate-300 flex items-center justify-center hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer ml-auto"
          title={readOnly ? "Recenter on Pinned Location" : "Reset View to Irosin Center"}
        >
          <Compass className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
