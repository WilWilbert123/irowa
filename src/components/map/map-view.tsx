// src/components/map/map-view.tsx
"use client";

import React, { useState, useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, Polyline, useMap } from "react-leaflet";
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

// Map Controller for imperative actions (zooming, panning, recentering)
function MapController({
  center,
  zoom,
  triggerPanTo,
}: {
  center: [number, number];
  zoom: number;
  triggerPanTo?: [number, number] | null;
}) {
  const map = useMap();

  useEffect(() => {
    if (triggerPanTo) {
      map.flyTo(triggerPanTo, 15, { duration: 1.2 });
    }
  }, [triggerPanTo, map]);

  return null;
}

// Map Click Listener component for admin map editor
function MapClickHandler({ onClick }: { onClick?: (lat: number, lng: number) => void }) {
  const map = useMap();
  useEffect(() => {
    if (!onClick) return;
    const handler = (e: L.LeafletMouseEvent) => {
      onClick(e.latlng.lat, e.latlng.lng);
    };
    map.on("click", handler);
    return () => {
      map.off("click", handler);
    };
  }, [map, onClick]);
  return null;
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
  const [flyToCoords, setFlyToCoords] = useState<[number, number] | null>(null);
  const [activeRoute, setActiveRoute] = useState<InAppRoute | null>(null);
  const [isRouting, setIsRouting] = useState(false);
  const mapInstanceRef = useRef<L.Map | null>(null);

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

  const handleRecenter = () => {
    setFlyToCoords(MAP_CONFIG.center);
  };

  const handleLocateMe = async () => {
    const pos = await requestLocation();
    if (pos) {
      setFlyToCoords([pos.lat, pos.lng]);
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
      // Actively request user GPS location if not already granted
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

      if (mapInstanceRef.current && route.coordinates.length > 0) {
        const bounds = L.latLngBounds(route.coordinates);
        mapInstanceRef.current.fitBounds(bounds, { padding: [70, 70], maxZoom: 16 });
      }
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

      <MapContainer
        center={MAP_CONFIG.center}
        zoom={MAP_CONFIG.defaultZoom}
        minZoom={MAP_CONFIG.minZoom}
        maxZoom={19}
        className="w-full h-full z-0"
        zoomControl={false}
        ref={(map) => {
          if (map) mapInstanceRef.current = map;
        }}
      >
        <TileLayer
          key={currentLayer}
          url={TILE_LAYERS[currentLayer].url}
          attribution={TILE_LAYERS[currentLayer].attribution}
          maxNativeZoom={TILE_LAYERS[currentLayer].maxNativeZoom}
          maxZoom={19}
        />

        <MapController center={MAP_CONFIG.center} zoom={MAP_CONFIG.defaultZoom} triggerPanTo={flyToCoords} />

        {isEditorMode && onMapClickCoordinates && (
          <MapClickHandler onClick={onMapClickCoordinates} />
        )}

        {/* User Current Geolocation Pin (when not navigating) */}
        {location && !activeRoute && (
          <Marker
            position={[location.lat, location.lng]}
            icon={createLocationMarkerIcon()}
          />
        )}

        {/* Admin Editor Marker if active */}
        {editorMarker && (
          <Marker
            position={[editorMarker.lat, editorMarker.lng]}
            icon={createCategoryDivIcon("Other", true, "Available")}
          />
        )}

        {/* In-App Route Polyline */}
        {activeRoute && activeRoute.coordinates.length > 0 && (
          <>
            {/* Outer Glow */}
            <Polyline
              positions={activeRoute.coordinates}
              pathOptions={{
                color: "#38bdf8",
                weight: 9,
                opacity: 0.5,
                lineCap: "round",
                lineJoin: "round",
              }}
            />
            {/* Main Route Line (goes directly from start to destination pin) */}
            <Polyline
              positions={activeRoute.coordinates}
              pathOptions={{
                color: "#0284c7",
                weight: 5,
                opacity: 0.95,
                lineCap: "round",
                lineJoin: "round",
              }}
            />

            {/* Special Off-Road Mountain / Foot Trail Highlight (if destination is off paved roads) */}
            {activeRoute.trailCoordinates && (
              <Polyline
                positions={activeRoute.trailCoordinates}
                pathOptions={{
                  color: "#10b981", // Emerald green for nature/mountain foot trail
                  weight: 6,
                  opacity: 1,
                  dashArray: "8, 8",
                  lineCap: "round",
                }}
              />
            )}

            {/* Origin Start Point Marker with clear pulsing label */}
            <Marker
              position={activeRoute.coordinates[0]}
              icon={createStartLocationIcon(
                activeRoute.originName === "Your Location",
                activeRoute.originName === "Your Location" ? "START: You Are Here" : "START: Irosin Proper"
              )}
            />
          </>
        )}

        {/* Water Resource Markers */}
        {visibleSources.map((source) => {
          const isSelected = selectedSource?.id === source.id;
          const icon = createCategoryDivIcon(source.category, isSelected, source.availability_status);

          return (
            <Marker
              key={source.id}
              position={[source.latitude, source.longitude]}
              icon={icon}
              eventHandlers={{
                click: () => {
                  onSelectSource(source);
                  setFlyToCoords([source.latitude, source.longitude]);
                },
              }}
            />
          );
        })}
      </MapContainer>

      {/* Floating Category Filter (Mockup 1) */}
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

      {/* Selected Marker Popup Card (Mockups 1, 2, 5) */}
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
