// src/actions/report-actions.ts
"use server";

import { reportSchema } from "@/lib/validations/report-schema";
import { 
  submitWaterReport, 
  resolveReport, 
  getReportsAdmin, 
  getReportById 
} from "@/lib/services/report-service";
import { logAdminAction } from "@/lib/services/audit-service";
import { revalidatePath } from "next/cache";

export async function getAllReportsAction() {
  return await getReportsAdmin();
}

export async function getReportByIdAction(id: string) {
  return await getReportById(id);
}

export async function submitReportAction(formData: any) {
  const validated = reportSchema.safeParse(formData);
  if (!validated.success) {
    return { error: (validated.error as any).issues?.[0]?.message || "Validation failed" };
  }

  return await submitWaterReport(validated.data);
}

export async function updateReportStatusAction(
  reportId: string,
  status: "resolved" | "dismissed" | "investigating",
  adminNotes?: string
) {
  const result = await resolveReport(reportId, status, adminNotes);
  if (result.success) {
    await logAdminAction("RESOLVE_REPORT", "water_report", reportId, { status, adminNotes });
    revalidatePath("/admin/reports");
  }
  return result;
}
