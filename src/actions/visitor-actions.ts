// src/actions/visitor-actions.ts
"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import { logAdminAction } from "@/lib/services/audit-service";
import { revalidatePath } from "next/cache";

export interface VisitorSessionRecord {
  id: string;
  visitor_id: string;
  display_name: string;
  is_restricted: boolean;
  restriction_reason: string | null;
  restricted_until: string | null;
  created_at: string;
  last_seen_at: string;
}

export async function getVisitorSessionsAction(): Promise<VisitorSessionRecord[]> {
  if (!isSupabaseConfigured()) {
    return [
      {
        id: "sess-1",
        visitor_id: "vis_demo_8f9a2b",
        display_name: "Maria Santos (Demo)",
        is_restricted: false,
        restriction_reason: null,
        restricted_until: null,
        created_at: new Date(Date.now() - 3600000 * 24).toISOString(),
        last_seen_at: new Date(Date.now() - 60000 * 5).toISOString(),
      },
    ];
  }

  try {
    const admin = createAdminClient();
    const { data, error } = await admin
      .from("visitor_sessions")
      .select("*")
      .order("last_seen_at", { ascending: false })
      .limit(100);

    if (error) {
      console.error("Error fetching visitor sessions:", error);
      return [];
    }

    return (data || []) as VisitorSessionRecord[];
  } catch (err) {
    console.error("Error in getVisitorSessionsAction:", err);
    return [];
  }
}

export async function recordVisitorSessionAction(
  visitorId: string,
  displayName?: string
): Promise<{ success: boolean; error?: string }> {
  if (!visitorId || !isSupabaseConfigured()) {
    return { success: true };
  }

  try {
    const admin = createAdminClient();
    const now = new Date().toISOString();

    const { error } = await admin.from("visitor_sessions").upsert(
      {
        visitor_id: visitorId,
        display_name: displayName?.trim() || "Anonymous Citizen",
        last_seen_at: now,
      },
      { onConflict: "visitor_id" }
    );

    if (error) {
      console.error("Error upserting visitor session:", error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function toggleVisitorRestrictionAction(
  visitorId: string,
  isRestricted: boolean,
  reason?: string,
  hours: number = 24
): Promise<{ success: boolean; error?: string }> {
  if (!isSupabaseConfigured()) {
    return { success: true };
  }

  try {
    const admin = createAdminClient();
    const restrictedUntil = isRestricted
      ? new Date(Date.now() + hours * 3600000).toISOString()
      : null;

    const { error } = await admin
      .from("visitor_sessions")
      .update({
        is_restricted: isRestricted,
        restriction_reason: isRestricted ? (reason || "Administrative restriction") : null,
        restricted_until: restrictedUntil,
      })
      .eq("visitor_id", visitorId);

    if (error) {
      return { success: false, error: error.message };
    }

    await logAdminAction(
      isRestricted ? "RESTRICT_VISITOR" : "UNRESTRICT_VISITOR",
      "visitor_session",
      visitorId,
      { isRestricted, reason, hours }
    );

    revalidatePath("/admin/users");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

