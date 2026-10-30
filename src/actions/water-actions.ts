// src/actions/water-actions.ts
"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { waterSourceSchema } from "@/lib/validations/water-schema";
import { slugify } from "@/lib/utils/formatters";
import { logAdminAction } from "@/lib/services/audit-service";
import { getWaterSourceById, getPublishedWaterSources, getAllWaterSourcesAdmin } from "@/lib/services/water-service";
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

export async function createWaterSourceAction(formData: any) {
  const validated = waterSourceSchema.safeParse(formData);
  if (!validated.success) {
    return { error: (validated.error as any).issues?.[0]?.message || "Validation failed" };
  }

  const data = validated.data;
  const slug = `${slugify(data.name)}-${Date.now().toString().slice(-4)}`;

  try {
    const admin = createAdminClient();
    const { data: newSource, error } = await admin
      .from("water_sources")
      .insert({
        name: data.name,
        slug,
        category: data.category,
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

    if (error) {
      return { error: error.message };
    }

    // Auto-create chat room for this water source
    await admin.from("chat_rooms").insert({
      water_source_id: newSource.id,
      is_active: true,
    });

    await logAdminAction("CREATE_WATER_SOURCE", "water_source", newSource.id, { name: data.name });

    revalidatePath("/admin/water-sources");
    revalidatePath("/home");
    revalidatePath("/map");
    return { success: true, id: newSource.id };
  } catch (err: any) {
    return { error: err.message || "Failed to create water source" };
  }
}

export async function updateWaterSourceAction(id: string, formData: any) {
  const validated = waterSourceSchema.partial().safeParse(formData);
  if (!validated.success) {
    return { error: (validated.error as any).issues?.[0]?.message || "Validation failed" };
  }

  try {
    const admin = createAdminClient();
    const { error } = await admin
      .from("water_sources")
      .update({
        ...validated.data,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (error) return { error: error.message };

    await logAdminAction("UPDATE_WATER_SOURCE", "water_source", id, validated.data);

    revalidatePath("/admin/water-sources");
    revalidatePath(`/admin/water-sources/${id}`);
    revalidatePath("/home");
    revalidatePath("/map");
    return { success: true };
  } catch (err: any) {
    return { error: err.message || "Failed to update water source" };
  }
}

export async function archiveWaterSourceAction(id: string) {
  try {
    const admin = createAdminClient();
    const { error } = await admin
      .from("water_sources")
      .update({
        archived_at: new Date().toISOString(),
        is_published: false,
      })
      .eq("id", id);

    if (error) return { error: error.message };

    await logAdminAction("ARCHIVE_WATER_SOURCE", "water_source", id);

    revalidatePath("/admin/water-sources");
    revalidatePath("/home");
    return { success: true };
  } catch (err: any) {
    return { error: err.message || "Failed to archive water source" };
  }
}
