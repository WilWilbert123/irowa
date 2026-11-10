// src/actions/water-actions.ts
"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import { waterSourceSchema } from "@/lib/validations/water-schema";
import { slugify } from "@/lib/utils/formatters";
import { logAdminAction } from "@/lib/services/audit-service";
import { getWaterSourceById, getPublishedWaterSources, getAllWaterSourcesAdmin, MOCK_IROSIN_WATER_SOURCES, saveWaterSourceCustomIcon, getWaterSourceCustomIcons, saveWaterSourceCategoryOverride } from "@/lib/services/water-service";
import { sendPushNotificationToSubscribers, MOCK_NOTIFICATIONS } from "@/lib/services/notification-service";
import { revalidatePath } from "next/cache";

export async function getAllWaterSourcesAction() {
  return await getAllWaterSourcesAdmin();
}

export async function getWaterSourceByIdAction(id: string) {
  return await getWaterSourceById(id);
}

export async function getPublishedWaterSourcesAction(filters?: any) {
  return await getPublishedWaterSources(filters);
}

export async function saveWaterSourceCustomIconAction(waterSourceId: string, iconId: string, color?: string) {
  return await saveWaterSourceCustomIcon(waterSourceId, iconId, color);
}

export async function getWaterSourceCustomIconsAction() {
  return await getWaterSourceCustomIcons();
}

const CATEGORY_NORMALIZER: Record<string, string> = {
  public_water_source: "Public Water Source",
  "public water source": "Public Water Source",
  spring: "Spring",
  river: "River",
  waterfall: "Waterfall",
  resort: "Resort",
  lake: "Lake",
  water_refilling_station: "Water Refilling Station",
  "water refilling station": "Water Refilling Station",
  deep_well: "Deep Well",
  "deep well": "Deep Well",
  community_water_point: "Community Water Point",
  "community water point": "Community Water Point",
  other: "Other",
  "Public Water Source": "Public Water Source",
  Spring: "Spring",
  River: "River",
  Waterfall: "Waterfall",
  Resort: "Resort",
  Lake: "Lake",
  "Water Refilling Station": "Water Refilling Station",
  "Deep Well": "Deep Well",
  "Community Water Point": "Community Water Point",
  Other: "Other",
};

const AVAILABILITY_NORMALIZER: Record<string, string> = {
  available: "Available",
  limited_supply: "Limited Supply",
  "limited supply": "Limited Supply",
  temporarily_unavailable: "Temporarily Unavailable",
  "temporarily unavailable": "Temporarily Unavailable",
  seasonal: "Seasonal",
  unknown: "Unknown",
  Available: "Available",
  "Limited Supply": "Limited Supply",
  "Temporarily Unavailable": "Temporarily Unavailable",
  Seasonal: "Seasonal",
  Unknown: "Unknown",
};

const VERIFICATION_NORMALIZER: Record<string, string> = {
  verified: "Verified",
  unverified: "Unverified",
  stale: "Unverified",
  Verified: "Verified",
  Unverified: "Unverified",
};

function normalizeWaterSourceData(input: any) {
  if (!input || typeof input !== "object") return input;
  const result = { ...input };
  if (result.category) {
    result.category = CATEGORY_NORMALIZER[result.category] || CATEGORY_NORMALIZER[String(result.category).toLowerCase()] || result.category;
  }
  if (result.availability_status) {
    result.availability_status = AVAILABILITY_NORMALIZER[result.availability_status] || AVAILABILITY_NORMALIZER[String(result.availability_status).toLowerCase()] || result.availability_status;
  }
  if (result.verification_status) {
    result.verification_status = VERIFICATION_NORMALIZER[result.verification_status] || VERIFICATION_NORMALIZER[String(result.verification_status).toLowerCase()] || result.verification_status;
  }
  return result;
}

export async function createWaterSourceAction(formData: any) {
  const normalizedData = normalizeWaterSourceData(formData);
  const validated = waterSourceSchema.safeParse(normalizedData);
  if (!validated.success) {
    return { success: false, error: (validated.error as any).issues?.[0]?.message || "Validation failed" };
  }

  const data = validated.data;
  const slug = `${slugify(data.name)}-${crypto.randomUUID().slice(0, 8)}`;

  if (!isSupabaseConfigured()) {
    const newId = `ws_${Date.now()}`;
    const photos = Array.isArray(formData.photos)
      ? formData.photos.map((p: any, i: number) => ({
          id: `p_${Date.now()}_${i}`,
          water_source_id: newId,
          storage_path: p.storage_path,
          caption: p.caption || null,
          is_primary: p.is_primary ?? (i === 0),
          uploaded_by: null,
          created_at: new Date().toISOString(),
        }))
      : [];

    MOCK_IROSIN_WATER_SOURCES.unshift({
      id: newId,
      name: data.name,
      slug,
      category: data.category as any,
      description: data.description || null,
      latitude: data.latitude,
      longitude: data.longitude,
      address: data.address || null,
      barangay: data.barangay || null,
      availability_status: data.availability_status as any,
      verification_status: "Verified",
      operating_hours: data.operating_hours || null,
      contact_information: data.contact_information || null,
      is_published: data.is_published,
      published_at: new Date().toISOString(),
      last_verified_at: new Date().toISOString(),
      reverify_at: null,
      created_by: null,
      updated_by: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      archived_at: null,
      photos,
    });
    return { success: true, id: newId };
  }

  try {
    const admin = createAdminClient();
    let insertCategory = data.category;
    let fallbackToOther = false;

    let { data: newSource, error } = await admin
      .from("water_sources")
      .insert({
        name: data.name,
        slug,
        category: insertCategory,
        description: data.description || null,
        latitude: data.latitude,
        longitude: data.longitude,
        address: data.address || null,
        barangay: data.barangay || null,
        availability_status: data.availability_status,
        verification_status: "Verified",
        operating_hours: data.operating_hours || null,
        contact_information: data.contact_information || null,
        is_published: data.is_published,
      })
      .select("id")
      .single();

    if (error && (error.code === "23514" || error.message?.includes("water_sources_category_check")) && insertCategory === "Lake") {
      fallbackToOther = true;
      const retry = await admin
        .from("water_sources")
        .insert({
          name: data.name,
          slug,
          category: "Other",
          description: data.description || null,
          latitude: data.latitude,
          longitude: data.longitude,
          address: data.address || null,
          barangay: data.barangay || null,
          availability_status: data.availability_status,
          verification_status: "Verified",
          operating_hours: data.operating_hours || null,
          contact_information: data.contact_information || null,
          is_published: data.is_published,
        })
        .select("id")
        .single();
      newSource = retry.data;
      error = retry.error;
    }

    if (error || !newSource) {
      return { success: false, error: error?.message || "Failed to create water source" };
    }

    if (fallbackToOther || insertCategory === "Lake") {
      await saveWaterSourceCategoryOverride(newSource.id, "Lake");
    }

    // Direct atomic attachment of gallery photos if included
    if (Array.isArray(formData.photos) && formData.photos.length > 0) {
      try {
        const photosToInsert = formData.photos.map((p: any, idx: number) => ({
          water_source_id: newSource.id,
          storage_path: p.storage_path,
          caption: p.caption || null,
          is_primary: p.is_primary ?? (idx === 0),
        }));
        await admin.from("water_photos").insert(photosToInsert);
      } catch (photoErr) {
        console.warn("Non-fatal photo link warning:", photoErr);
      }
    }

    // Auto-create chat room for this water source
    try {
      await admin.from("chat_rooms").insert({
        water_source_id: newSource.id,
        is_active: true,
      });
    } catch {
      // Safe non-blocking fallback
    }

    // Broadcast notification to all citizens
    if (data.is_published) {
      try {
        const locText = data.barangay
          ? `in ${data.barangay.startsWith("Brgy.") ? data.barangay : `Brgy. ${data.barangay}`}`
          : "in Irosin";

        await admin.from("notifications").insert({
          type: "new_water_source",
          title: "New Water Source Verified",
          body: `${data.name} ${locText} has been officially verified and added to the IroWa interactive map.`,
          water_source_id: newSource.id,
          is_read: false,
        });

        // Dispatch web push to subscribed devices
        sendPushNotificationToSubscribers({
          title: "New Water Source Verified",
          body: `${data.name} ${locText} has been added to the IroWa map.`,
          url: `/water/${newSource.id}`,
        }).catch(() => {});
      } catch {
        // Safe non-blocking fallback
      }
    }

    if (formData?.custom_icon_id && newSource.id) {
      await saveWaterSourceCustomIcon(newSource.id, formData.custom_icon_id, formData.custom_icon_color);
    }

    logAdminAction("CREATE_WATER_SOURCE", "water_source", newSource.id, { name: data.name }).catch(() => {});

    try {
      revalidatePath("/admin/water-sources");
      revalidatePath("/admin/water-sources/new");
      revalidatePath("/admin");
      revalidatePath("/water");
      revalidatePath("/notifications");
      revalidatePath("/home");
      revalidatePath("/map");
    } catch {
      // non-blocking
    }

    return { success: true, id: newSource.id };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to create water source" };
  }
}

export async function updateWaterSourceAction(id: string, formData: any) {
  const normalizedData = normalizeWaterSourceData(formData);
  const validated = waterSourceSchema.partial().safeParse(normalizedData);
  if (!validated.success) {
    return { success: false, error: (validated.error as any).issues?.[0]?.message || "Validation failed" };
  }

  const updatePayload: Record<string, any> = {
    ...validated.data,
    updated_at: new Date().toISOString(),
  };

  if (validated.data.name) {
    updatePayload.slug = `${slugify(validated.data.name)}-${crypto.randomUUID().slice(0, 8)}`;
  }

  if (!isSupabaseConfigured()) {
    const idx = MOCK_IROSIN_WATER_SOURCES.findIndex((s) => s.id === id);
    if (idx !== -1) {
      MOCK_IROSIN_WATER_SOURCES[idx] = {
        ...MOCK_IROSIN_WATER_SOURCES[idx],
        ...updatePayload,
      };
    }
    return { success: true };
  }

  try {
    const admin = createAdminClient();
    let { error } = await admin
      .from("water_sources")
      .update(updatePayload)
      .eq("id", id);

    if (error && (error.code === "23514" || error.message?.includes("water_sources_category_check")) && updatePayload.category === "Lake") {
      const retryPayload = { ...updatePayload, category: "Other" };
      const retryRes = await admin
        .from("water_sources")
        .update(retryPayload)
        .eq("id", id);
      error = retryRes.error;
      if (!error) {
        await saveWaterSourceCategoryOverride(id, "Lake");
      }
    } else if (!error && updatePayload.category) {
      await saveWaterSourceCategoryOverride(id, updatePayload.category);
    }

    if (error) return { success: false, error: error.message };

    if (formData?.custom_icon_id) {
      await saveWaterSourceCustomIcon(id, formData.custom_icon_id, formData.custom_icon_color);
    }

    logAdminAction("UPDATE_WATER_SOURCE", "water_source", id, validated.data).catch(() => {});

    try {
      revalidatePath("/admin/water-sources");
      revalidatePath(`/admin/water-sources/${id}`);
      revalidatePath(`/admin/water-sources/${id}/edit`);
      revalidatePath("/admin");
      revalidatePath(`/water/${id}`);
      revalidatePath("/water");
      revalidatePath("/home");
      revalidatePath("/map");
    } catch {
      // non-blocking
    }

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to update water source" };
  }
}

export async function deleteWaterSourceAction(id: string) {
  try {
    const admin = createAdminClient();

    // 1. Parallelize dependent deletions for maximum speed
    await Promise.allSettled([
      admin.from("water_photos").delete().eq("water_source_id", id),
      admin.from("water_reports").delete().eq("water_source_id", id),
      admin.from("saved_locations").delete().eq("water_source_id", id),
      admin.from("chat_messages").delete().eq("water_source_id", id),
      admin.from("chat_rooms").delete().eq("water_source_id", id),
    ]);

    // 2. Hard-delete from water_sources
    const { error: deleteErr } = await admin.from("water_sources").delete().eq("id", id);

    if (deleteErr) {
      console.warn("Hard delete failed, falling back to soft-delete archive:", deleteErr.message);
      const { error: archiveErr } = await admin
        .from("water_sources")
        .update({
          archived_at: new Date().toISOString(),
          is_published: false,
        })
        .eq("id", id);

      if (archiveErr) return { error: archiveErr.message };
    }

    // 3. Update in-memory mock if in fallback mode
    const idx = MOCK_IROSIN_WATER_SOURCES.findIndex((s) => s.id === id);
    if (idx !== -1) {
      MOCK_IROSIN_WATER_SOURCES.splice(idx, 1);
    }

    // 4. Background logging & path revalidation
    logAdminAction("DELETE_WATER_SOURCE", "water_source", id).catch(() => {});
    try {
      revalidatePath("/admin/water-sources");
      revalidatePath("/admin");
      revalidatePath("/home");
      revalidatePath("/map");
    } catch {
      // non-blocking
    }

    return { success: true };
  } catch (err: any) {
    return { error: err.message || "Failed to delete water source" };
  }
}

export async function archiveWaterSourceAction(id: string) {
  return await deleteWaterSourceAction(id);
}

export async function syncWaterSourcePhotosAction(
  waterSourceId: string,
  photos: Array<{ id?: string; storage_path: string; caption?: string | null; is_primary?: boolean }>
) {
  if (!isSupabaseConfigured()) {
    const idx = MOCK_IROSIN_WATER_SOURCES.findIndex((s) => s.id === waterSourceId);
    if (idx !== -1) {
      MOCK_IROSIN_WATER_SOURCES[idx].photos = photos.map((p, i) => ({
        id: p.id && !p.id.startsWith("new_") ? p.id : `p_${Date.now()}_${i}`,
        water_source_id: waterSourceId,
        storage_path: p.storage_path,
        caption: p.caption || null,
        is_primary: p.is_primary ?? (i === 0),
        uploaded_by: null,
        created_at: new Date().toISOString(),
      }));
    }
    return { success: true };
  }

  try {
    const admin = createAdminClient();

    // Fetch current photos for this water source
    const { data: currentPhotos } = await admin
      .from("water_photos")
      .select("id")
      .eq("water_source_id", waterSourceId);

    const currentIds = (currentPhotos || []).map((p: any) => p.id);
    const keepIds = photos.filter((p) => p.id && !p.id.startsWith("new_")).map((p) => p.id as string);
    const toDeleteIds = currentIds.filter((id: string) => !keepIds.includes(id));

    // Delete removed photos
    if (toDeleteIds.length > 0) {
      await admin.from("water_photos").delete().in("id", toDeleteIds);
    }

    // Insert newly added photos
    const newPhotos = photos.filter((p) => !p.id || p.id.startsWith("new_"));
    if (newPhotos.length > 0) {
      await admin.from("water_photos").insert(
        newPhotos.map((p, idx) => ({
          water_source_id: waterSourceId,
          storage_path: p.storage_path,
          caption: p.caption || null,
          is_primary: p.is_primary ?? (idx === 0 && keepIds.length === 0),
        }))
      );
    }

    // Update is_primary for kept photos
    for (const p of photos) {
      if (p.id && !p.id.startsWith("new_") && p.is_primary !== undefined) {
        await admin
          .from("water_photos")
          .update({ is_primary: p.is_primary })
          .eq("id", p.id);
      }
    }

    revalidatePath(`/admin/water-sources/${waterSourceId}`);
    revalidatePath(`/admin/water-sources/${waterSourceId}/edit`);
    revalidatePath(`/water/${waterSourceId}`);
    revalidatePath("/water");
    revalidatePath("/home");
    revalidatePath("/map");

    return { success: true };
  } catch (err: any) {
    console.error("Error syncing water source photos:", err);
    return { error: err.message || "Failed to sync photos" };
  }
}
