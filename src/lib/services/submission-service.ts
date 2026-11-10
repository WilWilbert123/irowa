// src/lib/services/submission-service.ts
import { createClient, isSupabaseConfigured } from "../supabase/client";
import { createAdminClient } from "../supabase/admin";
import { WaterSubmissionWithPhotos } from "@/types/submission";
import { SubmissionFormData } from "../validations/submission-schema";
import { checkRateLimit } from "../utils/rate-limit";
import { slugify } from "../utils/formatters";
import { sendPushNotificationToSubscribers } from "./notification-service";
import { saveWaterSourceCustomIcon, saveWaterSourceCategoryOverride } from "./water-service";

let submissionCategoriesCache: Record<string, string> | null = null;

export async function getSubmissionCategoryOverrides(): Promise<Record<string, string>> {
  if (submissionCategoriesCache) return submissionCategoriesCache;
  if (!isSupabaseConfigured()) return submissionCategoriesCache || {};

  try {
    const supabase = createClient();
    const { data } = await supabase
      .from("application_settings")
      .select("value")
      .eq("key", "submission_categories")
      .maybeSingle();

    if (data?.value && typeof data.value === "object") {
      submissionCategoriesCache = data.value as Record<string, string>;
      return submissionCategoriesCache;
    }
  } catch {
    // fallback
  }
  return submissionCategoriesCache || {};
}

export async function saveSubmissionCategoryOverride(submissionId: string, category: string): Promise<boolean> {
  if (!submissionId || !category) return false;
  if (!submissionCategoriesCache) submissionCategoriesCache = {};
  submissionCategoriesCache[submissionId] = category;

  if (!isSupabaseConfigured()) return true;

  try {
    const admin = createAdminClient();
    const { data } = await admin
      .from("application_settings")
      .select("value")
      .eq("key", "submission_categories")
      .maybeSingle();

    const currentMap = data?.value && typeof data.value === "object" ? (data.value as Record<string, any>) : {};
    currentMap[submissionId] = category;

    await admin.from("application_settings").upsert(
      {
        key: "submission_categories",
        value: currentMap,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "key" }
    );
    return true;
  } catch (err) {
    console.error("Failed to save submission category override:", err);
    return false;
  }
}

let submissionIconsCache: Record<string, { iconId: string; color?: string }> | null = null;

export async function getSubmissionCustomIcons(): Promise<Record<string, { iconId: string; color?: string }>> {
  if (submissionIconsCache) return submissionIconsCache;
  if (!isSupabaseConfigured()) return submissionIconsCache || {};

  try {
    const supabase = createClient();
    const { data } = await supabase
      .from("application_settings")
      .select("value")
      .eq("key", "submission_custom_icons")
      .maybeSingle();

    if (data?.value && typeof data.value === "object") {
      submissionIconsCache = data.value as Record<string, { iconId: string; color?: string }>;
      return submissionIconsCache;
    }
  } catch {
    // fallback
  }
  return submissionIconsCache || {};
}

export async function saveSubmissionCustomIcon(
  submissionId: string,
  iconId: string,
  color?: string
): Promise<boolean> {
  if (!submissionId || !iconId) return false;
  if (!submissionIconsCache) submissionIconsCache = {};
  submissionIconsCache[submissionId] = { iconId, color };

  if (!isSupabaseConfigured()) return true;

  try {
    const admin = createAdminClient();
    const { data } = await admin
      .from("application_settings")
      .select("value")
      .eq("key", "submission_custom_icons")
      .maybeSingle();

    const currentMap =
      data?.value && typeof data.value === "object"
        ? (data.value as Record<string, any>)
        : {};
    currentMap[submissionId] = { iconId, color };

    await admin.from("application_settings").upsert(
      {
        key: "submission_custom_icons",
        value: currentMap,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "key" }
    );
    return true;
  } catch (err) {
    console.error("Failed to save submission custom icon:", err);
    return false;
  }
}

export const MOCK_SUBMISSIONS: WaterSubmissionWithPhotos[] = [
  {
    id: "sub-1",
    visitor_id: "v_local_resident",
    submitter_name: "Eduardo Bermas",
    name: "Sitio Tubig-Labi Spring",
    category: "Spring",
    description: "Cold natural spring overflowing beside the farm trail in Brgy. Cogon. Clean and frequently used by local farmers.",
    latitude: 12.7150,
    longitude: 124.0190,
    address: "Sitio Tubig-Labi, Brgy. Cogon",
    barangay: "Cogon",
    availability_status: "Available",
    operating_hours: "24/7",
    contact_information: null,
    status: "pending",
    reviewed_by: null,
    reviewed_at: null,
    rejection_reason: null,
    published_water_source_id: null,
    created_at: new Date(Date.now() - 3600000 * 5).toISOString(),
    updated_at: new Date(Date.now() - 3600000 * 5).toISOString(),
    photos: [],
  },
  {
    id: "sub-2",
    visitor_id: "v_visitor_99",
    submitter_name: "Angela Santos",
    name: "Barangay Zone 3 Emergency Tap",
    category: "Public Water Source",
    description: "New public faucet installation installed by barangay officials for the dry season.",
    latitude: 12.7060,
    longitude: 124.0340,
    address: "Poblacion Zone 3 Covered Court",
    barangay: "San Pedro",
    availability_status: "Available",
    operating_hours: "6:00 AM - 8:00 PM",
    contact_information: null,
    status: "pending",
    reviewed_by: null,
    reviewed_at: null,
    rejection_reason: null,
    published_water_source_id: null,
    created_at: new Date(Date.now() - 3600000 * 12).toISOString(),
    updated_at: new Date(Date.now() - 3600000 * 12).toISOString(),
    photos: [],
  },
];

export async function submitWaterSource(data: SubmissionFormData): Promise<{
  success: boolean;
  submissionId?: string;
  error?: string;
}> {
  const rateLimit = checkRateLimit(`submit:${data.visitor_id}`, 5, 300000); // 5 submissions per 5 min
  if (!rateLimit.allowed) {
    return {
      success: false,
      error: `Submission rate limit exceeded. Please wait ${rateLimit.retryAfterSeconds} seconds before submitting again.`,
    };
  }

  try {
    const admin = createAdminClient();
    let insertCategory = data.category;
    let categoryNeedsOverride = false;

    let { data: result, error } = await admin
      .from("water_submissions")
      .insert({
        visitor_id: data.visitor_id,
        submitter_name: data.submitter_name,
        name: data.name,
        category: insertCategory,
        description: data.description || null,
        latitude: data.latitude,
        longitude: data.longitude,
        address: data.address || null,
        barangay: data.barangay || null,
        availability_status: data.availability_status,
        operating_hours: data.operating_hours || null,
        contact_information: data.contact_information || null,
        status: "pending",
      })
      .select("id")
      .single();

    if (error && (error.code === "23514" || error.message?.includes("water_submissions_category_check")) && insertCategory === "Lake") {
      categoryNeedsOverride = true;
      const retry = await admin
        .from("water_submissions")
        .insert({
          visitor_id: data.visitor_id,
          submitter_name: data.submitter_name,
          name: data.name,
          category: "Other",
          description: data.description || null,
          latitude: data.latitude,
          longitude: data.longitude,
          address: data.address || null,
          barangay: data.barangay || null,
          availability_status: data.availability_status,
          operating_hours: data.operating_hours || null,
          contact_information: data.contact_information || null,
          status: "pending",
        })
        .select("id")
        .single();
      result = retry.data;
      error = retry.error;
    }

    if (error || !result) {
      console.error("Failed to insert water submission into Supabase:", error);
      // Local demo fallback
      const mockId = `sub-${Date.now()}`;
      MOCK_SUBMISSIONS.unshift({
        id: mockId,
        visitor_id: data.visitor_id,
        submitter_name: data.submitter_name,
        name: data.name,
        category: data.category,
        description: data.description || null,
        latitude: data.latitude,
        longitude: data.longitude,
        address: data.address || null,
        barangay: data.barangay || null,
        availability_status: data.availability_status,
        operating_hours: data.operating_hours || null,
        contact_information: data.contact_information || null,
        status: "pending",
        reviewed_by: null,
        reviewed_at: null,
        rejection_reason: null,
        published_water_source_id: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
      if (data.custom_icon_id) {
        await saveSubmissionCustomIcon(mockId, data.custom_icon_id, data.custom_icon_color || undefined);
      }
      return { success: true, submissionId: mockId };
    }

    if (categoryNeedsOverride || insertCategory === "Lake") {
      await saveSubmissionCategoryOverride(result.id, "Lake");
    }

    if (data.custom_icon_id) {
      await saveSubmissionCustomIcon(result.id, data.custom_icon_id, data.custom_icon_color || undefined);
    }

    return { success: true, submissionId: result.id };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to submit water source" };
  }
}

export async function getSubmissionsAdmin(): Promise<WaterSubmissionWithPhotos[]> {
  const overrides = await getSubmissionCategoryOverrides();

  if (!isSupabaseConfigured()) {
    return MOCK_SUBMISSIONS.map((s) => ({
      ...s,
      category: (overrides[s.id] || s.category) as any,
    }));
  }
  try {
    const admin = createAdminClient();
    const { data, error } = await admin
      .from("water_submissions")
      .select("*, photos:submission_photos(*)")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Failed to fetch submissions from Supabase:", error);
      return [];
    }
    const list = (data || []) as WaterSubmissionWithPhotos[];
    return list.map((s) => ({
      ...s,
      category: (overrides[s.id] || s.category) as any,
    }));
  } catch (err) {
    console.error("Failed to load submissions:", err);
    return [];
  }
}

export async function approveSubmission(
  submissionId: string,
  adminUserId?: string
): Promise<{ success: boolean; publishedSourceId?: string; error?: string }> {
  if (!isSupabaseConfigured()) {
    const mockIndex = MOCK_SUBMISSIONS.findIndex((s) => s.id === submissionId);
    if (mockIndex !== -1) {
      MOCK_SUBMISSIONS[mockIndex].status = "approved";
      return { success: true, publishedSourceId: `mock-published-${Date.now()}` };
    }
    return { success: false, error: "Submission not found" };
  }
  try {
    const admin = createAdminClient();
    const { data: sub, error: subError } = await admin
      .from("water_submissions")
      .select("*")
      .eq("id", submissionId)
      .single();

    if (subError || !sub) {
      // Find in mock
      const mockIndex = MOCK_SUBMISSIONS.findIndex((s) => s.id === submissionId);
      if (mockIndex !== -1) {
        MOCK_SUBMISSIONS[mockIndex].status = "approved";
        return { success: true, publishedSourceId: `mock-published-${Date.now()}` };
      }
      return { success: false, error: "Submission not found" };
    }

    const categoryOverrides = await getSubmissionCategoryOverrides();
    const effectiveCategory = categoryOverrides[submissionId] || sub.category;
    const slug = `${slugify(sub.name)}-${Date.now().toString().slice(-4)}`;

    // Create published water source
    let insertCategory = effectiveCategory;
    let fallbackToOther = false;

    let { data: newSource, error: createError } = await admin
      .from("water_sources")
      .insert({
        name: sub.name,
        slug,
        category: insertCategory,
        description: sub.description,
        latitude: sub.latitude,
        longitude: sub.longitude,
        address: sub.address,
        barangay: sub.barangay,
        availability_status: sub.availability_status,
        verification_status: "Verified",
        operating_hours: sub.operating_hours,
        contact_information: sub.contact_information,
        is_published: true,
      })
      .select("id")
      .single();

    if (createError && (createError.code === "23514" || createError.message?.includes("water_sources_category_check")) && insertCategory === "Lake") {
      fallbackToOther = true;
      const retry = await admin
        .from("water_sources")
        .insert({
          name: sub.name,
          slug,
          category: "Other",
          description: sub.description,
          latitude: sub.latitude,
          longitude: sub.longitude,
          address: sub.address,
          barangay: sub.barangay,
          availability_status: sub.availability_status,
          verification_status: "Verified",
          operating_hours: sub.operating_hours,
          contact_information: sub.contact_information,
          is_published: true,
        })
        .select("id")
        .single();
      newSource = retry.data;
      createError = retry.error;
    }

    if (createError || !newSource) throw createError || new Error("Failed to create water source");

    if (fallbackToOther || effectiveCategory === "Lake") {
      await saveWaterSourceCategoryOverride(newSource.id, "Lake");
    }

    // Update submission
    await admin
      .from("water_submissions")
      .update({
        status: "approved",
        reviewed_at: new Date().toISOString(),
        published_water_source_id: newSource.id,
      })
      .eq("id", submissionId);

    // Create chat room for newly published source
    await admin.from("chat_rooms").insert({
      water_source_id: newSource.id,
      is_active: true,
    });

    // Transfer citizen-suggested custom icon & color to the newly published water source
    try {
      const submissionIcons = await getSubmissionCustomIcons();
      const subIcon = submissionIcons[submissionId];
      if (subIcon) {
        await saveWaterSourceCustomIcon(newSource.id, subIcon.iconId, subIcon.color);
      }
    } catch {
      // Non-blocking fallback
    }

    // Copy photos from submission_photos to water_photos
    const { data: subPhotos } = await admin
      .from("submission_photos")
      .select("storage_path")
      .eq("submission_id", submissionId);

    if (subPhotos && subPhotos.length > 0) {
      await admin.from("water_photos").insert(
        subPhotos.map((p: any, idx: number) => ({
          water_source_id: newSource.id,
          storage_path: p.storage_path,
          is_primary: idx === 0,
        }))
      );
    }

    // Broadcast notification for newly approved submission
    const locText = sub.barangay
      ? `in ${sub.barangay.startsWith("Brgy.") ? sub.barangay : `Brgy. ${sub.barangay}`}`
      : "in Irosin";

    await admin.from("notifications").insert({
      type: "new_water_source",
      title: "New Water Source Verified",
      body: `${sub.name} ${locText} has been officially verified and added to the IroWa interactive map.`,
      water_source_id: newSource.id,
      is_read: false,
    });

    sendPushNotificationToSubscribers({
      title: "New Water Source Verified",
      body: `${sub.name} ${locText} has been added to the IroWa map.`,
      url: `/water/${newSource.id}`,
    }).catch(() => {});

    return { success: true, publishedSourceId: newSource.id };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to approve submission" };
  }
}

export async function rejectSubmission(
  submissionId: string,
  reason: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const admin = createAdminClient();
    await admin
      .from("water_submissions")
      .update({
        status: "rejected",
        rejection_reason: reason,
        reviewed_at: new Date().toISOString(),
      })
      .eq("id", submissionId);

    const mockIndex = MOCK_SUBMISSIONS.findIndex((s) => s.id === submissionId);
    if (mockIndex !== -1) {
      MOCK_SUBMISSIONS[mockIndex].status = "rejected";
      MOCK_SUBMISSIONS[mockIndex].rejection_reason = reason;
    }

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to reject submission" };
  }
}

export async function getSubmissionById(id: string): Promise<WaterSubmissionWithPhotos | null> {
  const icons = await getSubmissionCustomIcons();

  if (!isSupabaseConfigured()) {
    const found = MOCK_SUBMISSIONS.find((s) => s.id === id);
    if (!found) return null;
    return { ...found, custom_icon: icons[found.id] };
  }
  try {
    const admin = createAdminClient();
    const { data, error } = await admin
      .from("water_submissions")
      .select("*, photos:submission_photos(*)")
      .eq("id", id)
      .single();

    if (error || !data) {
      const found = MOCK_SUBMISSIONS.find((s) => s.id === id);
      if (!found) return null;
      return { ...found, custom_icon: icons[found.id] };
    }
    const sub = data as WaterSubmissionWithPhotos;
    return { ...sub, custom_icon: icons[sub.id] };
  } catch {
    const found = MOCK_SUBMISSIONS.find((s) => s.id === id);
    if (!found) return null;
    return { ...found, custom_icon: icons[found.id] };
  }
}
