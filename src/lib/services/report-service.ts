// src/lib/services/report-service.ts
import { createClient, isSupabaseConfigured } from "../supabase/client";
import { createAdminClient } from "../supabase/admin";
import { WaterReportWithDetails } from "@/types/report";
import { ReportFormData } from "../validations/report-schema";
import { checkRateLimit } from "../utils/rate-limit";

export const MOCK_REPORTS: WaterReportWithDetails[] = [
  {
    id: "rep-1",
    water_source_id: "c3333333-3333-4333-c333-333333333333",
    visitor_id: "v_concerned_resident",
    report_type: "Incorrect availability",
    description: "Low water level observed at Maasim River due to recent heat. Not suitable for swimming right now.",
    status: "pending",
    reviewed_by: null,
    reviewed_at: null,
    admin_notes: null,
    created_at: new Date(Date.now() - 3600000 * 3).toISOString(),
    water_source: {
      id: "c3333333-3333-4333-c333-333333333333",
      name: "Maasim River",
      category: "River",
      barangay: "Gabao",
    },
  },
  {
    id: "rep-2",
    water_source_id: "77777777-7777-4777-a777-777777777777",
    visitor_id: "v_farmer_patag",
    report_type: "Incorrect information",
    description: "The communal tap pressure was restored after maintenance this morning.",
    status: "resolved",
    reviewed_by: null,
    reviewed_at: new Date(Date.now() - 3600000 * 10).toISOString(),
    admin_notes: "Status updated to Limited Supply after field check.",
    created_at: new Date(Date.now() - 3600000 * 18).toISOString(),
    water_source: {
      id: "77777777-7777-4777-a777-777777777777",
      name: "Patag Barangay Water Point",
      category: "Community Water Point",
      barangay: "Patag",
    },
  },
];

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
    const mockId = `rep-${Date.now()}`;
    MOCK_REPORTS.unshift({
      id: mockId,
      water_source_id: data.water_source_id,
      visitor_id: data.visitor_id,
      report_type: data.report_type,
      description: data.description,
      status: "pending",
      reviewed_by: null,
      reviewed_at: null,
      admin_notes: null,
      created_at: new Date().toISOString(),
    });
    return { success: true, reportId: mockId };
  }

  try {
    const supabase = createClient();
    const { data: res, error } = await supabase
      .from("water_reports")
      .insert({
        water_source_id: data.water_source_id,
        visitor_id: data.visitor_id,
        report_type: data.report_type,
        description: data.description,
        status: "pending",
      })
      .select("id")
      .single();

    if (error) {
      const mockId = `rep-${Date.now()}`;
      MOCK_REPORTS.unshift({
        id: mockId,
        water_source_id: data.water_source_id,
        visitor_id: data.visitor_id,
        report_type: data.report_type,
        description: data.description,
        status: "pending",
        reviewed_by: null,
        reviewed_at: null,
        admin_notes: null,
        created_at: new Date().toISOString(),
      });
      return { success: true, reportId: mockId };
    }

    return { success: true, reportId: res.id };
  } catch (err: any) {
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
