// src/lib/map/map-utils.ts

export function calculateDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Radius of the Earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) *
      Math.cos(deg2rad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c;
  return Math.round(d * 10) / 10; // Round to 1 decimal place
}

function deg2rad(deg: number): number {
  return deg * (Math.PI / 180);
}

export function formatDistance(distanceKm?: number): string {
  if (distanceKm === undefined || isNaN(distanceKm)) return "";
  if (distanceKm < 1) {
    return `${Math.round(distanceKm * 1000)} m`;
  }
  return `${distanceKm.toFixed(1)} km`;
}

export function getDirectionsUrl(lat: number, lng: number, name?: string): string {
  const encodedName = name ? encodeURIComponent(name) : "";
  return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&destination_place_id=${encodedName}`;
}

export interface RouteStep {
  instruction: string;
  distanceMeters: number;
  durationSeconds: number;
}

export interface InAppRoute {
  coordinates: [number, number][]; // Leaflet [lat, lng]
  trailCoordinates?: [number, number][]; // Off-road mountain trail segment
  isOffRoad?: boolean;
  offRoadDistanceKm?: number;
  distanceKm: number;
  durationMinutes: number;
  steps: RouteStep[];
  originName: string;
  destinationName: string;
}

export async function fetchInAppRoute(
  originLat: number,
  originLng: number,
  destLat: number,
  destLng: number,
  originName: string = "Current Location",
  destinationName: string = "Destination"
): Promise<InAppRoute> {
  try {
    const url = `https://router.project-osrm.org/route/v1/driving/${originLng},${originLat};${destLng},${destLat}?overview=full&geometries=geojson&steps=true`;
    const res = await fetch(url, { signal: AbortSignal.timeout(6000) });
    if (!res.ok) throw new Error("Routing service returned error");
    const data = await res.json();

    if (data.routes && data.routes.length > 0) {
      const route = data.routes[0];
      const coords: [number, number][] = route.geometry.coordinates.map(
        ([lng, lat]: [number, number]) => [lat, lng]
      );

      // Check if start point is off-road and connect it directly
      const firstCoord = coords[0];
      if (firstCoord) {
        const originOffRoadKm = calculateDistanceKm(originLat, originLng, firstCoord[0], firstCoord[1]);
        if (originOffRoadKm > 0.015) {
          coords.unshift([originLat, originLng]);
        }
      }

      // Check if destination is off-road (e.g., spring, waterfall, or mountain)
      let offRoadDistanceKm = 0;
      let trailCoordinates: [number, number][] | undefined = undefined;
      const lastRoadCoord = coords[coords.length - 1];
      if (lastRoadCoord) {
        offRoadDistanceKm = calculateDistanceKm(lastRoadCoord[0], lastRoadCoord[1], destLat, destLng);
        if (offRoadDistanceKm > 0.015) {
          trailCoordinates = [
            [lastRoadCoord[0], lastRoadCoord[1]],
            [destLat, destLng],
          ];
          // Append the destination coordinate so the route line goes directly all the way to the pin
          coords.push([destLat, destLng]);
        }
      }

      const steps: RouteStep[] =
        route.legs?.[0]?.steps?.map((s: any) => ({
          instruction: s.maneuver?.type === "depart"
            ? `Start from ${originName}`
            : s.maneuver?.type === "arrive"
            ? `Arrive at nearest road access point for ${destinationName}`
            : `${capitalizeFirst(s.maneuver?.modifier || "")} ${s.name ? "onto " + s.name : ""}`.trim() || "Continue along road",
          distanceMeters: Math.round(s.distance),
          durationSeconds: Math.round(s.duration),
        })) || [];

      // If off-road, add mountain/trail final step and add to metrics
      if (offRoadDistanceKm > 0.015) {
        const trailMeters = Math.round(offRoadDistanceKm * 1000);
        const trailMinutes = Math.max(1, Math.round((offRoadDistanceKm / 3.5) * 60)); // ~3.5 km/h hiking/walking
        steps.push({
          instruction: `Off-road / mountain trail: proceed directly to ${destinationName}`,
          distanceMeters: trailMeters,
          durationSeconds: trailMinutes * 60,
        });
      }

      const totalDistanceKm = Math.round(((route.distance / 1000) + offRoadDistanceKm) * 10) / 10;
      const totalDurationMinutes = Math.max(
        1,
        Math.round(route.duration / 60) + (offRoadDistanceKm > 0.015 ? Math.max(1, Math.round((offRoadDistanceKm / 3.5) * 60)) : 0)
      );

      return {
        coordinates: coords,
        trailCoordinates,
        isOffRoad: offRoadDistanceKm > 0.015,
        offRoadDistanceKm: Math.round(offRoadDistanceKm * 10) / 10,
        distanceKm: totalDistanceKm,
        durationMinutes: totalDurationMinutes,
        steps,
        originName,
        destinationName,
      };
    }
  } catch (e) {
    console.warn("OSRM routing service unavailable, falling back to direct line estimation", e);
  }

  // Fallback direct line if network is offline
  const dist = calculateDistanceKm(originLat, originLng, destLat, destLng);
  return {
    coordinates: [
      [originLat, originLng],
      [destLat, destLng],
    ],
    distanceKm: dist,
    durationMinutes: Math.max(2, Math.round((dist / 30) * 60)), // ~30km/h average rural speed
    steps: [
      { instruction: `Head directly toward ${destinationName}`, distanceMeters: dist * 1000, durationSeconds: (dist / 30) * 3600 },
      { instruction: `Arrive at ${destinationName}`, distanceMeters: 0, durationSeconds: 0 },
    ],
    originName,
    destinationName,
  };
}

function capitalizeFirst(str: string): string {
  if (!str) return "Turn";
  return str.charAt(0).toUpperCase() + str.slice(1);
}

