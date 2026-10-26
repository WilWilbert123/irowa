// src/lib/services/analytics-service.ts
import { createAdminClient } from "../supabase/admin";
import { isSupabaseConfigured } from "../supabase/client";
import { AdminDashboardMetrics } from "@/types/admin";
import { MOCK_IROSIN_WATER_SOURCES } from "./water-service";
import { MOCK_REPORTS } from "./report-service";
import { MOCK_SUBMISSIONS } from "./submission-service";

export async function getAdminDashboardMetrics(): Promise<AdminDashboardMetrics> {
  try {
    let sourceList: any[] = MOCK_IROSIN_WATER_SOURCES;

    if (isSupabaseConfigured()) {
      const admin = createAdminClient();
      const { data: sources } = await admin
        .from("water_sources")
        .select("category, availability_status");
      if (sources && sources.length > 0) {
        sourceList = sources;
      }
    }

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

    const recentActivity = [
      {
        id: "act-1",
        title: "Bitang Waterfall marked Available",
        type: "Status Update",
        timestamp: "10m ago",
        badge: "Verified",
      },
      {
        id: "act-2",
        title: "New report on Maasim River water level",
        type: "Community Report",
        timestamp: "35m ago",
        badge: "Urgent",
      },
      {
        id: "act-3",
        title: "Submission for Sitio Tubig-Labi Spring",
        type: "New Submission",
        timestamp: "2h ago",
        badge: "Pending",
      },
      {
        id: "act-4",
        title: "Clean-up drive at San Mateo Cold Springs",
        type: "Notice",
        timestamp: "5h ago",
        badge: "Verified",
      },
    ];

    return {
      totalWaterSources: sourceList.length,
      availableCount,
      limitedCount,
      unavailableCount,
      pendingSubmissionsCount: MOCK_SUBMISSIONS.filter((s) => s.status === "pending").length,
      pendingReportsCount: MOCK_REPORTS.filter((r) => r.status === "pending").length,
      totalChatMessages: 142,
      recentActivity,
      categoryBreakdown,
    };
  } catch {
    return {
      totalWaterSources: MOCK_IROSIN_WATER_SOURCES.length,
      availableCount: 7,
      limitedCount: 1,
      unavailableCount: 0,
      pendingSubmissionsCount: 2,
      pendingReportsCount: 1,
      totalChatMessages: 128,
      recentActivity: [
        {
          id: "act-1",
          title: "Low water level reported at Irosin River",
          type: "Report",
          timestamp: "15m ago",
          badge: "Urgent",
        },
        {
          id: "act-2",
          title: "New water refilling station verified",
          type: "Source Added",
          timestamp: "1h ago",
          badge: "Verified",
        },
      ],
      categoryBreakdown: {
        "River": 2,
        "Waterfall": 1,
        "Spring": 1,
        "Resort": 1,
        "Water Refilling Station": 1,
        "Deep Well": 1,
        "Community Water Point": 1,
        "Other": 0,
      },
    };
  }
}
