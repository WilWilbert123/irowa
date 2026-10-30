// src/actions/submission-actions.ts
"use server";

import { submissionSchema } from "@/lib/validations/submission-schema";
import { 
  submitWaterSource, 
  approveSubmission, 
  rejectSubmission, 
  getSubmissionsAdmin, 
  getSubmissionById 
} from "@/lib/services/submission-service";
import { logAdminAction } from "@/lib/services/audit-service";
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
  return result;
}

export async function approveSubmissionAction(submissionId: string) {
  const result = await approveSubmission(submissionId);
  if (result.success) {
    await logAdminAction("APPROVE_SUBMISSION", "water_submission", submissionId);
    revalidatePath("/admin/submissions");
    revalidatePath("/admin/water-sources");
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
