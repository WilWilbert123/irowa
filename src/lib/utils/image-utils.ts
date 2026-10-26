// src/lib/utils/image-utils.ts

export function getPublicStorageUrl(path?: string | null): string {
  if (!path) return "/images/irosin-map-placeholder.svg";
  if (path.startsWith("http://") || path.startsWith("https://") || path.startsWith("/")) {
    return path;
  }
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  return `${supabaseUrl}/storage/v1/object/public/water-photos/${path}`;
}

export function validateImageFile(file: File): { valid: boolean; error?: string } {
  const allowed = ["image/jpeg", "image/png", "image/webp"];
  if (!allowed.includes(file.type)) {
    return { valid: false, error: "Only JPEG, PNG, and WebP images are allowed." };
  }
  const maxSize = 5 * 1024 * 1024; // 5MB
  if (file.size > maxSize) {
    return { valid: false, error: "Image size must be under 5MB." };
  }
  return { valid: true };
}
