// src/actions/submission-actions.ts
"use server";

import { submissionSchema } from "@/lib/validations/submission-schema";
import { 
  submitWaterSource, 
  approveSubmission, 
  rejectSubmission, 
  getSubmissionsAdmin, 
  getSubmissionById,
  MOCK_SUBMISSIONS
} from "@/lib/services/submission-service";
import { logAdminAction } from "@/lib/services/audit-service";
import { createAdminClient } from "@/lib/supabase/admin";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import { revalidatePath } from "next/cache";

export async function getAllSubmissionsAction() {
  return await getSubmissionsAdmin();
}

export async function getSubmissionByIdAction(id: string) {
  return await getSubmissionById(id);
}

export async function submitWaterSourceAction(formData: any) {
  const validated = submissionSchema.safeParse(formData);
  if (!validated.success) {
    return { error: (validated.error as any).issues?.[0]?.message || "Validation failed" };
  }

  const result = await submitWaterSource(validated.data);
  if (result.success) {
    revalidatePath("/admin/submissions");
    revalidatePath("/admin");
  }
  return result;
}

export async function approveSubmissionAction(submissionId: string) {
  const result = await approveSubmission(submissionId);
  if (result.success) {
    await logAdminAction("APPROVE_SUBMISSION", "water_submission", submissionId);
    revalidatePath("/admin/submissions");
    revalidatePath("/admin/water-sources");
    revalidatePath("/notifications");
    revalidatePath("/home");
  }
  return result;
}

export async function rejectSubmissionAction(
  submissionId: string,
  reason: string
): Promise<{ success: boolean; error?: string }> {
  if (!reason || reason.trim().length < 3) {
    return { success: false, error: "Please provide a valid rejection reason (at least 3 characters)." };
  }
  const result = await rejectSubmission(submissionId, reason);
  if (result.success) {
    await logAdminAction("REJECT_SUBMISSION", "water_submission", submissionId, { reason });
    revalidatePath("/admin/submissions");
  }
  return result;
}

export async function attachSubmissionPhotosAction(
  submissionId: string,
  photos: Array<{ storage_path: string }>
) {
  if (!photos || photos.length === 0) return { success: true };

  if (!isSupabaseConfigured()) {
    const mock = MOCK_SUBMISSIONS.find((s) => s.id === submissionId);
    if (mock) {
      mock.photos = photos.map((p, i) => ({
        id: `sp_${Date.now()}_${i}`,
        submission_id: submissionId,
        storage_path: p.storage_path,
        created_at: new Date().toISOString(),
      }));
    }
    return { success: true };
  }

  try {
    const admin = createAdminClient();
    const { error } = await admin.from("submission_photos").insert(
      photos.map((p) => ({
        submission_id: submissionId,
        storage_path: p.storage_path,
      }))
    );

    if (error) {
      console.error("Failed to insert submission photos:", error);
      return { error: error.message };
    }

    revalidatePath("/admin/submissions");
    revalidatePath(`/admin/submissions/${submissionId}`);
    return { success: true };
  } catch (err: any) {
    return { error: err.message || "Failed to attach photos" };
  }
}
