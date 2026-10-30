// src/types/admin.ts
import { Database } from "./database.types";

export type AdminProfileRow = Database["public"]["Tables"]["admin_profiles"]["Row"];
export type AuditLogRow = Database["public"]["Tables"]["audit_logs"]["Row"];

export interface AdminDashboardMetrics {
  totalWaterSources: number;
  availableCount: number;
  limitedCount: number;
  unavailableCount: number;
  pendingSubmissionsCount: number;
  pendingReportsCount: number;
  totalChatMessages: number;
  totalSubmissionsCount?: number;
  totalReportsCount?: number;
  activeVisitorsCount?: number;
  recentActivity: Array<{
    id: string;
    title: string;
    type: string;
    timestamp: string;
    badge?: string;
  }>;
  categoryBreakdown: Record<string, number>;
}
