// src/actions/audit-actions.ts
"use server";

import { getAuditLogs } from "@/lib/services/audit-service";
import { AuditLogRow } from "@/types/admin";

export async function getAuditLogsAction(): Promise<AuditLogRow[]> {
  try {
    return await getAuditLogs();
  } catch (err) {
    console.error("Error in getAuditLogsAction:", err);
    return [];
  }
}

