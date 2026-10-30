// src/components/map/map-view.tsx
"use client";

import React, { useState, useEffect, useRef } from "react";
import L from "leaflet";
import { WaterSourceWithPhotos } from "@/types/water";
import { WaterCategory } from "@/types/database.types";
import { MAP_CONFIG } from "@/lib/map/map-config";
import { createCategoryDivIcon, createLocationMarkerIcon, createStartLocationIcon } from "@/lib/map/map-icons";
import { InAppRoute, fetchInAppRoute } from "@/lib/map/map-utils";
import { MapCategoryFilter } from "./map-category-filter";
import { MapControls } from "./map-controls";
import { MarkerPopupCard } from "./marker-popup-card";
import { DirectionsPanel } from "./directions-panel";
import { useGeolocation } from "@/hooks/use-geolocation";
import { useIsMobile } from "@/hooks/use-mobile";
import { useVisitor } from "@/contexts/visitor-context";

interface MapViewProps {
  sources: WaterSourceWithPhotos[];
  selectedSource: WaterSourceWithPhotos | null;
  onSelectSource: (source: WaterSourceWithPhotos | null) => void;
  selectedCategory: WaterCategory | "All";
  onSelectCategory: (category: WaterCategory | "All") => void;
  className?: string;
  isEditorMode?: boolean;
  onMapClickCoordinates?: (lat: number, lng: number) => void;
  editorMarker?: { lat: number; lng: number } | null;
}

const TILE_LAYERS = {
  standard: {
    url: MAP_CONFIG.tileUrl,
    attribution: MAP_CONFIG.attribution,
    maxNativeZoom: 18,
  },
  satellite: {
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    attribution: "Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community",
    maxNativeZoom: 17,
  },
  terrain: {
    url: "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png",
    attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a>',
    subdomains: "abc",
    maxNativeZoom: 16,
  },
};

export function MapView({
  sources,
  selectedSource,
  onSelectSource,
  selectedCategory,
  onSelectCategory,
  className,
  isEditorMode = false,
  onMapClickCoordinates,
  editorMarker,
}: MapViewProps) {
  const isMobile = useIsMobile();
  const { preferences, updatePreferences } = useVisitor();
  const { location, isLocating, requestLocation } = useGeolocation();
  const [currentLayer, setCurrentLayer] = useState<"standard" | "satellite" | "terrain">(
    preferences?.mapStyle || "satellite"
  );
  const [activeRoute, setActiveRoute] = useState<InAppRoute | null>(null);
  const [isRouting, setIsRouting] = useState(false);

  // Direct Leaflet refs
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const markersGroupRef = useRef<L.LayerGroup | null>(null);
  const routeGroupRef = useRef<L.LayerGroup | null>(null);
  const userMarkerRef = useRef<L.Marker | null>(null);
  const editorMarkerRef = useRef<L.Marker | null>(null);
  const onMapClickRef = useRef(onMapClickCoordinates);

  useEffect(() => {
    onMapClickRef.current = onMapClickCoordinates;
  }, [onMapClickCoordinates]);

  // Sync if preferences update from storage
  useEffect(() => {
    if (preferences?.mapStyle) {
      setCurrentLayer(preferences.mapStyle);
    }
  }, [preferences?.mapStyle]);

  const handleLayerChange = (layer: "standard" | "satellite" | "terrain") => {
    setCurrentLayer(layer);
    updatePreferences({ mapStyle: layer });
  };

  // Filter sources
  const visibleSources = sources.filter((s) => {
    if (selectedCategory === "All") return true;
    return s.category === selectedCategory;
  });

  // 1. Initialize Leaflet Map on mount
  useEffect(() => {
    const container = mapContainerRef.current;
    if (!container) return;

    // Clean up any existing map instance on this container
    if (mapInstanceRef.current) {
      try {
        mapInstanceRef.current.remove();
      } catch {
        // safe ignore
      }
      mapInstanceRef.current = null;
    }

    // Reset Leaflet internal container tracking ID if stale
    if ((container as any)._leaflet_id) {
      try {
        delete (container as any)._leaflet_id;
      } catch {
        // safe ignore
      }
    }

    const map = L.map(container, {
      center: MAP_CONFIG.center,
      zoom: MAP_CONFIG.defaultZoom,
      minZoom: MAP_CONFIG.minZoom,
      maxZoom: 19,
      zoomControl: false,
      attributionControl: false,
    });

    const config = TILE_LAYERS[currentLayer] || TILE_LAYERS.satellite;
    const tileLayer = L.tileLayer(config.url, {
      attribution: config.attribution,
      maxNativeZoom: config.maxNativeZoom,
      maxZoom: 19,
      subdomains: "subdomains" in config ? (config as any).subdomains : "abc",
    }).addTo(map);

    tileLayerRef.current = tileLayer;

    // Layer groups for markers and routes
    const markersGroup = L.layerGroup().addTo(map);
    const routeGroup = L.layerGroup().addTo(map);

    markersGroupRef.current = markersGroup;
    routeGroupRef.current = routeGroup;
    mapInstanceRef.current = map;

    // Click handler for editor mode
    map.on("click", (e: L.LeafletMouseEvent) => {
      if (onMapClickRef.current) {
        onMapClickRef.current(e.latlng.lat, e.latlng.lng);
      }
    });

    // Invalidate size to ensure proper rendering after container mount
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
      tileLayerRef.current = null;
      markersGroupRef.current = null;
      routeGroupRef.current = null;
      userMarkerRef.current = null;
      editorMarkerRef.current = null;
      if (container) {
        try {
          delete (container as any)._leaflet_id;
        } catch {
          // safe ignore
        }
      }
    };
  }, []);

  // 2. Tile layer updates
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;
    const config = TILE_LAYERS[currentLayer] || TILE_LAYERS.satellite;

    if (tileLayerRef.current) {
      try {
        map.removeLayer(tileLayerRef.current);
      } catch {
        // ignore
      }
    }

    const tileLayer = L.tileLayer(config.url, {
      attribution: config.attribution,
      maxNativeZoom: config.maxNativeZoom,
      maxZoom: 19,
      subdomains: "subdomains" in config ? (config as any).subdomains : "abc",
    }).addTo(map);

    tileLayerRef.current = tileLayer;
  }, [currentLayer]);

  // 3. Render and sync water source markers
  useEffect(() => {
    const map = mapInstanceRef.current;
    const group = markersGroupRef.current;
    if (!map || !group) return;

    group.clearLayers();

    visibleSources.forEach((source) => {
      const isSelected = selectedSource?.id === source.id;
      const icon = createCategoryDivIcon(source.category, isSelected, source.availability_status);
      const marker = L.marker([source.latitude, source.longitude], { icon });

      marker.on("click", () => {
        onSelectSource(source);
        map.flyTo([source.latitude, source.longitude], 15, { duration: 1.0 });
      });

      marker.addTo(group);
    });
  }, [visibleSources, selectedSource, onSelectSource]);

  // 4. User location marker
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (userMarkerRef.current) {
      try {
        map.removeLayer(userMarkerRef.current);
      } catch {
        // ignore
      }
      userMarkerRef.current = null;
    }

    if (location && !activeRoute) {
      const marker = L.marker([location.lat, location.lng], {
        icon: createLocationMarkerIcon(),
      }).addTo(map);
      userMarkerRef.current = marker;
    }
  }, [location, activeRoute]);

  // 5. Admin editor marker
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (editorMarkerRef.current) {
      try {
        map.removeLayer(editorMarkerRef.current);
      } catch {
        // ignore
      }
      editorMarkerRef.current = null;
    }

    if (editorMarker) {
      const marker = L.marker([editorMarker.lat, editorMarker.lng], {
        icon: createCategoryDivIcon("Other", true, "Available"),
      }).addTo(map);
      editorMarkerRef.current = marker;
    }
  }, [editorMarker]);

  // 6. Active route polylines
  useEffect(() => {
    const map = mapInstanceRef.current;
    const group = routeGroupRef.current;
    if (!map || !group) return;

    group.clearLayers();

    if (activeRoute && activeRoute.coordinates.length > 0) {
      // Outer glow
      L.polyline(activeRoute.coordinates, {
        color: "#38bdf8",
        weight: 9,
        opacity: 0.5,
        lineCap: "round",
        lineJoin: "round",
      }).addTo(group);

      // Main route
      L.polyline(activeRoute.coordinates, {
        color: "#0284c7",
        weight: 5,
        opacity: 0.95,
        lineCap: "round",
        lineJoin: "round",
      }).addTo(group);

      // Off-road trail
      if (activeRoute.trailCoordinates) {
        L.polyline(activeRoute.trailCoordinates, {
          color: "#10b981",
          weight: 6,
          opacity: 1,
          dashArray: "8, 8",
          lineCap: "round",
        }).addTo(group);
      }

      // Origin marker
      const originIcon = createStartLocationIcon(
        activeRoute.originName === "Your Location",
        activeRoute.originName === "Your Location" ? "START: You Are Here" : "START: Irosin Proper"
      );
      L.marker(activeRoute.coordinates[0], { icon: originIcon }).addTo(group);

      const bounds = L.latLngBounds(activeRoute.coordinates);
      map.fitBounds(bounds, { padding: [70, 70], maxZoom: 16 });
    }
  }, [activeRoute]);

  const handleRecenter = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo(MAP_CONFIG.center, MAP_CONFIG.defaultZoom, { duration: 1.2 });
    }
  };

  const handleLocateMe = async () => {
    const pos = await requestLocation();
    if (pos && mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([pos.lat, pos.lng], 15, { duration: 1.2 });
    }
  };

  const handleZoomIn = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.zoomIn();
    }
  };

  const handleZoomOut = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.zoomOut();
    }
  };

  const handleGetDirections = async (source: WaterSourceWithPhotos) => {
    setIsRouting(true);
    onSelectSource(null); // dismiss card to show route
    try {
      let userCoords = location;
      if (!userCoords) {
        try {
          userCoords = await requestLocation();
        } catch {
          // ignore and fall back to town center
        }
      }

      const isGPS = !!userCoords;
      const originLat = userCoords ? userCoords.lat : MAP_CONFIG.center[0];
      const originLng = userCoords ? userCoords.lng : MAP_CONFIG.center[1];
      const originName = isGPS ? "Your Location" : "Irosin Town Proper";

      const route = await fetchInAppRoute(
        originLat,
        originLng,
        source.latitude,
        source.longitude,
        originName,
        source.name
      );

      setActiveRoute(route);
    } catch (err) {
      console.error("Failed to load in-app directions", err);
    } finally {
      setIsRouting(false);
    }
  };

  return (
    <div className={`relative w-full h-full overflow-hidden ${className || ""}`}>
      {/* Route Loading Banner */}
      {isRouting && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[1100] px-4 py-2 rounded-full bg-slate-900/90 text-white backdrop-blur-md shadow-xl flex items-center gap-2.5 text-xs font-semibold animate-in fade-in">
          <div className="w-3.5 h-3.5 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
          <span>Finding your location & calculating route...</span>
        </div>
      )}

      {/* Pure Leaflet Map Container */}
      <div
        ref={mapContainerRef}
        className="w-full h-full z-0"
        style={{ width: "100%", height: "100%" }}
      />

      {/* Floating Category Filter */}
      {!isEditorMode && !activeRoute && (
        <MapCategoryFilter
          selectedCategory={selectedCategory}
          onSelectCategory={onSelectCategory}
        />
      )}

      {/* Map Control Buttons (Bottom Right) */}
      <MapControls
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onRecenter={handleRecenter}
        onLocateUser={handleLocateMe}
        onChangeTileLayer={handleLayerChange}
        currentLayer={currentLayer}
        isLocating={isLocating}
      />

      {/* In-App Directions Panel */}
      {activeRoute && (
        <DirectionsPanel
          route={activeRoute}
          onClose={() => setActiveRoute(null)}
          isMobile={isMobile}
        />
      )}

      {/* Selected Marker Popup Card */}
      {selectedSource && !activeRoute && (
        <MarkerPopupCard
          source={selectedSource}
          onClose={() => onSelectSource(null)}
          onGetDirections={handleGetDirections}
          isMobile={isMobile}
        />
      )}
    </div>
  );
}
