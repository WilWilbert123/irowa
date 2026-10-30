// src/lib/services/analytics-service.ts
import { createAdminClient } from "../supabase/admin";
import { isSupabaseConfigured } from "../supabase/client";
import { AdminDashboardMetrics } from "@/types/admin";
import { MOCK_IROSIN_WATER_SOURCES } from "./water-service";
import { MOCK_REPORTS } from "./report-service";
import { MOCK_SUBMISSIONS } from "./submission-service";

export async function getAdminDashboardMetrics(): Promise<AdminDashboardMetrics> {
  try {
    if (!isSupabaseConfigured()) {
      return getFallbackMetrics();
    }

    const admin = createAdminClient();

    // 1. Water Sources
    const { data: sources, error: sourcesErr } = await admin
      .from("water_sources")
      .select("id, name, category, barangay, availability_status, is_published, created_at, updated_at")
      .is("archived_at", null);

    const sourceList = sourcesErr || !sources ? MOCK_IROSIN_WATER_SOURCES : sources;

    const categoryBreakdown: Record<string, number> = {
      "River": 0,
      "Waterfall": 0,
      "Spring": 0,
      "Resort": 0,
      "Water Refilling Station": 0,
      "Public Water Source": 0,
      "Deep Well": 0,
      "Community Water Point": 0,
      "Other": 0,
    };

    let availableCount = 0;
    let limitedCount = 0;
    let unavailableCount = 0;

    sourceList.forEach((s: any) => {
      if (categoryBreakdown[s.category] !== undefined) {
        categoryBreakdown[s.category]++;
      } else {
        categoryBreakdown["Other"]++;
      }

      if (s.availability_status === "Available") availableCount++;
      else if (s.availability_status === "Limited Supply") limitedCount++;
      else unavailableCount++;
    });

    // 2. Submissions
    const { data: subs, count: totalSubsCount } = await admin
      .from("water_submissions")
      .select("id, name, barangay, status, created_at", { count: "exact" });

    const pendingSubmissionsCount = (subs || []).filter((s: any) => s.status === "pending").length;

    // 3. Reports
    const { data: reps, count: totalRepsCount } = await admin
      .from("water_reports")
      .select("id, report_type, status, created_at, water_source:water_sources(name)", { count: "exact" });

    const pendingReportsCount = (reps || []).filter((r: any) => r.status === "pending").length;

    // 4. Chat Messages
    const { count: totalChatCount } = await admin
      .from("chat_messages")
      .select("*", { count: "exact", head: true });

    // 5. Visitor Sessions
    const { count: totalVisitorsCount } = await admin
      .from("visitor_sessions")
      .select("*", { count: "exact", head: true });

    // 6. Recent dynamic activity feed from real tables
    const recentActivity: Array<{
      id: string;
      title: string;
      type: string;
      timestamp: string;
      badge?: string;
      rawDate: number;
    }> = [];

    // Add recent reports
    (reps || []).slice(0, 5).forEach((r: any) => {
      const sourceName = r.water_source?.name || "Water Point";
      recentActivity.push({
        id: `rep-${r.id}`,
        title: `${r.report_type} reported at ${sourceName}`,
        type: "Community Report",
        timestamp: formatRelativeTime(r.created_at),
        badge: r.status === "pending" ? "Pending" : "Reviewed",
        rawDate: new Date(r.created_at).getTime(),
      });
    });

    // Add recent submissions
    (subs || []).slice(0, 5).forEach((s: any) => {
      recentActivity.push({
        id: `sub-${s.id}`,
        title: `Proposed water source: ${s.name} (${s.barangay ? `Brgy. ${s.barangay}` : "Irosin"})`,
        type: "Submission",
        timestamp: formatRelativeTime(s.created_at),
        badge: s.status === "pending" ? "Pending" : s.status,
        rawDate: new Date(s.created_at).getTime(),
      });
    });

    // Add recent water sources
    sourceList.slice(0, 3).forEach((ws: any) => {
      recentActivity.push({
        id: `ws-${ws.id}`,
        title: `${ws.name} verified & active on map`,
        type: "Water Point",
        timestamp: formatRelativeTime(ws.updated_at || ws.created_at),
        badge: ws.availability_status,
        rawDate: new Date(ws.updated_at || ws.created_at || Date.now()).getTime(),
      });
    });

    // Sort by newest first
    recentActivity.sort((a, b) => b.rawDate - a.rawDate);

    return {
      totalWaterSources: sourceList.length,
      availableCount,
      limitedCount,
      unavailableCount,
      pendingSubmissionsCount,
      pendingReportsCount,
      totalChatMessages: totalChatCount ?? (subs ? 0 : 142),
      totalSubmissionsCount: totalSubsCount ?? subs?.length ?? 0,
      totalReportsCount: totalRepsCount ?? reps?.length ?? 0,
      activeVisitorsCount: totalVisitorsCount ?? 0,
      recentActivity: recentActivity.slice(0, 6).map(({ rawDate, ...rest }) => rest),
      categoryBreakdown,
    };
  } catch (err) {
    console.error("Error computing admin dashboard metrics:", err);
    return getFallbackMetrics();
  }
}

function formatRelativeTime(dateStr?: string | null): string {
  if (!dateStr) return "Just now";
  const diffMs = Date.now() - new Date(dateStr).getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return "Just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d ago`;
}

function getFallbackMetrics(): AdminDashboardMetrics {
  return {
    totalWaterSources: MOCK_IROSIN_WATER_SOURCES.length,
    availableCount: MOCK_IROSIN_WATER_SOURCES.filter((s) => s.availability_status === "Available").length,
    limitedCount: MOCK_IROSIN_WATER_SOURCES.filter((s) => s.availability_status === "Limited Supply").length,
    unavailableCount: MOCK_IROSIN_WATER_SOURCES.filter((s) => s.availability_status === "Temporarily Unavailable").length,
    pendingSubmissionsCount: MOCK_SUBMISSIONS.filter((s) => s.status === "pending").length,
    pendingReportsCount: MOCK_REPORTS.filter((r) => r.status === "pending").length,
    totalChatMessages: 4,
    totalSubmissionsCount: MOCK_SUBMISSIONS.length,
    totalReportsCount: MOCK_REPORTS.length,
    activeVisitorsCount: 1,
    recentActivity: [
      {
        id: "act-1",
        title: "Bitang Waterfall marked Available",
        type: "Status Update",
        timestamp: "10m ago",
        badge: "Verified",
      },
      {
        id: "act-2",
        title: "San Mateo Cold Springs routine check",
        type: "Field Inspection",
        timestamp: "1h ago",
        badge: "Verified",
      },
    ],
    categoryBreakdown: {
      "River": 2,
      "Waterfall": 1,
      "Spring": 2,
      "Resort": 1,
      "Water Refilling Station": 1,
      "Public Water Source": 1,
      "Deep Well": 0,
      "Community Water Point": 0,
      "Other": 0,
    },
  };
}
