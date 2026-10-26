// src/lib/map/map-config.ts
import { IROSIN_COORDINATES, DEFAULT_MAP_ZOOM } from "../utils/constants";

export const MAP_CONFIG = {
  center: [IROSIN_COORDINATES.lat, IROSIN_COORDINATES.lng] as [number, number],
  defaultZoom: DEFAULT_MAP_ZOOM,
  minZoom: 11,
  maxZoom: 19,
  maxBounds: [
    [12.50, 123.85], // Southwest coordinates around Irosin & Mt Bulusan
    [12.90, 124.25], // Northeast coordinates
  ] as [[number, number], [number, number]],
  tileUrl:
    process.env.NEXT_PUBLIC_MAP_TILE_URL ||
    "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
  attribution:
    '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors',
};
