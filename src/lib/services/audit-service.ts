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
    return [
      {
        id: "log-1",
        admin_user_id: null,
        action: "UPDATE_STATUS",
        entity_type: "water_source",
        entity_id: "a1111111-1111-4111-a111-111111111111",
        details: { name: "Bitang Waterfall", status: "Available" },
        created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
      },
      {
        id: "log-2",
        admin_user_id: null,
        action: "PUBLISH_ANNOUNCEMENT",
        entity_type: "announcement",
        entity_id: "bbbbbbbb-1111-4bbb-bbbb-111111111111",
        details: { title: "El Niño Preparedness Advisory" },
        created_at: new Date(Date.now() - 3600000 * 24).toISOString(),
      },
    ];
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
