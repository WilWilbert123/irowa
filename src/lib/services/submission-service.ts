// src/lib/services/submission-service.ts
import { createClient, isSupabaseConfigured } from "../supabase/client";
import { createAdminClient } from "../supabase/admin";
import { WaterSubmissionWithPhotos } from "@/types/submission";
import { SubmissionFormData } from "../validations/submission-schema";
import { checkRateLimit } from "../utils/rate-limit";
import { slugify } from "../utils/formatters";

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
    const supabase = createClient();
    const { data: result, error } = await supabase
      .from("water_submissions")
      .insert({
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
      })
      .select("id")
      .single();

    if (error) {
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
      return { success: true, submissionId: mockId };
    }

    return { success: true, submissionId: result.id };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to submit water source" };
  }
}

export async function getSubmissionsAdmin(): Promise<WaterSubmissionWithPhotos[]> {
  if (!isSupabaseConfigured()) {
    return MOCK_SUBMISSIONS;
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
    return (data || []) as WaterSubmissionWithPhotos[];
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

    const slug = `${slugify(sub.name)}-${Date.now().toString().slice(-4)}`;

    // Create published water source
    const { data: newSource, error: createError } = await admin
      .from("water_sources")
      .insert({
        name: sub.name,
        slug,
        category: sub.category,
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

    if (createError) throw createError;

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
  if (!isSupabaseConfigured()) {
    return MOCK_SUBMISSIONS.find((s) => s.id === id) || null;
  }
  try {
    const admin = createAdminClient();
    const { data, error } = await admin
      .from("water_submissions")
      .select("*, photos:submission_photos(*)")
      .eq("id", id)
      .single();

    if (error || !data) {
      return MOCK_SUBMISSIONS.find((s) => s.id === id) || null;
    }
    return data as WaterSubmissionWithPhotos;
  } catch {
    return MOCK_SUBMISSIONS.find((s) => s.id === id) || null;
  }
}
