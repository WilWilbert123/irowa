// supabase/functions/_shared/validation.ts
export function validateCoordinates(lat: number, lng: number): boolean {
  return (
    typeof lat === "number" &&
    typeof lng === "number" &&
    lat >= -90 &&
    lat <= 90 &&
    lng >= -180 &&
    lng <= 180
  );
}

export function sanitizeText(input: string): string {
  return input.trim().replace(/[<>]/g, "");
}
