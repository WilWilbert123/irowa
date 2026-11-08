// src/actions/storage-actions.ts
"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { isSupabaseConfigured } from "@/lib/supabase/client";

const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export interface StorageUploadActionResult {
  success: boolean;
  data?: {
    path: string;
    url: string;
  };
  error?: string;
}

export async function uploadStorageImageAction(
  formData: FormData
): Promise<StorageUploadActionResult> {
  try {
    const file = formData.get("file") as File | null;
    const bucket = (formData.get("bucket") as string) || "submission-photos";

    if (!file) {
      return { success: false, error: "No file provided for upload" };
    }

    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      return {
        success: false,
        error: "Invalid file format. Only JPEG, PNG, and WebP images are allowed.",
      };
    }

    if (file.size > MAX_FILE_SIZE) {
      return { success: false, error: "Image exceeds 10MB limit." };
    }

    if (!isSupabaseConfigured()) {
      return {
        success: false,
        error: "Database storage is offline. Fallback enabled.",
      };
    }

    const admin = createAdminClient();
    const fileExt = file.name ? file.name.split(".").pop() : "jpg";
    const fileName = `${Date.now()}-${crypto.randomUUID()}.${fileExt}`;
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const { data, error } = await admin.storage
      .from(bucket)
      .upload(fileName, buffer, {
        contentType: file.type || "image/jpeg",
        upsert: true,
      });

    if (error) {
      return { success: false, error: error.message };
    }

    const { data: urlData } = admin.storage.from(bucket).getPublicUrl(data.path);

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
      error: err.message || "Failed to upload image to Supabase storage",
    };
  }
}

