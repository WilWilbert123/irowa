// src/lib/services/report-service.ts
import { createClient, isSupabaseConfigured } from "../supabase/client";
import { createAdminClient } from "../supabase/admin";
import { WaterReportWithDetails } from "@/types/report";
import { ReportFormData } from "../validations/report-schema";
import { checkRateLimit } from "../utils/rate-limit";

export const MOCK_REPORTS: WaterReportWithDetails[] = [];

export async function submitWaterReport(data: ReportFormData): Promise<{
  success: boolean;
  reportId?: string;
  error?: string;
}> {
  const rateLimit = checkRateLimit(`report:${data.visitor_id}`, 5, 300000);
  if (!rateLimit.allowed) {
    return {
      success: false,
      error: `Report limit reached. Please wait ${rateLimit.retryAfterSeconds} seconds.`,
    };
  }

  if (!isSupabaseConfigured()) {
    return {
      success: false,
      error: "Supabase database is not configured.",
    };
  }

  try {
    const admin = createAdminClient();

    // Resolve water source ID if a slug was passed instead of a UUID
    let targetSourceId = data.water_source_id;
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(targetSourceId);
    if (!isUuid) {
      const { data: sourceData } = await admin
        .from("water_sources")
        .select("id")
        .eq("slug", targetSourceId)
        .maybeSingle();

      if (sourceData?.id) {
        targetSourceId = sourceData.id;
      } else {
        return {
          success: false,
          error: "Referenced water resource could not be found.",
        };
      }
    }

    const { data: res, error } = await admin
      .from("water_reports")
      .insert({
        water_source_id: targetSourceId,
        visitor_id: data.visitor_id,
        report_type: data.report_type,
        description: data.description,
        status: "pending",
      })
      .select("id")
      .single();

    if (error || !res) {
      console.error("Failed to insert water report into Supabase:", error);
      return {
        success: false,
        error: error?.message || "Failed to submit report to database.",
      };
    }

    return { success: true, reportId: res.id };
  } catch (err: any) {
    console.error("Error submitting water report:", err);
    return { success: false, error: err.message || "Failed to submit report" };
  }
}

export async function getReportsAdmin(): Promise<WaterReportWithDetails[]> {
  if (!isSupabaseConfigured()) {
    return MOCK_REPORTS;
  }
  try {
    const admin = createAdminClient();
    const { data, error } = await admin
      .from("water_reports")
      .select("*, water_source:water_sources(id, name, category, barangay)")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Failed to fetch reports from Supabase:", error);
      return [];
    }
    return (data || []) as WaterReportWithDetails[];
  } catch (err) {
    console.error("Failed to load reports:", err);
    return [];
  }
}

export async function getReportById(reportId: string): Promise<WaterReportWithDetails | null> {
  if (!isSupabaseConfigured()) {
    return MOCK_REPORTS.find((r) => r.id === reportId) || null;
  }
  try {
    const admin = createAdminClient();
    const { data, error } = await admin
      .from("water_reports")
      .select("*, water_source:water_sources(id, name, category, barangay, latitude, longitude)")
      .eq("id", reportId)
      .single();

    if (error || !data) {
      return MOCK_REPORTS.find((r) => r.id === reportId) || null;
    }
    return data as WaterReportWithDetails;
  } catch {
    return MOCK_REPORTS.find((r) => r.id === reportId) || null;
  }
}

export async function resolveReport(
  reportId: string,
  status: "resolved" | "dismissed" | "investigating",
  adminNotes?: string
): Promise<{ success: boolean; error?: string }> {
  if (!isSupabaseConfigured()) {
    const match = MOCK_REPORTS.find((r) => r.id === reportId);
    if (match) {
      match.status = status;
      match.admin_notes = adminNotes || null;
      match.reviewed_at = new Date().toISOString();
    }
    return { success: true };
  }
  try {
    const admin = createAdminClient();
    await admin
      .from("water_reports")
      .update({
        status,
        admin_notes: adminNotes || null,
        reviewed_at: new Date().toISOString(),
      })
      .eq("id", reportId);

    const match = MOCK_REPORTS.find((r) => r.id === reportId);
    if (match) {
      match.status = status;
      match.admin_notes = adminNotes || null;
      match.reviewed_at = new Date().toISOString();
    }

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to update report" };
  }
}
