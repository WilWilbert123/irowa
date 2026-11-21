// src/lib/services/audit-service.ts
import { createAdminClient } from "../supabase/admin";
import { isSupabaseConfigured } from "../supabase/client";
import { AuditLogRow } from "@/types/admin";

export async function logAdminAction(
  action: string,
  entityType: string,
  entityId?: string,
  details?: Record<string, any>,
  adminUserId?: string
): Promise<void> {
  if (!isSupabaseConfigured()) return;
  try {
    const admin = createAdminClient();
    await admin.from("audit_logs").insert({
      admin_user_id: adminUserId || null,
      action,
      entity_type: entityType,
      entity_id: entityId || null,
      details: details || null,
    });
  } catch {
    // Fail silently in development/mock environments to preserve user action flow
  }
}

export async function getAuditLogs(): Promise<AuditLogRow[]> {
  if (!isSupabaseConfigured()) {
    return [];
  }

  try {
    const admin = createAdminClient();
    const { data, error } = await admin
      .from("audit_logs")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(100);

    if (error || !data || data.length === 0) {
      return [];
    }
    return data as AuditLogRow[];
  } catch {
    return [];
  }
}
