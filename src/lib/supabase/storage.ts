// src/lib/supabase/storage.ts
import { uploadStorageImageAction } from "@/actions/storage-actions";

export const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

export interface StorageUploadResult {
  path: string;
  url: string;
}

export async function uploadWaterImage(
  file: File,
  bucket: "water-photos" | "submission-photos" = "water-photos"
): Promise<{ success: boolean; data?: StorageUploadResult; error?: string }> {
  // Validate type
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return {
      success: false,
      error: "Invalid file format. Only JPEG, PNG, and WebP images are allowed.",
    };
  }

  // Validate size
  if (file.size > MAX_FILE_SIZE) {
    return {
      success: false,
      error: "Image exceeds 10MB size limit.",
    };
  }

  const formData = new FormData();
  formData.append("file", file);
  formData.append("bucket", bucket);

  // 1. Direct browser HTTP upload route for maximum speed and zero payload limitation
  if (typeof window !== "undefined") {
    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const json = await response.json();
        if (json.success && json.data) {
          return { success: true, data: json.data };
        }
      }
    } catch {
      // Fallback to server action
    }
  }

  // 2. Fallback to Server Action upload with admin privileges
  try {
    const res = await uploadStorageImageAction(formData);
    return res;
  } catch (err: any) {
    return {
      success: false,
      error: err.message || "Failed to upload image to storage",
    };
  }
}
