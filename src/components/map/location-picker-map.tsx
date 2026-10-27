// src/components/map/location-picker-map.tsx
"use client";

import React, { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { MAP_CONFIG } from "@/lib/map/map-config";
import { createPickerMarkerIcon } from "@/lib/map/map-icons";
import { IROSIN_COORDINATES } from "@/lib/utils/constants";
import { Navigation, Layers, Compass, Crosshair } from "lucide-react";
import { useGeolocation } from "@/hooks/use-geolocation";

interface LocationPickerMapProps {
  latitude: number;
  longitude: number;
  onChange: (lat: number, lng: number) => void;
  className?: string;
}

const TILE_LAYERS = {
  standard: {
    name: "Street",
    url: MAP_CONFIG.tileUrl,
    attribution: MAP_CONFIG.attribution,
    maxNativeZoom: 18,
  },
  satellite: {
    name: "Satellite",
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    attribution: "Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye",
    maxNativeZoom: 17,
  },
};

export default function LocationPickerMap({
  latitude,
  longitude,
  onChange,
  className = "h-[340px]",
}: LocationPickerMapProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);

  const [activeLayer, setActiveLayer] = useState<"standard" | "satellite">("satellite");
  const { isLocating, requestLocation } = useGeolocation();

  // Keep a ref to the latest onChange to avoid re-binding handlers
  const onChangeRef = useRef(onChange);
  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

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

    const map = L.map(container, {
      center: [initialLat, initialLng],
      zoom: 14,
      minZoom: 11,
      maxZoom: 19,
      zoomControl: false,
      attributionControl: false,
    });

    const config = TILE_LAYERS[activeLayer];
    const tileLayer = L.tileLayer(config.url, {
      attribution: config.attribution,
      maxNativeZoom: config.maxNativeZoom,
      maxZoom: 19,
    }).addTo(map);

    tileLayerRef.current = tileLayer;

    // Add draggable marker
    const marker = L.marker([initialLat, initialLng], {
      icon: createPickerMarkerIcon("Water Point Pin"),
      draggable: true,
      autoPan: true,
    }).addTo(map);

    marker.on("dragend", (e: any) => {
      const pos = e.target.getLatLng();
      const newLat = Number(pos.lat.toFixed(6));
      const newLng = Number(pos.lng.toFixed(6));
      onChangeRef.current(newLat, newLng);
    });

    markerRef.current = marker;

    // Click anywhere on map to reposition pin
    map.on("click", (e: L.LeafletMouseEvent) => {
      const newLat = Number(e.latlng.lat.toFixed(6));
      const newLng = Number(e.latlng.lng.toFixed(6));
      marker.setLatLng([newLat, newLng]);
      onChangeRef.current(newLat, newLng);
    });

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

    if (dist > 0.00005) {
      marker.setLatLng([latitude, longitude]);
      map.panTo([latitude, longitude], { animate: true });
    }
  }, [latitude, longitude]);

  // 3. Switch tile layer
  const toggleLayer = () => {
    const map = mapInstanceRef.current;
    if (!map) return;
    const nextLayer = activeLayer === "satellite" ? "standard" : "satellite";
    const config = TILE_LAYERS[nextLayer];

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
    }).addTo(map);

    tileLayerRef.current = newTile;
    setActiveLayer(nextLayer);
  };

  // 4. Center on user GPS
  const handleLocateMe = async () => {
    const pos = await requestLocation();
    if (pos) {
      const newLat = Number(pos.lat.toFixed(6));
      const newLng = Number(pos.lng.toFixed(6));
      onChange(newLat, newLng);

      if (mapInstanceRef.current) {
        mapInstanceRef.current.flyTo([newLat, newLng], 16, { duration: 1.2 });
      }
    }
  };

  // 5. Center on Irosin town center
  const handleResetCenter = () => {
    const newLat = IROSIN_COORDINATES.lat;
    const newLng = IROSIN_COORDINATES.lng;
    onChange(newLat, newLng);

    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([newLat, newLng], 14, { duration: 1 });
    }
  };

  return (
    <div className="relative w-full rounded-2xl overflow-hidden border border-slate-300 dark:border-slate-700 shadow-inner group">
      {/* Map rendering container */}
      <div ref={containerRef} className={`w-full ${className} bg-slate-100 dark:bg-slate-900 z-0`} />

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

        {/* Locate me button */}
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

        {/* Center on Irosin button */}
        <button
          type="button"
          onClick={handleResetCenter}
          className="h-9 w-9 rounded-xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-200 dark:border-slate-700 shadow-md text-slate-600 dark:text-slate-300 flex items-center justify-center hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer ml-auto"
          title="Reset View to Irosin Center"
        >
          <Compass className="h-4 w-4" />
        </button>
      </div>

      {/* Floating helper chip at bottom */}
      <div className="absolute bottom-3 left-3 right-3 sm:left-auto sm:right-3 z-[400] pointer-events-none">
        <div className="bg-slate-950/80 backdrop-blur-md border border-white/20 text-white text-[11px] font-medium px-3.5 py-1.5 rounded-full shadow-lg flex items-center gap-2">
          <Crosshair className="h-3.5 w-3.5 text-cyan-400 shrink-0 animate-pulse" />
          <span>Tap anywhere on the map or drag the pin to position the water source</span>
        </div>
      </div>
    </div>
  );
}
