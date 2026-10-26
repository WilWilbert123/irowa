// src/lib/map/geolocation.ts

export interface GeolocationPosition {
  lat: number;
  lng: number;
  accuracy: number;
}

export function getCurrentUserLocation(): Promise<GeolocationPosition> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocation is not supported by your browser"));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy,
        });
      },
      (error) => {
        let msg = "Unable to retrieve location";
        switch (error.code) {
          case error.PERMISSION_DENIED:
            msg = "Location permission denied by user";
            break;
          case error.POSITION_UNAVAILABLE:
            msg = "Location information is unavailable";
            break;
          case error.TIMEOUT:
            msg = "Location request timed out";
            break;
        }
        reject(new Error(msg));
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
      }
    );
  });
}
