// src/lib/supabase/storage.ts
import { createClient } from "./client";

export const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

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
      error: "Image exceeds 5MB size limit.",
    };
  }

  const supabase = createClient();
  const fileExt = file.name.split(".").pop();
  const fileName = `${Date.now()}-${crypto.randomUUID()}.${fileExt}`;
  const filePath = `${fileName}`;

  try {
    const { data, error } = await supabase.storage.from(bucket).upload(filePath, file, {
      cacheControl: "3600",
      upsert: false,
    });

    if (error) {
      return { success: false, error: error.message };
    }

    const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(data.path);

    return {
      success: true,
      data: {
        path: data.path,
        url: urlData.publicUrl,
      },
    };
  } catch (err: any) {
    return {
      success: false,
      error: err.message || "Failed to upload image to storage",
    };
  }
}
