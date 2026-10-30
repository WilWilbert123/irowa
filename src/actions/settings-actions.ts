// src/actions/settings-actions.ts
"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import { logAdminAction } from "@/lib/services/audit-service";
import { revalidatePath } from "next/cache";

export interface SystemSettingsData {
  appName: string;
  tagline: string;
  emergencyHotline: string;
  alertBannerEnabled: boolean;
  alertBannerText: string;
  mapCenterLat: number;
  mapCenterLng: number;
  defaultZoom: number;
}

export async function getSystemSettingsAction(): Promise<SystemSettingsData> {
  const defaults: SystemSettingsData = {
    appName: "IroWa",
    tagline: "Irosin Water Resources Map",
    emergencyHotline: "0917-123-4567",
    alertBannerEnabled: true,
    alertBannerText: "Water Advisory: Regular conservation guidelines in effect for low-elevation barangays.",
    mapCenterLat: 12.7042,
    mapCenterLng: 124.0326,
    defaultZoom: 13,
  };

  if (!isSupabaseConfigured()) {
    return defaults;
  }

  try {
    const admin = createAdminClient();
    const { data, error } = await admin.from("application_settings").select("key, value");

    if (error || !data) {
      return defaults;
    }

    const settingsMap: Record<string, any> = {};
    data.forEach((row: any) => {
      settingsMap[row.key] = row.value;
    });

    const general = settingsMap["general"] || {};
    const map = settingsMap["map"] || {};

    return {
      appName: general.app_name || defaults.appName,
      tagline: general.tagline || defaults.tagline,
      emergencyHotline: general.emergency_hotline || defaults.emergencyHotline,
      alertBannerEnabled: general.alert_banner_enabled ?? defaults.alertBannerEnabled,
      alertBannerText: general.alert_banner_text || defaults.alertBannerText,
      mapCenterLat: map.default_center?.[0] ?? defaults.mapCenterLat,
      mapCenterLng: map.default_center?.[1] ?? defaults.mapCenterLng,
      defaultZoom: map.default_zoom ?? defaults.defaultZoom,
    };
  } catch {
    return defaults;
  }
}

export async function updateSystemSettingsAction(
  updates: Partial<SystemSettingsData>
): Promise<{ success: boolean; error?: string }> {
  if (!isSupabaseConfigured()) {
    return { success: true };
  }

  try {
    const admin = createAdminClient();

    // 1. Update general settings if present
    if (
      updates.appName !== undefined ||
      updates.tagline !== undefined ||
      updates.emergencyHotline !== undefined ||
      updates.alertBannerEnabled !== undefined ||
      updates.alertBannerText !== undefined
    ) {
      const { data: curr } = await admin
        .from("application_settings")
        .select("value")
        .eq("key", "general")
        .single();

      const existingVal = (curr?.value as any) || {};
      const nextVal = {
        ...existingVal,
        ...(updates.appName !== undefined ? { app_name: updates.appName } : {}),
        ...(updates.tagline !== undefined ? { tagline: updates.tagline } : {}),
        ...(updates.emergencyHotline !== undefined ? { emergency_hotline: updates.emergencyHotline } : {}),
        ...(updates.alertBannerEnabled !== undefined ? { alert_banner_enabled: updates.alertBannerEnabled } : {}),
        ...(updates.alertBannerText !== undefined ? { alert_banner_text: updates.alertBannerText } : {}),
      };

      await admin.from("application_settings").upsert(
        {
          key: "general",
          value: nextVal,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "key" }
      );
    }

    // 2. Update map settings if present
    if (
      updates.mapCenterLat !== undefined ||
      updates.mapCenterLng !== undefined ||
      updates.defaultZoom !== undefined
    ) {
      const { data: currMap } = await admin
        .from("application_settings")
        .select("value")
        .eq("key", "map")
        .single();

      const existingMapVal = (currMap?.value as any) || {};
      const nextMapVal = {
        ...existingMapVal,
        default_center: [
          updates.mapCenterLat ?? existingMapVal.default_center?.[0] ?? 12.7042,
          updates.mapCenterLng ?? existingMapVal.default_center?.[1] ?? 124.0326,
        ],
        default_zoom: updates.defaultZoom ?? existingMapVal.default_zoom ?? 13,
      };

      await admin.from("application_settings").upsert(
        {
          key: "map",
          value: nextMapVal,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "key" }
      );
    }

    await logAdminAction("UPDATE_APPLICATION_SETTINGS", "application_settings", "settings", updates);
    revalidatePath("/admin/settings");
    revalidatePath("/home");

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to update settings" };
  }
}

export interface DatabaseTableInfo {
  name: string;
  displayName: string;
  rowCount: number;
  isClearable: boolean;
  category: "transient" | "core";
  description: string;
  safetyReason: string;
}

const MONITORED_TABLES: Array<{
  name: string;
  displayName: string;
  isClearable: boolean;
  category: "transient" | "core";
  description: string;
  safetyReason: string;
}> = [
  {
    name: "audit_logs",
    displayName: "Audit Logs",
    isClearable: true,
    category: "transient",
    description: "Historical record of administrative and moderation actions.",
    safetyReason: "Safe to purge periodically to free up database storage.",
  },
  {
    name: "chat_messages",
    displayName: "Chat Messages",
    isClearable: true,
    category: "transient",
    description: "Citizen public chat messages across all water resource rooms.",
    safetyReason: "Safe to clear when resetting community discussion channels.",
  },
  {
    name: "visitor_sessions",
    displayName: "Visitor Sessions",
    isClearable: true,
    category: "transient",
    description: "Anonymous device identifiers and rate-limiting moderation records.",
    safetyReason: "Safe to clear. Active users will automatically re-register on next visit.",
  },
  {
    name: "notifications",
    displayName: "Notifications",
    isClearable: true,
    category: "transient",
    description: "Citizen in-app notification inbox history and delivery logs.",
    safetyReason: "Safe to purge old delivered announcements and alerts.",
  },
  {
    name: "push_subscriptions",
    displayName: "Push Subscriptions",
    isClearable: true,
    category: "transient",
    description: "Browser web push notification tokens and endpoints.",
    safetyReason: "Safe to purge stale device tokens. Browsers will re-subscribe.",
  },
  {
    name: "water_sources",
    displayName: "Water Sources Catalogue",
    isClearable: false,
    category: "core",
    description: "Official municipal inventory of approved water resources in Irosin.",
    safetyReason: "PROTECTED: Deleting would remove public map points.",
  },
  {
    name: "admin_profiles",
    displayName: "Admin Profiles",
    isClearable: false,
    category: "core",
    description: "Staff administrative accounts, permissions, and role assignments.",
    safetyReason: "PROTECTED: Deleting would lock administrators out.",
  },
  {
    name: "application_settings",
    displayName: "Application Settings",
    isClearable: false,
    category: "core",
    description: "Global system configuration, map focus, and emergency banner text.",
    safetyReason: "PROTECTED: Holds active application configuration parameters.",
  },
  {
    name: "water_submissions",
    displayName: "Citizen Submissions",
    isClearable: false,
    category: "core",
    description: "Proposed water sources submitted by citizens awaiting verification.",
    safetyReason: "PROTECTED: Contains unreviewed citizen proposals and GPS coordinates.",
  },
  {
    name: "water_reports",
    displayName: "Community Reports",
    isClearable: false,
    category: "core",
    description: "Hazard flags, low pressure, and dried-up defect incident reports.",
    safetyReason: "PROTECTED: Contains open civic defect and safety investigations.",
  },
  {
    name: "chat_rooms",
    displayName: "Discussion Channels",
    isClearable: false,
    category: "core",
    description: "Channel bindings tied to official water points.",
    safetyReason: "PROTECTED: Tied by foreign key to water resources.",
  },
  {
    name: "announcements",
    displayName: "Municipal Advisories",
    isClearable: false,
    category: "core",
    description: "Official broadcast bulletins and drought warnings.",
    safetyReason: "PROTECTED: Active public alerts broadcast to citizens.",
  },
];

export async function getDatabaseTablesAction(): Promise<DatabaseTableInfo[]> {
  if (!isSupabaseConfigured()) {
    return MONITORED_TABLES.map((t) => ({ ...t, rowCount: 0 }));
  }

  try {
    const admin = createAdminClient();
    const results = await Promise.all(
      MONITORED_TABLES.map(async (table) => {
        try {
          const { count, error } = await admin
            .from(table.name as any)
            .select("*", { count: "exact", head: true });
          return {
            ...table,
            rowCount: error ? 0 : count || 0,
          };
        } catch {
          return {
            ...table,
            rowCount: 0,
          };
        }
      })
    );
    return results;
  } catch (err) {
    console.error("Failed to fetch database table info:", err);
    return MONITORED_TABLES.map((t) => ({ ...t, rowCount: 0 }));
  }
}

export async function clearDatabaseTableAction(
  tableName: string
): Promise<{ success: boolean; error?: string; deletedCount?: number }> {
  // 1. Strict security verification: ONLY allow tables marked as isClearable: true
  const target = MONITORED_TABLES.find((t) => t.name === tableName);
  if (!target || !target.isClearable) {
    return {
      success: false,
      error: `Security Violation: Table "${tableName}" is protected core data and cannot be cleared.`,
    };
  }

  if (!isSupabaseConfigured()) {
    return { success: true, deletedCount: 0 };
  }

  try {
    const admin = createAdminClient();

    // Check count before deletion
    const { count: countBefore } = await admin
      .from(tableName as any)
      .select("*", { count: "exact", head: true });

    // Perform deletion using non-matching ID or condition
    let deleteError: any = null;
    if (tableName === "visitor_sessions") {
      const { error } = await admin.from("visitor_sessions").delete().neq("id", "00000000-0000-0000-0000-000000000000");
      deleteError = error;
    } else if (tableName === "chat_messages") {
      const { error } = await admin.from("chat_messages").delete().neq("id", "00000000-0000-0000-0000-000000000000");
      deleteError = error;
    } else if (tableName === "notifications") {
      const { error } = await admin.from("notifications").delete().neq("id", "00000000-0000-0000-0000-000000000000");
      deleteError = error;
    } else if (tableName === "push_subscriptions") {
      const { error } = await admin.from("push_subscriptions").delete().neq("id", "00000000-0000-0000-0000-000000000000");
      deleteError = error;
    } else if (tableName === "audit_logs") {
      const { error } = await admin.from("audit_logs").delete().neq("id", "00000000-0000-0000-0000-000000000000");
      deleteError = error;
    }

    if (deleteError) {
      return { success: false, error: deleteError.message };
    }

    // Log the maintenance action
    if (tableName !== "audit_logs") {
      await logAdminAction(
        "CLEAR_DATABASE_TABLE",
        tableName,
        "database_maintenance",
        { clearedRows: countBefore || 0 }
      );
    }

    revalidatePath("/admin/settings");
    return { success: true, deletedCount: countBefore || 0 };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to clear table" };
  }
}

