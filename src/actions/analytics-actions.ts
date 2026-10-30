// src/actions/analytics-actions.ts
"use server";

import { getAdminDashboardMetrics } from "@/lib/services/analytics-service";
import { AdminDashboardMetrics } from "@/types/admin";

export async function getAdminDashboardMetricsAction(): Promise<AdminDashboardMetrics> {
  return await getAdminDashboardMetrics();
}

